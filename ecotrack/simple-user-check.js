const { PrismaClient } = require('@prisma/client');

console.log('🚀 Запускаем проверку пользователей...');

const prisma = new PrismaClient({
  log: ['error', 'warn'],
});

async function simpleCheck() {
  try {
    console.log('📡 Подключаемся к базе данных...');
    
    const users = await prisma.user.findMany({
      select: {
        email: true,
        name: true,
        isAdmin: true
      }
    });
    
    console.log(`✅ Найдено пользователей: ${users.length}`);
    
    users.forEach((user, index) => {
      console.log(`${index + 1}. ${user.email} - ${user.name} ${user.isAdmin ? '(Админ)' : ''}`);
    });
    
    // Проверяем наличие тестовых пользователей
    const testEmails = ['test@himkaplastic.ru', 'admin@himkaplastic.ru'];
    
    console.log('\n🔍 Проверка тестовых пользователей:');
    for (const email of testEmails) {
      const exists = users.find(u => u.email === email);
      console.log(`${email}: ${exists ? '✅ Найден' : '❌ Не найден'}`);
    }
    
  } catch (error) {
    console.error('❌ Ошибка при проверке пользователей:', error.message);
  } finally {
    await prisma.$disconnect();
    console.log('🔚 Завершено');
  }
}

simpleCheck();
