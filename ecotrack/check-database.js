// Комплексная проверка базы данных EcoTrack
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkDatabaseConnection() {
  console.log('🔍 Проверка подключения к базе данных EcoTrack...\n');
  
  try {
    // 1. Проверка подключения к базе данных
    console.log('1️⃣ Тестируем подключение к PostgreSQL...');
    await prisma.$connect();
    console.log('✅ Подключение к базе данных успешно!\n');
    
    // 2. Проверка структуры таблиц
    console.log('2️⃣ Проверяем структуру таблиц...');
    
    // Проверяем таблицу User
    const userCount = await prisma.user.count();
    console.log(`📊 Пользователи: ${userCount} записей`);
    
    // Проверяем таблицу Order
    const orderCount = await prisma.order.count();
    console.log(`📦 Заказы: ${orderCount} записей`);
    
    // 3. Проверка наличия тестовых данных
    console.log('\n3️⃣ Проверяем наличие тестовых данных...');
    
    // Проверяем админов
    const adminUsers = await prisma.user.findMany({
      where: { isAdmin: true },
      select: { id: true, email: true, name: true }
    });
    
    console.log(`👑 Администраторы: ${adminUsers.length}`);
    adminUsers.forEach(admin => {
      console.log(`   - ${admin.name} (${admin.email})`);
    });
    
    // Проверяем обычных пользователей
    const regularUsers = await prisma.user.findMany({
      where: { isAdmin: false },
      select: { id: true, email: true, name: true, companyName: true }
    });
    
    console.log(`👥 Обычные пользователи: ${regularUsers.length}`);
    if (regularUsers.length > 0) {
      regularUsers.slice(0, 3).forEach(user => {
        console.log(`   - ${user.name} (${user.email}) - ${user.companyName || 'Без компании'}`);
      });
      if (regularUsers.length > 3) {
        console.log(`   ... и еще ${regularUsers.length - 3} пользователей`);
      }
    }
    
    // 4. Проверка заказов
    if (orderCount > 0) {
      console.log('\n4️⃣ Анализ заказов...');
      const recentOrders = await prisma.order.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: { name: true, email: true }
          }
        }
      });
      
      console.log('📦 Последние заказы:');
      recentOrders.forEach(order => {
        console.log(`   - ${order.materialType} (${order.volume}кг) - ${order.user.name} - ${order.status}`);
      });
      
      // Статистика по статусам
      const statusStats = await prisma.order.groupBy({
        by: ['status'],
        _count: { status: true }
      });
      
      console.log('\n📊 Статистика по статусам заказов:');
      statusStats.forEach(stat => {
        console.log(`   - ${stat.status}: ${stat._count.status} заказов`);
      });
    }
    
    // 5. Создание тестовых данных если их нет
    console.log('\n5️⃣ Проверяем необходимость создания тестовых данных...');
    
    if (adminUsers.length === 0) {
      console.log('⚠️ Нет администраторов! Создаем тестового админа...');
      const testAdmin = await prisma.user.create({
        data: {
          email: 'admin@himka-plastic.ru',
          name: 'Администратор Системы',
          password: '$2b$10$K7L/VxwtkIVOKWwlk.E5z.qQK5TB8Q5Y.jGtjNzQfZZK8EhP.jzWm', // password123
          isAdmin: true,
          role: 'admin',
          companyName: 'ХимкаПластик',
          inn: '7700000000',
          kpp: '770001001'
        }
      });
      console.log(`✅ Создан админ: ${testAdmin.name} (${testAdmin.email})`);
    }
    
    if (regularUsers.length === 0) {
      console.log('⚠️ Нет обычных пользователей! Создаем тестовых пользователей...');
      
      const testUsers = [
        {
          email: 'client1@test.ru',
          name: 'Иван Петров',
          password: '$2b$10$K7L/VxwtkIVOKWwlk.E5z.qQK5TB8Q5Y.jGtjNzQfZZK8EhP.jzWm',
          isAdmin: false,
          role: 'client',
          companyName: 'ООО Экопласт',
          inn: '7701000001'
        },
        {
          email: 'client2@test.ru', 
          name: 'Мария Сидорова',
          password: '$2b$10$K7L/VxwtkIVOKWwlk.E5z.qQK5TB8Q5Y.jGtjNzQfZZK8EhP.jzWm',
          isAdmin: false,
          role: 'client',
          companyName: 'ИП Сидорова М.А.',
          inn: '7702000002'
        }
      ];
      
      for (const userData of testUsers) {
        const user = await prisma.user.create({ data: userData });
        console.log(`✅ Создан пользователь: ${user.name} (${user.email})`);
      }
    }
    
    if (orderCount === 0) {
      console.log('⚠️ Нет заказов! Создаем тестовые заказы...');
      
      const users = await prisma.user.findMany({
        where: { isAdmin: false },
        take: 2
      });
      
      if (users.length > 0) {
        const testOrders = [
          {
            userId: users[0].id,
            materialType: 'ПЭТ бутылки',
            volume: 500.0,
            price: 15000.0,
            environmentalImpact: 2.5,
            status: 'pending',
            pickupAddress: 'г. Москва, ул. Промышленная, д. 15',
            paymentStatus: 'unpaid',
            paymentMethod: 'bank_transfer'
          },
          {
            userId: users[0].id,
            materialType: 'Полиэтилен',
            volume: 1000.0,
            price: 25000.0,
            environmentalImpact: 4.2,
            status: 'confirmed',
            pickupAddress: 'г. Москва, ул. Заводская, д. 7',
            paymentStatus: 'paid',
            paymentMethod: 'cash'
          }
        ];
        
        if (users.length > 1) {
          testOrders.push({
            userId: users[1].id,
            materialType: 'Полистирол',
            volume: 300.0,
            price: 9000.0,
            environmentalImpact: 1.8,
            status: 'completed',
            pickupAddress: 'г. Москва, пр-т Мира, д. 45',
            paymentStatus: 'paid',
            paymentMethod: 'card'
          });
        }
        
        for (const orderData of testOrders) {
          const order = await prisma.order.create({ data: orderData });
          console.log(`✅ Создан заказ: ${order.materialType} (${order.volume}кг)`);
        }
      }
    }
    
    // 6. Финальная проверка
    console.log('\n6️⃣ Финальная проверка базы данных...');
    const finalUserCount = await prisma.user.count();
    const finalOrderCount = await prisma.order.count();
    const finalAdminCount = await prisma.user.count({ where: { isAdmin: true } });
    
    console.log(`📊 Итоговая статистика:`);
    console.log(`   👥 Всего пользователей: ${finalUserCount}`);
    console.log(`   👑 Администраторов: ${finalAdminCount}`);
    console.log(`   📦 Всего заказов: ${finalOrderCount}`);
    
    // 7. Проверка учетных данных для входа
    console.log('\n7️⃣ Учетные данные для тестирования:');
    console.log('🔐 Для входа в систему используйте:');
    console.log('   📧 Email: admin@himka-plastic.ru');
    console.log('   🔑 Пароль: password123');
    console.log('   👑 Роль: Администратор');
    console.log('');
    console.log('   📧 Email: client1@test.ru');
    console.log('   🔑 Пароль: password123'); 
    console.log('   👤 Роль: Клиент');
    
    console.log('\n🎉 База данных готова для полноценного тестирования!');
    console.log('✅ Можно запускать frontend и тестировать приложение');
    
    return true;
    
  } catch (error) {
    console.error('❌ Ошибка при работе с базой данных:', error.message);
    
    if (error.code === 'P1001') {
      console.log('\n🔧 Возможные решения:');
      console.log('1. Убедитесь, что PostgreSQL запущен');
      console.log('2. Проверьте DATABASE_URL в .env файле');
      console.log('3. Проверьте настройки подключения к базе данных');
    }
    
    return false;
  } finally {
    await prisma.$disconnect();
  }
}

// Запуск проверки
checkDatabaseConnection()
  .then(success => {
    if (success) {
      console.log('\n🚀 База данных готова! Можете запускать:');
      console.log('   npm start (для frontend)');
      console.log('   или используйте start-clean.ps1');
    } else {
      console.log('\n❌ Необходимо исправить проблемы с базой данных');
    }
    process.exit(success ? 0 : 1);
  })
  .catch(error => {
    console.error('💥 Критическая ошибка:', error);
    process.exit(1);
  });
