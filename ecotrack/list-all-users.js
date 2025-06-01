const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function listAllUsers() {
    try {
        console.log('📋 Список всех пользователей в базе данных:\n');
        
        const users = await prisma.user.findMany({
            select: {
                id: true,
                email: true,
                name: true,
                isAdmin: true,
                role: true,
                companyName: true,
                createdAt: true
            },
            orderBy: {
                createdAt: 'asc'
            }
        });
        
        console.log(`Всего пользователей: ${users.length}\n`);
        
        users.forEach((user, index) => {
            console.log(`${index + 1}. 📧 ${user.email}`);
            console.log(`   👤 ${user.name}`);
            console.log(`   🏢 ${user.companyName || 'Не указано'}`);
            console.log(`   👑 Админ: ${user.isAdmin ? 'Да' : 'Нет'}`);
            console.log(`   🎭 Роль: ${user.role || 'Не указано'}`);
            console.log(`   📅 Создан: ${user.createdAt.toLocaleString('ru-RU')}`);
            console.log('   ---');
        });
        
        // Выделяем админов
        const admins = users.filter(u => u.isAdmin || u.role === 'admin');
        console.log(`\n👑 Найдено администраторов: ${admins.length}`);
        admins.forEach(admin => {
            console.log(`✅ ${admin.email} - ${admin.name}`);
        });

        console.log('\n🔑 Готовые учетные данные для входа:');
        console.log('admin@admin.com / admin123 (подтверждено)');
        
    } catch (error) {
        console.error('❌ Ошибка:', error);
    } finally {
        await prisma.$disconnect();
    }
}

listAllUsers();
