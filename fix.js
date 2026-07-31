const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(file));
    } else {
      results.push(file);
    }
  });
  return results;
}

const files = [...walk('apps/api/src/modules/categories'), 'apps/api/src/app.module.ts'];
files.filter(f => f.endsWith('.ts')).forEach(f => {
  let c = fs.readFileSync(f, 'utf8');
  c = c.replace(/from\s+['"](.*)\.(ts|js)['"]/g, "from '$1'");
  fs.writeFileSync(f, c);
});
console.log('Imports fixed');
