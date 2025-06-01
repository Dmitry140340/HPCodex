/**
 * Скрипт для создания администратора через API
 */

async function createAdminUser() {
  const baseURL = 'http://localhost:3001/api';
  
  console.log('🔧 Создание администратора...\n');

  try {
    // Проверяем работу сервера
    console.log('1. Проверка сервера...');
    const healthResponse = await fetch(`${baseURL}/health`);
    if (!healthResponse.ok) {
      throw new Error('Сервер не отвечает');
    }
    console.log('✅ Сервер работает');

    // Создаем администратора
    console.log('\n2. Создание администратора...');
    const adminData = {
      email: 'admin@ecotrack.com',
      password: 'admin123',
      name: 'Администратор EcoTrack',
      companyName: 'ХимкаПластик'
    };

    try {
      const signupResponse = await fetch(`${baseURL}/auth/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(adminData)
      });

      if (signupResponse.ok) {
        const userData = await signupResponse.json();
        console.log('✅ Администратор создан успешно');
        console.log(`   Email: ${adminData.email}`);
        console.log(`   Password: ${adminData.password}`);
        console.log(`   Admin: ${userData.user?.isAdmin}`);
      } else {
        const errorData = await signupResponse.json();
        if (errorData.message?.includes('already exists') || errorData.message?.includes('уже существует')) {
          console.log('✅ Администратор уже существует');
        } else {
          console.log('❌ Ошибка создания:', errorData.message);
        }
      }
    } catch (error) {
      console.log('❌ Ошибка создания администратора:', error.message);
    }

    // Проверяем вход
    console.log('\n3. Проверка входа администратора...');
    try {
      const loginResponse = await fetch(`${baseURL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: 'admin@ecotrack.com',
          password: 'admin123'
        })
      });

      if (loginResponse.ok) {
        const loginData = await loginResponse.json();
        console.log('✅ Вход администратора успешен');
        console.log(`   Token: ${loginData.token?.substring(0, 20)}...`);
        console.log(`   Admin: ${loginData.user?.isAdmin}`);
        console.log(`   Role: ${loginData.user?.role}`);
      } else {
        const errorData = await loginResponse.json();
        console.log('❌ Ошибка входа:', errorData.message);
      }
    } catch (error) {
      console.log('❌ Ошибка при проверке входа:', error.message);
    }

    // Создаем дополнительных тестовых администраторов
    console.log('\n4. Создание дополнительных администраторов...');
    
    const additionalAdmins = [
      {
        email: 'admin@admin.com',
        password: 'admin123', 
        name: 'Администратор',
        companyName: 'ХимкаПластик'
      },
      {
        email: 'admin@himkaplastic.ru',
        password: 'admin123',
        name: 'Администратор ХимкаПластик', 
        companyName: 'ООО ХимкаПластик'
      }
    ];

    for (const admin of additionalAdmins) {
      try {
        const response = await fetch(`${baseURL}/auth/signup`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(admin)
        });

        if (response.ok) {
          console.log(`✅ Создан: ${admin.email}`);
        } else {
          const errorData = await response.json();
          if (errorData.message?.includes('already exists') || errorData.message?.includes('уже существует')) {
            console.log(`✅ Уже существует: ${admin.email}`);
          } else {
            console.log(`❌ Ошибка ${admin.email}:`, errorData.message);
          }
        }
      } catch (error) {
        console.log(`❌ Ошибка ${admin.email}:`, error.message);
      }
    }

    console.log('\n🎉 АДМИНИСТРАТОРЫ ГОТОВЫ К ИСПОЛЬЗОВАНИЮ:');
    console.log('='.repeat(50));
    console.log('👤 admin@ecotrack.com / admin123');
    console.log('👤 admin@admin.com / admin123');
    console.log('👤 admin@himkaplastic.ru / admin123');
    console.log('\n🌐 Попробуйте войти на http://localhost:3000');

  } catch (error) {
    console.error('❌ Общая ошибка:', error.message);
    console.log('\n💡 Убедитесь, что backend сервер запущен на порту 3001');
  }
}

// Запуск
createAdminUser();
