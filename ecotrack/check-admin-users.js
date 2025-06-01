const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function checkAdminUsers() {
    try {
        console.log('Проверяю существующих пользователей...');
        
        const allUsers = await prisma.user.findMany({
            select: {
                id: true,
                email: true,
                role: true,
                password: true
            }
        });
        
        console.log('Найдено пользователей:', allUsers.length);
        
        for (const user of allUsers) {
            console.log('Email:', user.email, 'Role:', user.role, 'ID:', user.id);
            console.log('Password hash:', user.password.substring(0, 30) + '...');
            
            // Тестируем пароли
            if (user.email === 'new@admin.com') {
                const isValid = await bcrypt.compare('admin123', user.password);
                console.log('Пароль admin123 для new@admin.com:', isValid ? 'ВЕРНЫЙ' : 'НЕВЕРНЫЙ');
            }
            
            if (user.email === 'super@admin.com') {
                const isValid = await bcrypt.compare('super123', user.password);
                console.log('Пароль super123 для super@admin.com:', isValid ? 'ВЕРНЫЙ' : 'НЕВЕРНЫЙ');
            }
            
            console.log('---');
        }
        
    } catch (error) {
        console.error('Ошибка при проверке пользователей:', error);
    } finally {
        await prisma.$disconnect();
    }
}

checkAdminUsers().catch(console.error);
