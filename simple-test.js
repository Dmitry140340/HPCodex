console.log('Тест запущен');
console.log('Проверяем файлы...');

const fs = require('fs');
const path = require('path');

const frontendPath = path.join(__dirname, 'ecotrack-frontend');
const fontGeneratorPath = path.join(frontendPath, 'src', 'utils', 'fontGenerator.ts');

console.log('Frontend путь:', frontendPath);
console.log('fontGenerator путь:', fontGeneratorPath);
console.log('fontGenerator существует:', fs.existsSync(fontGeneratorPath));

if (fs.existsSync(fontGeneratorPath)) {
  const content = fs.readFileSync(fontGeneratorPath, 'utf8');
  console.log('Размер файла:', content.length);
  console.log('Содержит initCyrillicFont:', content.includes('initCyrillicFont'));
  console.log('Содержит addCyrillicText:', content.includes('addCyrillicText'));
}

console.log('Тест завершен');
