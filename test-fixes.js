const { exec } = require('child_process');

// Тест API с использованием curl
console.log('=== Тестирование исправлений ===');

// 1. Тест регистрации пользователя
console.log('\n1. Тестируем регистрацию...');
exec('curl -X POST http://localhost:3001/api/auth/register -H "Content-Type: application/json" -d "{\\"email\\":\\"test@example.com\\",\\"password\\":\\"password123\\",\\"name\\":\\"Тестовый пользователь\\"}"', (error, stdout, stderr) => {
  if (error) {
    console.log('Результат регистрации:', stdout);
  } else {
    console.log('✅ Регистрация:', stdout);
    
    // 2. Тест входа
    console.log('\n2. Тестируем вход...');
    exec('curl -X POST http://localhost:3001/api/auth/login -H "Content-Type: application/json" -d "{\\"email\\":\\"test@example.com\\",\\"password\\":\\"password123\\"}"', (error, stdout, stderr) => {
      if (error) {
        console.log('Ошибка входа:', error);
      } else {
        console.log('✅ Вход:', stdout);
        
        try {
          const loginData = JSON.parse(stdout);
          const token = loginData.token;
          
          if (token) {
            // 3. Тест получения профиля
            console.log('\n3. Тестируем получение профиля...');
            exec(`curl -H "Authorization: Bearer ${token}" http://localhost:3001/api/user/me`, (error, stdout, stderr) => {
              if (error) {
                console.log('Ошибка профиля:', error);
              } else {
                console.log('✅ Профиль:', stdout);
                
                // 4. Тест сохранения настроек дашборда
                console.log('\n4. Тестируем сохранение настроек дашборда...');
                const dashboardSettings = JSON.stringify([
                  { id: 'w1', type: 'orders', position: 0, size: 'medium' },
                  { id: 'w2', type: 'earnings', position: 1, size: 'large' }
                ]);
                
                exec(`curl -X PUT http://localhost:3001/api/user/me -H "Content-Type: application/json" -H "Authorization: Bearer ${token}" -d "{\\"dashboardSettings\\":\\"${dashboardSettings.replace(/"/g, '\\"')}\\"}"`, (error, stdout, stderr) => {
                  if (error) {
                    console.log('Ошибка сохранения:', error);
                  } else {
                    console.log('✅ Настройки сохранены:', stdout);
                    
                    // 5. Тест аналитики
                    console.log('\n5. Тестируем аналитику...');
                    exec(`curl -H "Authorization: Bearer ${token}" http://localhost:3001/api/analytics`, (error, stdout, stderr) => {
                      if (error) {
                        console.log('Ошибка аналитики:', error);
                      } else {
                        console.log('✅ Аналитика:', stdout);
                      }});

const { exec } = require('child_process');
