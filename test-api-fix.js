// Простой тест для проверки входа в систему и сохранения виджетов
const test = async () => {
  console.log('=== Тестирование API ===');
  
  // 1. Тест входа в систему
  console.log('\n1. Тестируем вход в систему...');
  try {
    const loginResponse = await fetch('http://localhost:3001/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: 'test@example.com',
        password: 'password123'
      })
    });
    
    if (loginResponse.ok) {
      const loginData = await loginResponse.json();
      console.log('✅ Вход успешен:', loginData);
      
      const token = loginData.token;
      
      // 2. Тест получения профиля пользователя
      console.log('\n2. Тестируем получение профиля...');
      const profileResponse = await fetch('http://localhost:3001/api/user/me', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (profileResponse.ok) {
        const profile = await profileResponse.json();
        console.log('✅ Профиль получен:', profile);
        
        // 3. Тест обновления профиля (сохранение настроек дашборда)
        console.log('\n3. Тестируем обновление настроек дашборда...');
        const testWidgets = [
          { id: 'w1', type: 'orders', position: 0, size: 'medium' },
          { id: 'w2', type: 'earnings', position: 1, size: 'large' }
        ];
        
        const updateResponse = await fetch('http://localhost:3001/api/user/me', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            dashboardSettings: JSON.stringify(testWidgets)
          })
        });
        
        if (updateResponse.ok) {
          const updatedProfile = await updateResponse.json();
          console.log('✅ Настройки дашборда сохранены:', updatedProfile.dashboardSettings);
        } else {
          console.error('❌ Ошибка при сохранении настроек:', await updateResponse.text());
        }
        
        // 4. Тест получения аналитики
        console.log('\n4. Тестируем получение аналитики...');
        const analyticsResponse = await fetch('http://localhost:3001/api/analytics', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (analyticsResponse.ok) {
          const analytics = await analyticsResponse.json();
          console.log('✅ Аналитика получена:', analytics);
        } else {
          console.error('❌ Ошибка при получении аналитики:', await analyticsResponse.text());
        }
        
      } else {
        console.error('❌ Ошибка при получении профиля:', await profileResponse.text());
      }
      
    } else {
      console.error('❌ Ошибка входа:', await loginResponse.text());
    }
  } catch (error) {
    console.error('❌ Ошибка тестирования:', error);
  }
};

test();
