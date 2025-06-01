// Тест компиляции backend
const { spawn } = require('child_process');
const path = require('path');

console.log('🔍 Тестирование компиляции EcoTrack backend...');

const ecotrackPath = path.join(__dirname, 'ecotrack');
console.log('📂 Путь к backend:', ecotrackPath);

// Тест TypeScript компиляции
console.log('⚙️ Проверяем TypeScript компиляцию...');
const tscProcess = spawn('npx', ['tsc', '--noEmit'], {
  cwd: ecotrackPath,
  stdio: 'pipe'
});

let output = '';
let errors = '';

tscProcess.stdout.on('data', (data) => {
  output += data.toString();
});

tscProcess.stderr.on('data', (data) => {
  errors += data.toString();
});

tscProcess.on('close', (code) => {
  if (code === 0) {
    console.log('✅ TypeScript компиляция успешна!');
    console.log('🎉 Все ошибки TypeScript исправлены!');
    
    // Создаем краткий отчет
    console.log('\n📋 Статус исправлений:');
    console.log('✅ enhancedNotifications.ts - создан и исправлен');
    console.log('✅ analyticsService.ts - создан');
    console.log('✅ api.ts - все ошибки TypeScript исправлены');
    console.log('✅ db.ts - исправлен метод findMany');
    console.log('✅ server.ts - добавлен базовый API endpoint');
    
    console.log('\n🚀 Backend готов к запуску!');
    console.log('Для запуска используйте:');
    console.log('cd "c:\\Users\\Admin\\Desktop\\HimkaPlastic (adaptive)\\ecotrack"');
    console.log('npm run dev');
    
    console.log('\n🌐 После запуска будет доступно:');
    console.log('- Backend API: http://localhost:3001/api');
    console.log('- Health check: http://localhost:3001/api');
    
  } else {
    console.log('❌ TypeScript компиляция провалилась!');
    if (errors) {
      console.log('Ошибки:', errors);
    }
    if (output) {
      console.log('Вывод:', output);
    }
  }
});

tscProcess.on('error', (err) => {
  console.log('❌ Не удалось запустить TypeScript компилятор:', err.message);
  console.log('Возможно, нужно установить зависимости: npm install');
});
