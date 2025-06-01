// Быстрая проверка статуса серверов

const fetch = require('node-fetch');

async function checkServers() {
  console.log('🔍 БЫСТРАЯ ПРОВЕРКА СЕРВЕРОВ');
  console.log('============================');
  
  // Проверка backend
  try {
    const response = await fetch('http://localhost:3001/api/health', { timeout: 3000 });
    if (response.ok) {
      console.log('✅ Backend (порт 3001): РАБОТАЕТ');
    } else {
      console.log('❌ Backend (порт 3001): ОШИБКА HTTP', response.status);
    }
  } catch (error) {
    console.log('❌ Backend (порт 3001): НЕ ДОСТУПЕН');
  }
  
  // Проверка frontend
  try {
    const response = await fetch('http://localhost:3000', { timeout: 3000 });
    if (response.ok) {
      console.log('✅ Frontend (порт 3000): РАБОТАЕТ');
    } else {
      console.log('❌ Frontend (порт 3000): ОШИБКА HTTP', response.status);
    }
  } catch (error) {
    console.log('❌ Frontend (порт 3000): НЕ ДОСТУПЕН');
  }
  
  console.log('\n📋 СТАТУС СИСТЕМЫ:');
  console.log('Если оба сервера работают, можно тестировать логистику!');
  console.log('Если нет - запустите серверы командами:');
  console.log('  Backend: cd ecotrack && npm start');
  console.log('  Frontend: cd ecotrack-frontend && npm run dev');
}

checkServers();
