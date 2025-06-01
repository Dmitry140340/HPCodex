const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
});

async function testConnection() {
  try {
    console.log('Проверяем подключение к базе данных...');
    
    // Тестируем подключение
    const result = await prisma.$queryRaw`SELECT 1 as test`;
    console.log('✅ Подключение успешно:', result);
    
    // Проверяем существование таблиц
    const users = await prisma.user.findMany({
      take: 1
    });
    console.log('✅ Таблица user существует. Найдено пользователей:', users.length);
    
  } catch (error) {
    console.error('❌ Ошибка подключения к базе данных:', error.message);
    console.error('Детали:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testConnection();
