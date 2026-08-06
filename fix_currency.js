
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
    } else if (file.endsWith('.spec.ts')) {
      results.push(file);
    }
  });
  return results;
}
const files = walk('apps/api/src');
files.forEach(f => {
  let content = fs.readFileSync(f, 'utf8');
  if (content.includes('\'USD\'')) {
    content = content.replace(/'USD'/g, 'Currency.USD');
    if (content.includes('import { Money } from')) {
      content = content.replace(/import \{ Money \} from '@mymoney\/shared';/, 'import { Money, Currency } from \'@mymoney/shared\';');
    } else if (!content.includes('Currency')) {
      content = 'import { Currency } from \'@mymoney/shared\';\n' + content;
    }
    fs.writeFileSync(f, content);
    console.log('Fixed Currency in', f);
  }
});

