// Простой скрипт запуска сервера
// Запускает сервер без компиляции TypeScript

const path = require('path');
process.chdir(path.join(__dirname, 'ecotrack'));

const { spawn } = require('child_process');

console.log('🚀 Запуск HimkaPlastic EcoTrack Backend Server...\n');

// Запускаем ts-node с полным путем
const tsNode = spawn('npx', ['ts-node', 'src/index.ts'], {
  stdio: 'inherit',
  shell: true,
  cwd: path.join(__dirname, 'ecotrack')
});

tsNode.on('error', (err) => {
  console.error('❌ Ошибка запуска сервера:', err.message);
});

tsNode.on('close', (code) => {
  console.log(`\n📊 Сервер завершен с кодом ${code}`);
});
