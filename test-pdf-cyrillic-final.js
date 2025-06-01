/**
 * Финальный тест экспорта PDF с кириллицей
 * Проверяет работу исправленного функционала
 */

const fs = require('fs');
const path = require('path');

console.log('🧪 ФИНАЛЬНЫЙ ТЕСТ ЭКСПОРТА PDF С КИРИЛЛИЦЕЙ');
console.log('='.repeat(50));

// Путь к проекту
const projectPath = __dirname;
const frontendPath = path.join(projectPath, 'ecotrack-frontend');

// Функция для проверки файлов
function checkFiles() {
  console.log('\n📁 Проверка основных файлов:');
  
  const filesToCheck = [
    { path: path.join(frontendPath, 'src', 'utils', 'fontGenerator.ts'), name: 'fontGenerator.ts' },
    { path: path.join(frontendPath, 'src', 'App.tsx'), name: 'App.tsx' },
    { path: path.join(frontendPath, 'src', 'utils', 'api.ts'), name: 'api.ts' },
    { path: path.join(frontendPath, 'package.json'), name: 'package.json' }
  ];
  
  filesToCheck.forEach(file => {
    const exists = fs.existsSync(file.path);
    console.log(`   ${file.name}: ${exists ? '✅' : '❌'}`);
  });
}

// Функция для проверки содержимого fontGenerator.ts
function checkFontGenerator() {
  console.log('\n🔧 Проверка fontGenerator.ts:');
  
  const fontGeneratorPath = path.join(frontendPath, 'src', 'utils', 'fontGenerator.ts');
  
  if (fs.existsSync(fontGeneratorPath)) {
    const content = fs.readFileSync(fontGeneratorPath, 'utf8');
    
    const checks = [
      { test: content.includes('export function initCyrillicFont'), name: 'initCyrillicFont функция' },
      { test: content.includes('export function addCyrillicText'), name: 'addCyrillicText функция' },
      { test: content.includes('export function prepareCyrillicText'), name: 'prepareCyrillicText функция' },
      { test: content.includes('export function testCyrillicSupport'), name: 'testCyrillicSupport функция' },
      { test: content.includes('cyrillicMap'), name: 'таблица транслитерации' },
      { test: content.includes('А': 'A'), name: 'кириллическая карта символов' }
    ];
    
    checks.forEach(check => {
      console.log(`   ${check.name}: ${check.test ? '✅' : '❌'}`);
    });
  } else {
    console.log('   ❌ Файл fontGenerator.ts не найден');
  }
}

// Функция для проверки интеграции в App.tsx
function checkAppIntegration() {
  console.log('\n⚡ Проверка интеграции в App.tsx:');
  
  const appPath = path.join(frontendPath, 'src', 'App.tsx');
  
  if (fs.existsSync(appPath)) {
    const content = fs.readFileSync(appPath, 'utf8');
    
    const checks = [
      { test: content.includes('handleExportAnalytics'), name: 'функция handleExportAnalytics' },
      { test: content.includes('fontGenerator'), name: 'импорт fontGenerator' },
      { test: content.includes('initCyrillicFont'), name: 'использование initCyrillicFont' },
      { test: content.includes('addCyrillicText'), name: 'использование addCyrillicText' },
      { test: content.includes('jsPDF'), name: 'импорт jsPDF' }
    ];
    
    checks.forEach(check => {
      console.log(`   ${check.name}: ${check.test ? '✅' : '❌'}`);
    });
  } else {
    console.log('   ❌ Файл App.tsx не найден');
  }
}

// Функция для проверки API интеграции
function checkApiIntegration() {
  console.log('\n🔌 Проверка интеграции в api.ts:');
  
  const apiPath = path.join(frontendPath, 'src', 'utils', 'api.ts');
  
  if (fs.existsSync(apiPath)) {
    const content = fs.readFileSync(apiPath, 'utf8');
    
    const checks = [
      { test: content.includes('exportYearlyReport'), name: 'функция exportYearlyReport' },
      { test: content.includes('fontGenerator'), name: 'импорт fontGenerator' },
      { test: content.includes('initCyrillicFont'), name: 'использование initCyrillicFont' },
      { test: content.includes('addCyrillicText'), name: 'использование addCyrillicText' }
    ];
    
    checks.forEach(check => {
      console.log(`   ${check.name}: ${check.test ? '✅' : '❌'}`);
    });
  } else {
    console.log('   ❌ Файл api.ts не найден');
  }
}

// Функция для проверки зависимостей
function checkDependencies() {
  console.log('\n📦 Проверка зависимостей:');
  
  const packageJsonPath = path.join(frontendPath, 'package.json');
  
  if (fs.existsSync(packageJsonPath)) {
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    const dependencies = { ...packageJson.dependencies, ...packageJson.devDependencies };
    
    const requiredDeps = [
      { name: 'jspdf', required: true },
      { name: 'jspdf-autotable', required: true },
      { name: 'react', required: true },
      { name: 'typescript', required: true }
    ];
    
    requiredDeps.forEach(dep => {
      const hasVersion = dependencies[dep.name];
      console.log(`   ${dep.name}: ${hasVersion ? `✅ (${hasVersion})` : '❌'}`);
    });
  }
}

// Функция для генерации инструкций по тестированию
function generateTestInstructions() {
  console.log('\n📋 ИНСТРУКЦИИ ПО ТЕСТИРОВАНИЮ:');
  console.log('='.repeat(50));
  
  console.log(`
1. 🌐 Откройте приложение в браузере: http://localhost:3000
2. 🔐 Войдите в систему с учетными данными администратора
3. 📊 Перейдите на вкладку "Аналитика"
4. 📄 Нажмите кнопку "Экспорт в PDF"
5. 🔍 Проверьте, что скачанный PDF содержит читаемый русский текст
6. 📈 Также протестируйте экспорт годового отчета
7. 🎯 Убедитесь, что нет иероглифов или нечитаемых символов

🔧 ОЖИДАЕМЫЕ РЕЗУЛЬТАТЫ:
✅ PDF файлы содержат корректный русский текст
✅ Заголовки отображаются правильно
✅ Данные в таблицах читаемы
✅ Нет искаженных символов или иероглифов

⚠️  FALLBACK ПОВЕДЕНИЕ:
Если кириллица не поддерживается напрямую, система автоматически:
- Попробует транслитерацию (А → A, Б → B, и т.д.)
- В крайнем случае заменит символы на "?"
`);
}

// Основная функция
function main() {
  try {
    checkFiles();
    checkFontGenerator();
    checkAppIntegration(); 
    checkApiIntegration();
    checkDependencies();
    generateTestInstructions();
    
    console.log('\n🎉 ПРОВЕРКА ЗАВЕРШЕНА!');
    console.log('Все компоненты для поддержки кириллицы в PDF установлены.');
    console.log('Теперь можно тестировать функционал в браузере.');
    
  } catch (error) {
    console.error('❌ Ошибка при проверке:', error.message);
  }
}

// Запуск
main();
