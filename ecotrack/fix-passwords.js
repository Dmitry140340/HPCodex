const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function fixExistingPasswords() {
    try {
        console.log('Начинаю исправление паролей в базе данных...');
        
        // Получаем всех пользователей
        const users = await prisma.user.findMany();
        
        for (const user of users) {
            // Проверяем, является ли пароль уже хешем bcrypt
            const isBcryptHash = user.password.startsWith('$2');
            
            if (!isBcryptHash) {
                console.log(`Обновляю пароль для пользователя ${user.email}...`);
                
                // Хешируем пароль
                const hashedPassword = await bcrypt.hash(user.password, 10);
                
                // Обновляем пользователя
                await prisma.user.update({
                    where: { id: user.id },
                    data: { password: hashedPassword }
                });
                
                console.log(`✅ Пароль для ${user.email} обновлен`);
            } else {
                console.log(`⏭️ Пароль для ${user.email} уже хеширован`);
            }
        }
        
        console.log('✅ Все пароли исправлены!');
        
    } catch (error) {
        console.error('❌ Ошибка при исправлении паролей:', error);
    } finally {
        await prisma.$disconnect();
    }
}

fixExistingPasswords().catch(console.error);
