const { exec } = require('child_process');

console.log('=== Тестирование исправлений ===');

function testAuth() {
  console.log('\n1. Тестируем вход в систему...');
  
  const loginCommand = 'curl -X POST http://localhost:3001/api/auth/login -H "Content-Type: application/json" -d "{\\"email\\":\\"test@example.com\\",\\"password\\":\\"password123\\"}"';
  
  exec(loginCommand, (error, stdout, stderr) => {
    if (error) {
      console.log('❌ Ошибка входа:', error.message);
      return;
    }
    
    console.log('Ответ сервера:', stdout);
    
    try {
      const response = JSON.parse(stdout);
      if (response.token) {
        console.log('✅ Токен получен:', response.token);
        testProfile(response.token);
      } else {
        console.log('❌ Токен не получен');
      }
    } catch (e) {
      console.log('❌ Ошибка парсинга ответа:', e.message);
    }
  });
}

function testProfile(token) {
  console.log('\n2. Тестируем получение профиля...');
  
  const profileCommand = `curl -H "Authorization: Bearer ${token}" http://localhost:3001/api/user/me`;
  
  exec(profileCommand, (error, stdout, stderr) => {
    if (error) {
      console.log('❌ Ошибка получения профиля:', error.message);
      return;
    }
    
    console.log('Профиль пользователя:', stdout);
    testDashboardSettings(token);
  });
}

function testDashboardSettings(token) {
  console.log('\n3. Тестируем сохранение настроек дашборда...');
  
  const settings = JSON.stringify([
    { id: 'w1', type: 'orders', position: 0, size: 'medium' },
    { id: 'w2', type: 'earnings', position: 1, size: 'large' }
  ]);
  
  const updateCommand = `curl -X PUT http://localhost:3001/api/user/me -H "Content-Type: application/json" -H "Authorization: Bearer ${token}" -d "{\\"dashboardSettings\\":\\"${settings.replace(/"/g, '\\"')}\\"}"`;
  
  exec(updateCommand, (error, stdout, stderr) => {
    if (error) {
      console.log('❌ Ошибка сохранения настроек:', error.message);
      return;
    }
    
    console.log('Результат сохранения:', stdout);
    testAnalytics(token);
  });
}

function testAnalytics(token) {
  console.log('\n4. Тестируем аналитику...');
  
  const analyticsCommand = `curl -H "Authorization: Bearer ${token}" http://localhost:3001/api/analytics`;
  
  exec(analyticsCommand, (error, stdout, stderr) => {
    if (error) {
      console.log('❌ Ошибка получения аналитики:', error.message);
      return;
    }
    
    console.log('Аналитика:', stdout);
    console.log('\n=== Тестирование завершено ===');
  });
}

// Запускаем тест
testAuth();
