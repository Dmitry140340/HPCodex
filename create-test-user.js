const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function createTestUser() {
  try {
    // Создаем тестового пользователя
    const hashedPassword = await bcrypt.hash('123456', 10);
    
    const user = await prisma.user.create({
      data: {
        name: 'Тестовый пользователь',
        email: 'test@himkaplastic.ru',
        password: hashedPassword,
        companyName: 'ООО Тест',
        isAdmin: false,
        dashboardSettings: JSON.stringify([
          { id: 'w1', type: 'totalOrders', position: 0, size: 'small' },
          { id: 'w2', type: 'totalEarnings', position: 1, size: 'medium' }
        ])
      }
    });

    // Создаем администратора
    const adminPassword = await bcrypt.hash('admin123', 10);
    
    const admin = await prisma.user.create({
      data: {
        name: 'Администратор',
        email: 'admin@himkaplastic.ru',
        password: adminPassword,
        companyName: 'ООО Химка Пластик',
        isAdmin: true,
        dashboardSettings: JSON.stringify([
          { id: 'w1', type: 'totalOrders', position: 0, size: 'small' },
          { id: 'w2', type: 'totalEarnings', position: 1, size: 'medium' }
        ])
      }
    });

    console.log('Созданы тестовые пользователи:');
    console.log('Обычный пользователь - email: test@himkaplastic.ru, пароль: 123456');
    console.log('Администратор - email: admin@himkaplastic.ru, пароль: admin123');
    
  } catch (error) {
    console.error('Ошибка создания пользователей:', error);
    
    if (error.code === 'P2002') {
      console.log('Пользователи уже существуют. Пробуем обновить пароли...');
      
      try {
        const hashedPassword = await bcrypt.hash('123456', 10);
        await prisma.user.update({
          where: { email: 'test@himkaplastic.ru' },
          data: { password: hashedPassword }
        });
        
        const adminPassword = await bcrypt.hash('admin123', 10);
        await prisma.user.update({
          where: { email: 'admin@himkaplastic.ru' },
          data: { password: adminPassword }
        });
        
        console.log('Пароли обновлены успешно!');
        console.log('Обычный пользователь - email: test@himkaplastic.ru, пароль: 123456');
        console.log('Администратор - email: admin@himkaplastic.ru, пароль: admin123');
      } catch (updateError) {
        console.error('Ошибка обновления паролей:', updateError);
      }
    }
  } finally {
    await prisma.$disconnect();
  }
}

createTestUser();
