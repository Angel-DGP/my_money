const http = require("http");

// ── HTTP helpers ──────────────────────────────────────────────────────────────

function makeRequest(options, postData) {
  return new Promise((resolve, reject) => {
    const r = http.request(options, (res) => {
      let body = "";
      res.on("data", (c) => (body += c));
      res.on("end", () =>
        resolve({ statusCode: res.statusCode, headers: res.headers, body }),
      );
    });
    r.on("error", reject);
    if (postData) r.write(postData);
    r.end();
  });
}

const HOST = "localhost";
const PORT = 3000;
let H = {};

async function req(method, path, data) {
  const headers = data
    ? { ...H, "Content-Type": "application/json" }
    : { ...H };
  return makeRequest(
    { hostname: HOST, port: PORT, path, method, headers },
    data ? JSON.stringify(data) : null,
  );
}

// Writes that trigger @OnEvent handlers need a small delay before asserting budget state
async function write(method, path, data) {
  const res = await req(method, path, data);
  await new Promise((r) => setTimeout(r, 300));
  return res;
}

function parse(res) {
  return JSON.parse(res.body);
}
function id(res) {
  return parse(res).data?.id ?? parse(res).id;
}

function assert(cond, msg) {
  if (!cond) throw new Error(msg);
}
function assertStatus(res, expected, ctx) {
  assert(
    res.statusCode === expected,
    `[${ctx}] Expected ${expected}, got ${res.statusCode}: ${res.body}`,
  );
}

function isoDate(d) {
  return d.toISOString().split("T")[0];
}
function firstOfMonth(offset = 0) {
  const d = new Date();
  d.setDate(1);
  d.setMonth(d.getMonth() + offset);
  return d;
}

// ── Main ──────────────────────────────────────────────────────────────────────

async function run() {
  console.log("=== Budgets E2E Verification ===\n");
  try {
    // Login
    const lr = await req("POST", "/auth/login", {
      email: "test@example.com",
      password: "password123",
    });
    assert(lr.headers["set-cookie"], `Login failed: ${lr.body}`);
    H = {
      "Content-Type": "application/json",
      Cookie: lr.headers["set-cookie"][0].split(";")[0],
    };
    console.log("✅ Login");

    // Setup
    const ts = Date.now();
    const accId = id(
      await req("POST", "/accounts", {
        name: `BudgetAcc${ts}`,
        type: "CHECKING",
        currency: "USD",
        initial_balance: "9999.00",
      }),
    );
    const catA = id(
      await req("POST", "/api/v1/categories", {
        name: `FoodE2E${ts}`,
        type: "EXPENSE",
      }),
    );
    const catB = id(
      await req("POST", "/api/v1/categories", {
        name: `TransportE2E${ts}`,
        type: "EXPENSE",
      }),
    );
    console.log(
      `✅ Setup: acc(${accId.slice(-4)}), catA(${catA.slice(-4)}), catB(${catB.slice(-4)})`,
    );

    const today = isoDate(new Date());
    const monthStart = isoDate(firstOfMonth());
    const nextMonthStart = isoDate(firstOfMonth(1));
    const nextMonthMid = isoDate(
      new Date(firstOfMonth(1).getTime() + 14 * 86400000),
    );

    // ── 1. CRUD básico ────────────────────────────────────────────────────────
    console.log("\n--- 1. CRUD básico ---");
    const bRes = await req("POST", "/budgets", {
      category_id: catA,
      period: "MONTHLY",
      amount: "500.00",
      currency: "USD",
      start_date: monthStart,
      alert_threshold: 80,
    });
    assertStatus(bRes, 201, "create budget");
    const bData = parse(bRes);
    const budgetId = bData.id;
    assert(bData.status === "ACTIVE", `Expected ACTIVE, got ${bData.status}`);
    assert(bData.alert_threshold === 80, "threshold");
    assert(
      parseFloat(bData.executed_amount.value) === 0,
      "executed starts at 0",
    );
    assert(bData.end_date > bData.start_date, "end_date > start_date");
    console.log(
      `  ✅ Create: budget(${budgetId.slice(-4)}), end_date=${bData.end_date}`,
    );

    assertStatus(await req("GET", `/budgets/${budgetId}`), 200, "GET by ID");
    console.log("  ✅ GET by ID");

    const patchAmtRes = await req("PATCH", `/budgets/${budgetId}`, {
      amount: "700.00",
    });
    assertStatus(patchAmtRes, 200, "PATCH amount");
    assert(
      parseFloat(parse(patchAmtRes).amount.value) === 700,
      "amount updated",
    );
    console.log("  ✅ PATCH amount 500→700");

    const patchThrRes = await req("PATCH", `/budgets/${budgetId}`, {
      alert_threshold: 90,
    });
    assertStatus(patchThrRes, 200, "PATCH threshold");
    assert(parse(patchThrRes).alert_threshold === 90, "threshold updated");
    console.log("  ✅ PATCH alert_threshold 80→90");

    const badRes = await req("PATCH", `/budgets/${budgetId}`, {
      category_id: catB,
    });
    assert(
      badRes.statusCode === 400,
      `Expected 400 for immutable field, got ${badRes.statusCode}`,
    );
    console.log("  ✅ PATCH immutable field → 400");

    // Reset to 500/80 for rest of tests
    await req("PATCH", `/budgets/${budgetId}`, {
      amount: "500.00",
      alert_threshold: 80,
    });

    // ── 2. Unicidad BGT-R01 ───────────────────────────────────────────────────
    console.log("\n--- 2. Unicidad BGT-R01 ---");
    const dupRes = await req("POST", "/budgets", {
      category_id: catA,
      period: "MONTHLY",
      amount: "300.00",
      currency: "USD",
      start_date: monthStart,
    });
    assert(
      dupRes.statusCode === 409,
      `Expected 409 for duplicate, got ${dupRes.statusCode}: ${dupRes.body}`,
    );
    assert(
      parse(dupRes).code === "BGT_003",
      `Expected BGT_003, got ${parse(dupRes).code}`,
    );
    console.log("  ✅ Duplicate ACTIVE budget → 409 BGT_003");

    // ── 3. Acumulación via eventos ────────────────────────────────────────────
    console.log("\n--- 3. Acumulação de executed_amount ---");
    const t1Res = await write("POST", "/transactions", {
      account_id: accId,
      category_id: catA,
      type: "EXPENSE",
      amount: "200.00",
      date: today,
    });
    assertStatus(t1Res, 201, "expense 200");
    const t1Id = id(t1Res);

    let b = parse(await req("GET", `/budgets/${budgetId}`));
    assert(
      parseFloat(b.executed_amount.value) === 200,
      `executed should be 200, got ${b.executed_amount.value}`,
    );
    assert(
      parseFloat(b.remaining_amount.value) === 300,
      `remaining should be 300, got ${b.remaining_amount.value}`,
    );
    assert(
      Math.abs(b.execution_percentage - 40) < 0.1,
      `pct should be ~40, got ${b.execution_percentage}`,
    );
    console.log("  ✅ executed_amount=200 after EXPENSE of 200");

    await write("DELETE", `/transactions/${t1Id}`);
    b = parse(await req("GET", `/budgets/${budgetId}`));
    assert(
      parseFloat(b.executed_amount.value) === 0,
      `executed should be 0 after delete, got ${b.executed_amount.value}`,
    );
    console.log("  ✅ executed_amount=0 after DELETE");

    // ── 4. Update amount → executionPercentage recalculates ──────────────────
    console.log("\n--- 4. Update amount recalculates execution_percentage ---");
    const t2Res = await write("POST", "/transactions", {
      account_id: accId,
      category_id: catA,
      type: "EXPENSE",
      amount: "200.00",
      date: today,
    });
    const t2Id = id(t2Res);

    b = parse(await req("GET", `/budgets/${budgetId}`));
    assert(
      Math.abs(b.execution_percentage - 40) < 0.1,
      `pct should be 40%, got ${b.execution_percentage}`,
    );

    await req("PATCH", `/budgets/${budgetId}`, { amount: "1000.00" });
    b = parse(await req("GET", `/budgets/${budgetId}`));
    assert(
      Math.abs(b.execution_percentage - 20) < 0.1,
      `pct should be 20% after amount change, got ${b.execution_percentage}`,
    );
    console.log(
      "  ✅ execution_percentage recalculates after amount change (40%→20%)",
    );

    await req("PATCH", `/budgets/${budgetId}`, { amount: "500.00" });
    await write("DELETE", `/transactions/${t2Id}`);
    // budget now at executed_amount=0

    // ── 5. Transacción fuera del período ──────────────────────────────────────
    console.log("\n--- 5. Transacción fuera del período ---");
    const tInRes = await write("POST", "/transactions", {
      account_id: accId,
      category_id: catA,
      type: "EXPENSE",
      amount: "200.00",
      date: today,
    });
    const tInId = id(tInRes);
    const tOutRes = await write("POST", "/transactions", {
      account_id: accId,
      category_id: catA,
      type: "EXPENSE",
      amount: "100.00",
      date: nextMonthMid,
    });
    const tOutId = id(tOutRes);

    b = parse(await req("GET", `/budgets/${budgetId}`));
    assert(
      parseFloat(b.executed_amount.value) === 200,
      `executed should be 200 (out-of-period ignored), got ${b.executed_amount.value}`,
    );
    console.log("  ✅ Out-of-period expense ignored by budget");

    await write("DELETE", `/transactions/${tInId}`);
    await write("DELETE", `/transactions/${tOutId}`);
    // budget now at executed_amount=0

    // ── 6. Over-budget ────────────────────────────────────────────────────────
    console.log("\n--- 6. Over-budget ---");
    const tOv1 = id(
      await write("POST", "/transactions", {
        account_id: accId,
        category_id: catA,
        type: "EXPENSE",
        amount: "200.00",
        date: today,
      }),
    );
    const tOv2 = id(
      await write("POST", "/transactions", {
        account_id: accId,
        category_id: catA,
        type: "EXPENSE",
        amount: "450.00",
        date: today,
      }),
    );
    // 200 + 450 = 650 > 500

    b = parse(await req("GET", `/budgets/${budgetId}`));
    assert(
      parseFloat(b.executed_amount.value) === 650,
      `executed should be 650, got ${b.executed_amount.value}`,
    );
    assert(b.is_over_budget === true, "should be over budget");
    assert(
      parseFloat(b.remaining_amount.value) === -150,
      `remaining should be -150, got ${b.remaining_amount.value}`,
    );
    assert(
      parseFloat(b.available_amount.value) === 0,
      `available should be 0, got ${b.available_amount.value}`,
    );
    assert(
      Math.abs(b.execution_percentage - 130) < 0.1,
      `pct should be 130%, got ${b.execution_percentage}`,
    );
    console.log(
      "  ✅ Over-budget: executed=650, remaining=-150, available=0, pct=130%",
    );

    await write("DELETE", `/transactions/${tOv1}`);
    await write("DELETE", `/transactions/${tOv2}`);
    // budget now at executed_amount=0

    // ── 7. Threshold crossing (state verification) ────────────────────────────
    console.log("\n--- 7. Threshold crossing ---");
    // budget=500, threshold=80% → crosses at 400
    const tTh1 = id(
      await write("POST", "/transactions", {
        account_id: accId,
        category_id: catA,
        type: "EXPENSE",
        amount: "350.00",
        date: today,
      }),
    );
    b = parse(await req("GET", `/budgets/${budgetId}`));
    assert(!b.is_over_budget, "not yet over budget after 350");

    const tTh2 = id(
      await write("POST", "/transactions", {
        account_id: accId,
        category_id: catA,
        type: "EXPENSE",
        amount: "60.00",
        date: today,
      }),
    );
    // 350 + 60 = 410 = 82% — threshold crossed
    b = parse(await req("GET", `/budgets/${budgetId}`));
    assert(
      parseFloat(b.executed_amount.value) === 410,
      `executed should be 410, got ${b.executed_amount.value}`,
    );
    assert(!b.is_over_budget, "still not over budget at 82%");
    console.log("  ✅ Threshold crossed (82%): budget ACTIVE, not over-budget");

    await write("DELETE", `/transactions/${tTh1}`);
    await write("DELETE", `/transactions/${tTh2}`);

    // ── 8. TransactionDateChanged cruza períodos ──────────────────────────────
    console.log("\n--- 8. TransactionDateChanged cruza períodos ---");
    // Use previous month as target: a past date that respects TRX-R03 (max +7 days future)
    // Current month expense → move to previous month → current month budget↓, prev month budget↑
    const prevMonthStart = isoDate(firstOfMonth(-1));
    const prevMonthMid = isoDate(
      new Date(firstOfMonth(-1).getTime() + 14 * 86400000),
    );

    const prevBudgetRes = await req("POST", "/budgets", {
      category_id: catA,
      period: "MONTHLY",
      amount: "500.00",
      currency: "USD",
      start_date: prevMonthStart,
    });
    assertStatus(prevBudgetRes, 201, "prev month budget");
    const prevBudgetId = id(prevBudgetRes);

    const tDateRes = await write("POST", "/transactions", {
      account_id: accId,
      category_id: catA,
      type: "EXPENSE",
      amount: "150.00",
      date: today,
    });
    const tDateId = id(tDateRes);

    b = parse(await req("GET", `/budgets/${budgetId}`));
    assert(
      parseFloat(b.executed_amount.value) === 150,
      `current month should be 150, got ${b.executed_amount.value}`,
    );

    // Move expense to previous month (past date — always valid per TRX-R03)
    await write("PATCH", `/transactions/${tDateId}`, { date: prevMonthMid });
    await new Promise((r) => setTimeout(r, 500));

    b = parse(await req("GET", `/budgets/${budgetId}`));
    assert(
      parseFloat(b.executed_amount.value) === 0,
      `current month should be 0 after date change, got ${b.executed_amount.value}`,
    );

    const pb = parse(await req("GET", `/budgets/${prevBudgetId}`));
    assert(
      parseFloat(pb.executed_amount.value) === 150,
      `prev month should be 150 after date change, got ${pb.executed_amount.value}`,
    );
    console.log("  ✅ Date change: current month↓, prev month↑");

    await write("DELETE", `/transactions/${tDateId}`);
    await req("POST", `/budgets/${prevBudgetId}/deactivate`);

    // ── 9. TransactionCategoryChanged entre presupuestos ─────────────────────
    console.log("\n--- 9. TransactionCategoryChanged entre presupuestos ---");
    const catBBudgetRes = await req("POST", "/budgets", {
      category_id: catB,
      period: "MONTHLY",
      amount: "300.00",
      currency: "USD",
      start_date: monthStart,
    });
    assertStatus(catBBudgetRes, 201, "catB budget");
    const catBBudgetId = id(catBBudgetRes);

    const tCatRes = await write("POST", "/transactions", {
      account_id: accId,
      category_id: catA,
      type: "EXPENSE",
      amount: "100.00",
      date: today,
    });
    const tCatId = id(tCatRes);

    b = parse(await req("GET", `/budgets/${budgetId}`));
    assert(
      parseFloat(b.executed_amount.value) === 100,
      `catA should be 100, got ${b.executed_amount.value}`,
    );

    await write("PATCH", `/transactions/${tCatId}`, { category_id: catB });

    b = parse(await req("GET", `/budgets/${budgetId}`));
    assert(
      parseFloat(b.executed_amount.value) === 0,
      `catA should be 0 after cat change, got ${b.executed_amount.value}`,
    );
    const bCatB = parse(await req("GET", `/budgets/${catBBudgetId}`));
    assert(
      parseFloat(bCatB.executed_amount.value) === 100,
      `catB should be 100 after cat change, got ${bCatB.executed_amount.value}`,
    );
    console.log("  ✅ Category change: catA↓, catB↑");

    await write("DELETE", `/transactions/${tCatId}`);
    await req("POST", `/budgets/${catBBudgetId}/deactivate`);

    // ── 10. Máquina de estados ────────────────────────────────────────────────
    console.log("\n--- 10. Máquina de estados ---");
    assertStatus(
      await req("POST", `/budgets/${budgetId}/deactivate`),
      200,
      "deactivate",
    );
    assert(
      parse(await req("GET", `/budgets/${budgetId}`)).status === "INACTIVE",
      "INACTIVE",
    );
    console.log("  ✅ ACTIVE → INACTIVE");

    assertStatus(
      await req("POST", `/budgets/${budgetId}/reactivate`),
      200,
      "reactivate",
    );
    assert(
      parse(await req("GET", `/budgets/${budgetId}`)).status === "ACTIVE",
      "ACTIVE",
    );
    console.log("  ✅ INACTIVE → ACTIVE");

    await req("POST", `/budgets/${budgetId}/deactivate`);
    const deact2 = await req("POST", `/budgets/${budgetId}/deactivate`);
    assert(deact2.statusCode === 409, `Expected 409, got ${deact2.statusCode}`);
    console.log("  ✅ INACTIVE → deactivate → 409");

    await req("POST", `/budgets/${budgetId}/reactivate`);

    // ── 11. Reactivación con conflicto de unicidad ────────────────────────────
    console.log("\n--- 11. Reactivación con conflicto BGT_003 ---");
    await req("POST", `/budgets/${budgetId}/deactivate`);
    const conflictId = id(
      await req("POST", "/budgets", {
        category_id: catA,
        period: "MONTHLY",
        amount: "400.00",
        currency: "USD",
        start_date: monthStart,
      }),
    );

    const reactConflict = await req("POST", `/budgets/${budgetId}/reactivate`);
    assert(
      reactConflict.statusCode === 409,
      `Expected 409, got ${reactConflict.statusCode}`,
    );
    assert(
      parse(reactConflict).code === "BGT_003",
      `Expected BGT_003, got ${parse(reactConflict).code}`,
    );
    console.log("  ✅ Reactivation with conflict → 409 BGT_003");

    await req("POST", `/budgets/${conflictId}/deactivate`);
    assertStatus(
      await req("POST", `/budgets/${budgetId}/reactivate`),
      200,
      "reactivate after removing conflict",
    );
    console.log("  ✅ Reactivation succeeds after conflict removed");

    // ── 12. Lazy expiration ───────────────────────────────────────────────────
    console.log("\n--- 12. Lazy expiration ---");
    const expBudgetId = id(
      await req("POST", "/budgets", {
        category_id: catB,
        period: "MONTHLY",
        amount: "200.00",
        currency: "USD",
        start_date: "2024-01-01",
      }),
    );
    const expGet = parse(await req("GET", `/budgets/${expBudgetId}`));
    assert(
      expGet.status === "EXPIRED",
      `Expected EXPIRED, got ${expGet.status}`,
    );
    console.log("  ✅ Past budget → lazy expiration → EXPIRED on GET");

    // ── 13. Reactivar EXPIRED → 409 ──────────────────────────────────────────
    console.log("\n--- 13. Reactivar EXPIRED → 409 ---");
    const reactExpired = await req(
      "POST",
      `/budgets/${expBudgetId}/reactivate`,
    );
    assert(
      reactExpired.statusCode === 409,
      `Expected 409, got ${reactExpired.statusCode}: ${reactExpired.body}`,
    );
    console.log("  ✅ EXPIRED → reactivate → 409");

    // ── 14. GET filtro por status ─────────────────────────────────────────────
    console.log("\n--- 14. GET /budgets filtro por status ---");
    const activeList = parse(await req("GET", "/budgets?status=ACTIVE"));
    assert(Array.isArray(activeList.data), "data should be array");
    assert(
      activeList.data.every((x) => x.status === "ACTIVE"),
      "all should be ACTIVE",
    );
    console.log(
      `  ✅ ?status=ACTIVE returns only ACTIVE (${activeList.data.length} items)`,
    );

    const expiredList = parse(await req("GET", "/budgets?status=EXPIRED"));
    assert(
      expiredList.data.some((x) => x.id === expBudgetId),
      "expired budget in EXPIRED list",
    );
    console.log(`  ✅ ?status=EXPIRED includes the expired budget`);

    console.log("\n🏆 ALL BUDGET E2E CHECKS PASSED");
  } catch (err) {
    console.error("\n❌ Test failed:", err.message || err);
    process.exit(1);
  }
}

run();
