const fs = require('fs');
const path = require('path');

function walk(dir, filelist = []) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    if (file === 'node_modules' || file === 'dist' || file === '.git') continue;
    const filepath = path.join(dir, file);
    if (fs.statSync(filepath).isDirectory()) {
      walk(filepath, filelist);
    } else {
      if (filepath.endsWith('.spec.ts')) {
        filelist.push(filepath);
      }
    }
  }
  return filelist;
}

const specs = walk('./apps/api/src');
for (const spec of specs) {
  let content = fs.readFileSync(spec, 'utf8');
  if (content.includes(': any') || content.includes('(req: any)') || content.includes('@Req() req: any')) {
    content = content.replace(/let mock([a-zA-Z]+): any;/g, 'let mock$1: Record<string, jest.Mock>;');
    content = content.replace(/let mockBudget: any;/g, 'let mockBudget: Record<string, unknown>;');
    content = content.replace(/let mockExpiredBudget: any;/g, 'let mockExpiredBudget: Record<string, unknown>;');
    content = content.replace(/mockBudget\.deactivate\.mockImplementation/g, '(mockBudget.deactivate as jest.Mock).mockImplementation');
    content = content.replace(/mockBudget\.deactivate/g, '(mockBudget.deactivate as jest.Mock)');
    content = content.replace(/mockBudget\.clearDomainEvents/g, '(mockBudget.clearDomainEvents as jest.Mock)');
    content = content.replace(/mockBudget\.reactivate/g, '(mockBudget.reactivate as jest.Mock)');
    content = content.replace(/mockBudget\.updateAmount/g, '(mockBudget.updateAmount as jest.Mock)');
    content = content.replace(/mockBudget\.updateAlertThreshold/g, '(mockBudget.updateAlertThreshold as jest.Mock)');
    content = content.replace(/mockBudget\.updateSettings/g, '(mockBudget.updateSettings as jest.Mock)');
    
    // Auth and catalogs specs
    content = content.replace(/\(req: any\)/g, '(req: Record<string, unknown>)');
    content = content.replace(/req\.user\.id/g, '(req.user as Record<string, unknown>).id');
    content = content.replace(/@Req\(\) req: any/g, '@Req() req: Record<string, unknown>');
    content = content.replace(/req\.user\?/g, '(req.user as Record<string, unknown>)?');
    
    fs.writeFileSync(spec, content);
    console.log('Fixed', spec);
  }
}
