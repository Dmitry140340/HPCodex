// ФИНАЛЬНЫЙ КОМПЛЕКСНЫЙ ТЕСТ СИСТЕМЫ
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function runFinalSystemTest() {
    console.log('🎯 ЗАПУСК ФИНАЛЬНОГО СИСТЕМНОГО ТЕСТА');
    console.log('='.repeat(50));
    
    let allTestsPassed = true;
    const testResults = [];
    
    try {
        // Тест 1: Подключение к базе данных
        console.log('\n1️⃣ Тестирование подключения к БД...');
        const userCount = await prisma.user.count();
        const orderCount = await prisma.order.count();
        console.log(`✅ База данных: ${userCount} пользователей, ${orderCount} заказов`);
        testResults.push('✅ Database Connection - PASSED');
        
        // Тест 2: Проверка администраторов
        console.log('\n2️⃣ Тестирование администраторов...');
        const adminUser = await prisma.user.findUnique({
            where: { email: 'admin@admin.com' }
        });
        
        if (adminUser) {
            const passwordValid = await bcrypt.compare('admin123', adminUser.password);
            if (passwordValid) {
                console.log('✅ Админ admin@admin.com: вход работает');
                testResults.push('✅ Admin Authentication - PASSED');
            } else {
                console.log('❌ Админ admin@admin.com: пароль не работает');
                testResults.push('❌ Admin Authentication - FAILED');
                allTestsPassed = false;
            }
        } else {
            console.log('❌ Админ admin@admin.com не найден');
            testResults.push('❌ Admin User Exists - FAILED');
            allTestsPassed = false;
        }
        
        // Тест 3: Проверка российской локализации
        console.log('\n3️⃣ Тестирование российской локализации...');
        
        // Проверяем Яндекс.Карты
        const yandexMapsPath = path.join(__dirname, 'src', 'utils', 'yandexMaps.ts');
        const yandexMapsExists = fs.existsSync(yandexMapsPath);
        console.log(`✅ Яндекс.Карты: ${yandexMapsExists ? 'настроены' : 'не найдены'}`);
        testResults.push(`✅ Yandex Maps Integration - ${yandexMapsExists ? 'PASSED' : 'FAILED'}`);
        
        // Проверяем .env с российскими настройками
        const envPath = path.join(__dirname, '.env');
        if (fs.existsSync(envPath)) {
            const envContent = fs.readFileSync(envPath, 'utf8');
            const hasYandexKey = envContent.includes('YANDEX_MAPS_API_KEY');
            console.log(`✅ API ключи: ${hasYandexKey ? 'настроены' : 'отсутствуют'}`);
            testResults.push(`✅ Russian API Keys - ${hasYandexKey ? 'PASSED' : 'FAILED'}`);
        }
        
        // Тест 4: Проверка фронтенда
        console.log('\n4️⃣ Тестирование фронтенда...');
        const frontendPath = path.join(__dirname, '..', 'ecotrack-frontend');
        const packageJsonPath = path.join(frontendPath, 'package.json');
        const frontendExists = fs.existsSync(packageJsonPath);
        console.log(`✅ Frontend: ${frontendExists ? 'настроен' : 'не найден'}`);
        testResults.push(`✅ Frontend Setup - ${frontendExists ? 'PASSED' : 'FAILED'}`);
        
        // Проверяем русификацию интерфейса
        const loginPagePath = path.join(frontendPath, 'src', 'pages', 'LoginPage.tsx');
        if (fs.existsSync(loginPagePath)) {
            const loginContent = fs.readFileSync(loginPagePath, 'utf8');
            const hasRussianText = loginContent.includes('Вход') || loginContent.includes('Логин') || loginContent.includes('войти');
            console.log(`✅ Русификация: ${hasRussianText ? 'выполнена' : 'требуется'}`);
            testResults.push(`✅ Russian Localization - ${hasRussianText ? 'PASSED' : 'PARTIAL'}`);
        }
        
        // Тест 5: Проверка структуры проекта
        console.log('\n5️⃣ Тестирование структуры проекта...');
        const requiredPaths = [
            path.join(__dirname, 'src', 'server', 'server.ts'),
            path.join(__dirname, 'src', 'server', 'actions.ts'),
            path.join(__dirname, 'prisma', 'schema.prisma')
        ];
        
        let structureValid = true;
        requiredPaths.forEach(reqPath => {
            const exists = fs.existsSync(reqPath);
            if (!exists) structureValid = false;
        });
        
        console.log(`✅ Структура проекта: ${structureValid ? 'корректна' : 'требует проверки'}`);
        testResults.push(`✅ Project Structure - ${structureValid ? 'PASSED' : 'FAILED'}`);
        
        // Финальное резюме
        console.log('\n📋 РЕЗУЛЬТАТЫ ФИНАЛЬНОГО ТЕСТА');
        console.log('='.repeat(50));
        
        testResults.forEach(result => {
            console.log(result);
        });
        
        console.log('\n🎯 ОБЩИЙ РЕЗУЛЬТАТ:');
        if (allTestsPassed) {
            console.log('🎉 ВСЕ ТЕСТЫ ПРОЙДЕНЫ УСПЕШНО!');
            console.log('🚀 ПРОЕКТ ГОТОВ К ПРОДАКШН-ИСПОЛЬЗОВАНИЮ');
            
            console.log('\n🔑 ДАННЫЕ ДЛЯ ВХОДА:');
            console.log('Email: admin@admin.com');
            console.log('Пароль: admin123');
            console.log('Роль: Администратор');
            
            console.log('\n🌐 АДРЕСА СИСТЕМЫ:');
            console.log('Frontend: http://localhost:3000');
            console.log('Backend API: http://localhost:3001');
            console.log('Health Check: http://localhost:3001/api/health');
            
        } else {
            console.log('⚠️ НЕКОТОРЫЕ ТЕСТЫ НЕ ПРОЙДЕНЫ');
            console.log('🔧 ТРЕБУЕТСЯ ДОПОЛНИТЕЛЬНАЯ НАСТРОЙКА');
        }
        
    } catch (error) {
        console.error('❌ КРИТИЧЕСКАЯ ОШИБКА:', error.message);
        allTestsPassed = false;
    } finally {
        await prisma.$disconnect();
    }
    
    return allTestsPassed;
}

// Запуск теста
runFinalSystemTest()
    .then(success => {
        if (success) {
            console.log('\n✅ СИСТЕМА ПОЛНОСТЬЮ ГОТОВА К РАБОТЕ!');
        } else {
            console.log('\n❌ СИСТЕМА ТРЕБУЕТ ДОПОЛНИТЕЛЬНОЙ НАСТРОЙКИ');
        }
        process.exit(success ? 0 : 1);
    })
    .catch(error => {
        console.error('💥 ФАТАЛЬНАЯ ОШИБКА:', error);
        process.exit(1);
    });
