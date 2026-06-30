const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walkDir(dirPath, callback) : callback(path.join(dir, f));
  });
}

walkDir('p:/oggenesis/src', function(filePath) {
  if (filePath.endsWith('.tsx') || filePath.endsWith('.ts')) {
    let content = fs.readFileSync(filePath, 'utf8');
    let original = content;
    
    // Replace p-5 with p-6
    content = content.replace(/p-5/g, 'p-6');
    // Replace p-3 with p-4
    content = content.replace(/p-3/g, 'p-4');
    // Replace gap-5 with gap-4
    content = content.replace(/gap-5/g, 'gap-6');
    // Replace gap-2.5 with gap-2
    content = content.replace(/gap-2\.5/g, 'gap-2');
    
    if (original !== content) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log('Updated: ' + filePath);
    }
  }
});
