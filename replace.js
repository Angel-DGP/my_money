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

const files = [...walk('apps/api/src/modules/accounts/domain/events'), ...walk('apps/api/src/modules/categories/domain')];

files.forEach(f => {
  if (f.endsWith('.ts') && f.includes('event')) {
    let c = fs.readFileSync(f, 'utf8');
    if (c.includes('extends DomainEventProps')) {
      c = c.replace(/extends DomainEventProps/g, "extends Omit<DomainEventProps, 'aggregateId'>");
      c = c.replace(/super\(props\);/g, 'super({ ...props, aggregateId: props.accountId });');
      fs.writeFileSync(f, c);
      console.log('Replaced in ' + f);
    } else if (f.includes('category.events.ts')) {
      c = c.replace(/export interface CategoryDeletedEventProps \{/g, "import { DomainEventProps } from '@mymoney/shared';\n\nexport interface CategoryDeletedEventProps extends Omit<DomainEventProps, 'aggregateId'> {");
      c = c.replace(/import { DomainEvent } from '@mymoney/shared';\n/g, "import { DomainEvent } from '@mymoney/shared';\n");
      c = c.replace(/super\(\{\s*correlationId: props\.correlationId,\s*requestId: props\.requestId,\s*\}\);/m, 'super({ ...props, aggregateId: props.categoryId });');
      c = c.replace(/props: CategoryDeletedEventProps & \{ correlationId\?: string; requestId\?: string \}/, 'props: CategoryDeletedEventProps');
      fs.writeFileSync(f, c);
      console.log('Replaced category event in ' + f);
    }
  }
});
