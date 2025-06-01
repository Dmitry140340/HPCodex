const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function testLogin() {
    try {
        console.log('Тестирую вход для admin@admin.com...');
        
        const user = await prisma.user.findUnique({
            where: { email: 'admin@admin.com' }
        });
        
        if (!user) {
            console.log('Пользователь не найден');
            return;
        }
        
        console.log('Найден пользователь:', user.email, 'роль:', user.role);
        console.log('Пароль в БД:', user.password);
        
        // Тестируем различные варианты пароля
        const passwords = ['admin123', 'admin', 'password'];
        
        for (const pwd of passwords) {
            const isValid = await bcrypt.compare(pwd, user.password);
            console.log(`Пароль "${pwd}":`, isValid ? 'ВЕРНЫЙ' : 'неверный');
        }
        
        // Проверим, является ли пароль хешем bcrypt
        const isBcryptHash = user.password.startsWith('$2');
        console.log('Пароль является bcrypt хешем:', isBcryptHash);
        
        if (!isBcryptHash) {
            console.log('ПРОБЛЕМА: Пароль не хеширован! Сохранен как обычный текст.');
        }
        
    } catch (error) {
        console.error('Ошибка при тестировании входа:', error);
    } finally {
        await prisma.$disconnect();
    }
}

testLogin().catch(console.error);
