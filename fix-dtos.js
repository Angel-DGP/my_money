const fs = require('fs');
const path = require('path');

function getFiles(dir, files = []) {
  const fileList = fs.readdirSync(dir);
  for (const file of fileList) {
    const name = `${dir}/${file}`;
    if (fs.statSync(name).isDirectory()) {
      getFiles(name, files);
    } else {
      if (name.endsWith('.dto.ts')) {
        files.push(name);
      }
    }
  }
  return files;
}

const dtoFiles = getFiles('apps/api/src');

dtoFiles.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let changed = false;
  
  // Expresión regular para encontrar propiedades de clase sin inicializar
  // match: "  propertyName: type;" -> "  propertyName!: type;"
  const lines = content.split('\n');
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    // Evitar comentarios, decoradores, etc.
    if (/^\s+[a-zA-Z0-9_]+(\??):\s/.test(line)) {
      if (!line.includes('?')) {
        lines[i] = line.replace(/^(\s+[a-zA-Z0-9_]+):\s/, '$1!: ');
        changed = true;
      }
    }
  }

  if (changed) {
    fs.writeFileSync(file, lines.join('\n'), 'utf8');
    console.log('Fixed:', file);
  }
});
