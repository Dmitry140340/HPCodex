const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function createAdmin() {
    try {
        console.log('Создаю админского пользователя...');
        
        // Удаляем старых админов если есть
        await prisma.user.deleteMany({
            where: {
                email: {
                    in: ['new@admin.com', 'super@admin.com', 'test@admin.com']
                }
            }
        });
        
        // Хешируем пароль
        const hashedPassword = await bcrypt.hash('admin123', 10);
        console.log('Хешированный пароль:', hashedPassword);
          // Создаем нового админа
        const admin = await prisma.user.create({
            data: {
                email: 'test@admin.com',
                name: 'Test Admin',
                password: hashedPassword,
                role: 'admin',
                isAdmin: true
            }
        });
        
        console.log('Создан админ:', admin.email, 'с ролью:', admin.role);
        
        // Проверим, что пароль правильно хеширован
        const isValid = await bcrypt.compare('admin123', admin.password);
        console.log('Проверка пароля admin123:', isValid ? 'УСПЕШНО' : 'ОШИБКА');
        
    } catch (error) {
        console.error('Ошибка при создании админа:', error);
    } finally {
        await prisma.$disconnect();
    }
}

createAdmin().catch(console.error);
