const fs = require('fs');
const files = [
  'apps/api/src/modules/goals/presentation/dtos/goal.dto.ts',
  'apps/api/src/modules/budgets/presentation/dtos/budget.dto.ts',
  'apps/api/src/modules/transactions/application/dtos/transaction.dto.ts'
];
files.forEach(f => {
  if (fs.existsSync(f)) {
    let c = fs.readFileSync(f, 'utf8');
    c = c.replace(/value!: string;/g, 'value: string;');
    c = c.replace(/currency!: string;/g, 'currency: string;');
    c = c.replace(/total_items!: number;/g, 'total_items: number;');
    c = c.replace(/total_pages!: number;/g, 'total_pages: number;');
    c = c.replace(/current_page!: number;/g, 'current_page: number;');
    c = c.replace(/per_page!: number;/g, 'per_page: number;');
    c = c.replace(/has_next!: boolean;/g, 'has_next: boolean;');
    c = c.replace(/has_previous!: boolean;/g, 'has_previous: boolean;');
    fs.writeFileSync(f, c);
    console.log('Fixed types in', f);
  }
});
