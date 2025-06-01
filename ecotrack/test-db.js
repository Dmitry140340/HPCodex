const { PrismaClient } = require('@prisma/client');

async function testDatabase() {
  const prisma = new PrismaClient();
  
  try {
    console.log('🔍 Тестируем соединение с базой данных...');
    
    // Проверяем соединение
    await prisma.$connect();
    console.log('✅ Соединение с базой данных установлено');
    
    // Проверяем количество пользователей
    const userCount = await prisma.user.count();
    console.log(`📊 Количество пользователей в базе: ${userCount}`);
    
    // Проверяем количество заказов
    const orderCount = await prisma.order.count();
    console.log(`📦 Количество заказов в базе: ${orderCount}`);
    
    if (userCount === 0) {
      console.log('⚠️  База данных пуста. Создаем тестовые данные...');
      
      // Создаем тестового пользователя
      const testUser = await prisma.user.create({
        data: {
          email: 'test@himkaplastic.ru',
          name: 'Тестовый пользователь',
          password: 'hashedpassword123',
          isAdmin: true,
          role: 'admin',
          companyName: 'ООО ХимкаПластик',
          inn: '1234567890',
          kpp: '123456789'
        }
      });
      console.log('👤 Создан тестовый пользователь:', testUser.email);
      
      // Создаем тестовый заказ
      const testOrder = await prisma.order.create({
        data: {
          userId: testUser.id,
          materialType: 'Полиэтилен',
          volume: 100.5,
          price: 15000,
          environmentalImpact: 25.3,
          status: 'pending',
          pickupAddress: 'г. Химки, ул. Промышленная, д. 10',
          paymentStatus: 'unpaid',
          paymentMethod: 'bank_transfer'
        }
      });
      console.log('📦 Создан тестовый заказ ID:', testOrder.id);
    }
    
    console.log('✅ База данных готова к работе');
    
  } catch (error) {
    console.error('❌ Ошибка при работе с базой данных:', error.message);
    
    if (error.code === 'P1001') {
      console.log('🔧 Возможные решения:');
      console.log('1. Убедитесь, что PostgreSQL запущен');
      console.log('2. Проверьте настройки подключения в .env файле');
      console.log('3. Убедитесь, что база данных "himkaplastic" существует');
    }
  } finally {
    await prisma.$disconnect();
  }
}

testDatabase();
