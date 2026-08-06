const fs = require('fs');
const path = require('path');

function replaceInFile(filePath, replacements) {
  let content = fs.readFileSync(filePath, 'utf8');
  for (const { from, to } of replacements) {
    content = content.replace(from, to);
  }
  fs.writeFileSync(filePath, content, 'utf8');
}

replaceInFile('apps/web/src/widgets/accounts/AccountsListWidget.tsx', [
  { from: 'useState<Account | null>(null)', to: 'useState<Account | undefined>(undefined)' },
  { from: 'setSelectedAccount(null)', to: 'setSelectedAccount(undefined)' },
  { from: 'setSelectedAccount(null)', to: 'setSelectedAccount(undefined)' },
]);

replaceInFile('apps/web/src/widgets/categories/CategoriesListWidget.tsx', [
  { from: 'useState<Category | null>(null)', to: 'useState<Category | undefined>(undefined)' },
  { from: 'setSelectedCategory(null)', to: 'setSelectedCategory(undefined)' },
  { from: 'setSelectedCategory(null)', to: 'setSelectedCategory(undefined)' },
]);

replaceInFile('apps/web/src/widgets/transactions/TransactionsListWidget.tsx', [
  { from: 'useState<Transaction | null>(null)', to: 'useState<Transaction | undefined>(undefined)' },
  { from: 'setSelectedTransaction(null)', to: 'setSelectedTransaction(undefined)' },
  { from: 'setSelectedTransaction(null)', to: 'setSelectedTransaction(undefined)' },
  { from: 'name="trash-2"', to: 'name="trash"' },
]);

replaceInFile('packages/ui/src/components/composite/TransactionCard/TransactionCard.tsx', [
  { from: 'variant={type === \'expense\' ? \'error\' : type === \'income\' ? \'success\' : type === \'transfer\' ? \'warning\' : \'default\'}', to: 'variant={type === \'expense\' ? \'error\' : type === \'income\' ? \'success\' : type === \'transfer\' ? \'warning\' : \'neutral\'}' },
]);

replaceInFile('packages/ui/src/components/feedback/Toast/Toast.tsx', [
  { from: 'name="alert-circle"', to: 'name="alert-triangle"' },
]);

replaceInFile('packages/ui/src/components/navigation/Tabs/Tabs.tsx', [
  { from: 'if (nextTab && !nextTab.disabled)', to: 'if (nextTab && !nextTab.disabled)' }, // wait, how was this written? I will just skip this and use sed or manual fix.
]);
