const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function createAllRoleUsers() {
    try {
        console.log('🧹 Cleaning existing test users...');
        
        // Delete existing test users
        await prisma.user.deleteMany({
            where: {
                email: {
                    in: [
                        'admin@himkaplastic.ru',
                        'manager@himkaplastic.ru',
                        'user@himkaplastic.ru',
                        'supplier@himkaplastic.ru'
                    ]
                }
            }
        });

        console.log('👑 Creating Administrator...');
        const adminPassword = await bcrypt.hash('admin123', 10);
        await prisma.user.create({
            data: {
                email: 'admin@himkaplastic.ru',
                name: 'System Administrator',
                password: adminPassword,
                role: 'admin',
                isAdmin: true,
                companyName: 'Himka Plastic Administration'
            }
        });

        console.log('👨‍💼 Creating Manager...');
        const managerPassword = await bcrypt.hash('manager123', 10);
        await prisma.user.create({
            data: {
                email: 'manager@himkaplastic.ru',
                name: 'Department Manager',
                password: managerPassword,
                role: 'manager',
                isAdmin: false,
                companyName: 'Himka Plastic Management'
            }
        });

        console.log('👤 Creating Regular User...');
        const userPassword = await bcrypt.hash('user123', 10);
        await prisma.user.create({
            data: {
                email: 'user@himkaplastic.ru',
                name: 'Regular User',
                password: userPassword,
                role: 'user',
                isAdmin: false,
                companyName: 'Client Company LLC'
            }
        });

        console.log('🚚 Creating Supplier...');
        const supplierPassword = await bcrypt.hash('supplier123', 10);
        await prisma.user.create({
            data: {
                email: 'supplier@himkaplastic.ru',
                name: 'Material Supplier',
                password: supplierPassword,
                role: 'supplier',
                isAdmin: false,
                companyName: 'EcoSupplier Ltd'
            }
        });

        console.log('✅ All users created successfully!');
        console.log('\n📋 LOGIN CREDENTIALS:');
        console.log('════════════════════════════════════════');
        console.log('👑 ADMINISTRATOR:');
        console.log('   Email: admin@himkaplastic.ru');
        console.log('   Password: admin123');
        console.log('   Access: Full system control');
        console.log('────────────────────────────────────────');
        console.log('👨‍💼 MANAGER:');
        console.log('   Email: manager@himkaplastic.ru');
        console.log('   Password: manager123');
        console.log('   Access: Department oversight');
        console.log('────────────────────────────────────────');
        console.log('👤 REGULAR USER:');
        console.log('   Email: user@himkaplastic.ru');
        console.log('   Password: user123');
        console.log('   Access: Basic user functions');
        console.log('────────────────────────────────────────');
        console.log('🚚 SUPPLIER:');
        console.log('   Email: supplier@himkaplastic.ru');
        console.log('   Password: supplier123');
        console.log('   Access: Supply management');
        console.log('════════════════════════════════════════');
        console.log('🌐 Login at: http://localhost:3000');

    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        await prisma.$disconnect();
    }
}

createAllRoleUsers();
