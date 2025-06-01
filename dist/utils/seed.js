"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.seedDatabase = seedDatabase;
// Script to seed the database with test data
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
function seedDatabase() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            console.log('🌱 Seeding database with test data...');
            // Create test users
            const testUsers = [
                {
                    email: 'test@example.com',
                    name: 'Тестовый Пользователь',
                    password: 'password123',
                    isAdmin: false,
                    role: 'client',
                    companyName: 'ООО Тест',
                    dashboardSettings: JSON.stringify([
                        { id: 'w1', type: 'totalOrders', position: 0, size: 'small' },
                        { id: 'w2', type: 'totalEarnings', position: 1, size: 'small' },
                        { id: 'w3', type: 'environmentalImpact', position: 2, size: 'small' },
                    ])
                },
                {
                    email: 'admin@admin.com',
                    name: 'Администратор',
                    password: 'admin123',
                    isAdmin: true,
                    role: 'admin',
                    companyName: 'ООО Химка Пластик',
                    dashboardSettings: JSON.stringify([
                        { id: 'w1', type: 'totalOrders', position: 0, size: 'small' },
                        { id: 'w2', type: 'totalEarnings', position: 1, size: 'small' },
                        { id: 'w3', type: 'environmentalImpact', position: 2, size: 'small' },
                    ])
                },
                {
                    email: 'manager@manager.com',
                    name: 'Менеджер',
                    password: 'manager123',
                    isAdmin: false,
                    role: 'manager',
                    companyName: 'ООО Химка Пластик',
                    dashboardSettings: JSON.stringify([
                        { id: 'w1', type: 'totalOrders', position: 0, size: 'small' },
                        { id: 'w2', type: 'totalEarnings', position: 1, size: 'small' },
                        { id: 'w3', type: 'environmentalImpact', position: 2, size: 'small' },
                    ])
                },
                {
                    email: 'logistic@logistic.com',
                    name: 'Логист',
                    password: 'logistic123',
                    isAdmin: false,
                    role: 'logistic',
                    companyName: 'ООО Химка Пластик',
                    dashboardSettings: JSON.stringify([
                        { id: 'w1', type: 'totalOrders', position: 0, size: 'small' },
                        { id: 'w2', type: 'totalEarnings', position: 1, size: 'small' },
                        { id: 'w3', type: 'environmentalImpact', position: 2, size: 'small' },
                    ])
                }
            ];
            // Check if users already exist, if not create them
            for (const userData of testUsers) {
                const existingUser = yield prisma.user.findUnique({
                    where: { email: userData.email }
                });
                if (!existingUser) {
                    const user = yield prisma.user.create({
                        data: userData
                    });
                    console.log(`✅ Created user: ${user.email} (${user.role})`);
                }
                else {
                    console.log(`⚠️  User already exists: ${userData.email}`);
                }
            }
            console.log('🎉 Database seeding completed!');
            console.log('\n📋 Test credentials:');
            console.log('  Client: test@example.com / password123');
            console.log('  Admin: admin@admin.com / admin123');
            console.log('  Manager: manager@manager.com / manager123');
            console.log('  Logistic: logistic@logistic.com / logistic123');
        }
        catch (error) {
            console.error('❌ Error seeding database:', error);
        }
        finally {
            yield prisma.$disconnect();
        }
    });
}
// Run the seed function if this script is executed directly
if (require.main === module) {
    seedDatabase();
}
