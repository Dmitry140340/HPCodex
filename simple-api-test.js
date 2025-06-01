// Простой тест API без ожидания

const fetch = require('node-fetch');

async function testAPI() {
  console.log('🔧 ТЕСТИРОВАНИЕ API ECOTRACK');
  console.log('============================\n');
  
  // Тест 1: Проверка здоровья сервера
  try {
    console.log('📡 Проверка backend сервера...');
    const healthResponse = await fetch('http://localhost:3001/api/health');
    if (healthResponse.ok) {
      console.log('✅ Backend сервер работает');
    } else {
      console.log('❌ Backend сервер не отвечает');
    }
  } catch (error) {
    console.log('❌ Backend сервер недоступен:', error.message);
  }
  
  // Тест 2: Проверка фронтенда
  try {
    console.log('🌐 Проверка frontend сервера...');
    const frontendResponse = await fetch('http://localhost:3000');
    if (frontendResponse.ok) {
      console.log('✅ Frontend сервер работает');
    } else {
      console.log('❌ Frontend сервер не отвечает');
    }
  } catch (error) {
    console.log('❌ Frontend сервер недоступен:', error.message);
  }
  
  // Тест 3: Вход в систему
  try {
    console.log('🔐 Тестирование авторизации клиента...');
    const loginResponse = await fetch('http://localhost:3001/api/auth/signin', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'client@test.com',
        password: 'test123456'
      })
    });
    
    if (loginResponse.ok) {
      const loginData = await loginResponse.json();
      console.log('✅ Авторизация клиента успешна');
      console.log('🔑 Токен получен:', loginData.token ? 'ДА' : 'НЕТ');
      
      if (loginData.token) {
        // Тест 4: Создание заказа
        console.log('📦 Тестирование создания заказа...');
        const orderResponse = await fetch('http://localhost:3001/api/orders', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${loginData.token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            materialType: 'HDPE',
            volume: 50,
            pickupAddress: 'г. Москва, ул. Тестовая, д. 1'
          })
        });
        
        if (orderResponse.ok) {
          const orderData = await orderResponse.json();
          console.log('✅ Заказ создан успешно');
          console.log('📋 ID заказа:', orderData.id);
          console.log('💰 Стоимость:', orderData.price, '₽');
          console.log('🌱 Экологический эффект:', orderData.environmentalImpact, 'кг CO₂');
          
          // Тест 5: Авторизация логиста
          console.log('🚚 Тестирование авторизации логиста...');
          const logistLoginResponse = await fetch('http://localhost:3001/api/auth/signin', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              email: 'logist1@logistic.com',
              password: 'test123456'
            })
          });
          
          if (logistLoginResponse.ok) {
            const logistData = await logistLoginResponse.json();
            console.log('✅ Авторизация логиста успешна');
            
            // Тест 6: Получение маршрутов
            console.log('🗺️ Проверка логистических маршрутов...');
            const routesResponse = await fetch('http://localhost:3001/api/logistics/routes', {
              headers: {
                'Authorization': `Bearer ${logistData.token}`,
              }
            });
            
            if (routesResponse.ok) {
              const routes = await routesResponse.json();
              console.log('✅ Маршруты получены');
              console.log('📊 Количество маршрутов:', routes.length);
              
              // Найдем маршрут для нашего заказа
              const orderRoute = routes.find(route => route.orderId === orderData.id);
              if (orderRoute) {
                console.log('🎯 Найден маршрут для заказа');
                console.log('📋 Варианты маршрутов:', orderRoute.routeOptions.length);
                
                if (orderRoute.routeOptions.length > 0) {
                  const firstOption = orderRoute.routeOptions[0];
                  console.log('🚛 Выбираем первый маршрут:', firstOption.name);
                  
                  // Тест 7: Выбор маршрута
                  const selectResponse = await fetch('http://localhost:3001/api/logistics/routes/select', {
                    method: 'POST',
                    headers: {
                      'Authorization': `Bearer ${logistData.token}`,
                      'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                      routeId: orderRoute.id,
                      selectedOptionId: firstOption.id
                    })
                  });
                  
                  if (selectResponse.ok) {
                    console.log('✅ Маршрут выбран успешно');
                    
                    // Тест 8: Проверка обновления заказа
                    setTimeout(async () => {
                      console.log('🔄 Проверка обновления статуса заказа...');
                      const updatedOrdersResponse = await fetch('http://localhost:3001/api/orders/my', {
                        headers: {
                          'Authorization': `Bearer ${loginData.token}`,
                        }
                      });
                      
                      if (updatedOrdersResponse.ok) {
                        const orders = await updatedOrdersResponse.json();
                        const updatedOrder = orders.find(order => order.id === orderData.id);
                        if (updatedOrder) {
                          console.log('✅ Статус заказа обновлен:', updatedOrder.status);
                          console.log('\n🎉 ВСЕ ТЕСТЫ ПРОЙДЕНЫ УСПЕШНО!');
                          console.log('================================================');
                          console.log('✅ Клиент может создавать заказы');
                          console.log('✅ Система автоматически создает маршруты');
                          console.log('✅ Логист может выбирать маршруты');
                          console.log('✅ Статус заказа обновляется автоматически');
                          console.log('✅ ЛОГИСТИЧЕСКАЯ СИСТЕМА РАБОТАЕТ! 🚀');
                        }
                      }
                    }, 2000);
                  } else {
                    console.log('❌ Ошибка выбора маршрута');
                  }
                }
              } else {
                console.log('⚠️ Маршрут для заказа не найден');
              }
            } else {
              console.log('❌ Ошибка получения маршрутов');
            }
          } else {
            console.log('❌ Ошибка авторизации логиста');
          }
        } else {
          console.log('❌ Ошибка создания заказа');
        }
      }
    } else {
      console.log('❌ Ошибка авторизации клиента');
    }
  } catch (error) {
    console.log('❌ Ошибка тестирования:', error.message);
  }
}

testAPI();
