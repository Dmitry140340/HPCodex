const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function assignLogisticRole() {
    try {
        const userEmail = 'zavalnyuk14@gmail.com';
        
        console.log(`🔍 Поиск пользователя с email: ${userEmail}`);
        
        // Сначала найдем пользователя
        const user = await prisma.user.findUnique({
            where: {
                email: userEmail
            }
        });
        
        if (!user) {
            console.log(`❌ Пользователь с email ${userEmail} не найден в базе данных`);
            console.log('📝 Создаем нового пользователя с ролью логиста...');
            
            // Хэшируем пароль по умолчанию
            const bcrypt = require('bcryptjs');
            const defaultPassword = 'logistic123456';
            const hashedPassword = await bcrypt.hash(defaultPassword, 10);
            
            // Создаем нового пользователя с ролью логиста
            const newUser = await prisma.user.create({
                data: {
                    email: userEmail,
                    name: 'Логист Завальнюк',
                    role: 'logistic',
                    isAdmin: false,
                    companyName: 'Логистическая компания',
                    password: hashedPassword
                }
            });
            
            console.log(`✅ Создан новый пользователь-логист:`);
            console.log(`   📧 Email: ${newUser.email}`);
            console.log(`   👤 Имя: ${newUser.name}`);
            console.log(`   🎭 Роль: ${newUser.role}`);
            console.log(`   🏢 Компания: ${newUser.companyName}`);
            console.log(`   🔑 Пароль: ${defaultPassword}`);
              } else {
            console.log(`✅ Пользователь найден:`);
            console.log(`   👤 Имя: ${user.name}`);
            console.log(`   🎭 Текущая роль: ${user.role || 'не указана'}`);
            console.log(`   👑 Админ: ${user.isAdmin ? 'Да' : 'Нет'}`);
            
            console.log(`\n🔄 Обновляем роль на "logistic"...`);
            
            // Обновляем роль на логиста
            const updatedUser = await prisma.user.update({
                where: {
                    email: userEmail
                },
                data: {
                    role: 'logistic',
                    isAdmin: false, // Убираем права админа, если были
                    companyName: user.companyName || 'Логистическая компания'
                }
            });
            
            console.log(`\n🎉 Роль успешно обновлена!`);
            console.log(`   📧 Email: ${updatedUser.email}`);
            console.log(`   👤 Имя: ${updatedUser.name}`);
            console.log(`   🎭 Новая роль: ${updatedUser.role}`);
            console.log(`   👑 Админ: ${updatedUser.isAdmin ? 'Да' : 'Нет'}`);
        }
        
        console.log(`\n🔑 Теперь пользователь ${userEmail} может войти в систему как логист`);
        console.log(`📱 Доступные функции для логиста:`);
        console.log(`   - Логистические маршруты`);
        console.log(`   - Выбор маршрутов`);
        console.log(`   - Заказы в работе`);
        console.log(`   - Отслеживание доставок`);
        console.log(`   - Аналитика логистики`);
        console.log(`   - Связь с менеджерами`);
        
    } catch (error) {
        console.error('❌ Ошибка при назначении роли логиста:', error);
        
        if (error.code === 'P2002') {
            console.log('💡 Возможно, пользователь с таким email уже существует');
        }
    } finally {
        await prisma.$disconnect();
    }
}

// Запускаем функцию
assignLogisticRole();
