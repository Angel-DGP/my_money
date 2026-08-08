const fs = require('fs');

const files = [
  'apps/web/src/features/transactions/ui/TransactionForm/TransactionForm.tsx',
  'apps/web/src/features/goals/ui/AddProgressForm.tsx',
  'apps/web/src/features/goals/ui/GoalForm/GoalForm.tsx',
  'apps/web/src/features/catalogs/ui/InstitutionForm.tsx',
  'apps/web/src/features/catalogs/ui/ProductServiceForm.tsx',
  'apps/web/src/features/catalogs/ui/CardForm.tsx',
  'apps/web/src/features/catalogs/ui/SubscriptionForm.tsx',
  'apps/web/src/features/automations/ui/AutoRuleForm.tsx',
  'apps/web/src/features/budgets/ui/BudgetForm/BudgetForm.tsx',
  'apps/web/src/features/accounts/ui/AccountForm/AccountForm.tsx'
];

files.forEach(file => {
  try {
    let content = fs.readFileSync(file, 'utf8');
    
    // Extract a name based on the file to use as form ID
    const formId = file.split('/').pop().replace('.tsx', '').toLowerCase() + '-form';

    // Replace <FormLayout onSubmit=...> with <FormLayout id="{formId}" onSubmit=...>
    // Wait, some might have other props.
    content = content.replace(/<FormLayout(\s+onSubmit=)/g, '<FormLayout id="' + formId + '"$1');
    content = content.replace(/<FormLayout(\s+className=)/g, '<FormLayout id="' + formId + '"$1');

    // Replace <Button type="submit" ...> with <Button type="submit" form="{formId}" ...>
    content = content.replace(/<Button([^>]*type=["']submit["'][^>]*)>/g, '<Button$1 form="' + formId + '">');
    
    fs.writeFileSync(file, content);
    console.log('Fixed: ' + file);
  } catch (e) {
    console.error('Error in ' + file + ': ' + e.message);
  }
});
