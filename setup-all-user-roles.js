const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function createTestUsersForAllRoles() {
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
                        'supplier@himkaplastic.ru',
                        'test@admin.com'
                    ]
                }
            }
        });

        console.log('👑 Creating Administrator account...');
        const adminPassword = await bcrypt.hash('admin123', 10);
        const admin = await prisma.user.create({
            data: {
                email: 'admin@himkaplastic.ru',
                name: 'System Administrator',
                password: adminPassword,
                role: 'admin',
                isAdmin: true,
                companyName: 'Himka Plastic Administration',
                dashboardSettings: JSON.stringify([
                    { id: 'w1', type: 'totalOrders', position: 0, size: 'small' },
                    { id: 'w2', type: 'totalEarnings', position: 1, size: 'medium' },
                    { id: 'w3', type: 'analytics', position: 2, size: 'large' }
                ])
            }
        });

        console.log('👨‍💼 Creating Manager account...');
        const managerPassword = await bcrypt.hash('manager123', 10);
        const manager = await prisma.user.create({
            data: {
                email: 'manager@himkaplastic.ru',
                name: 'Department Manager',
                password: managerPassword,
                role: 'manager',
                isAdmin: false,
                companyName: 'Himka Plastic Management',
                dashboardSettings: JSON.stringify([
                    { id: 'w1', type: 'totalOrders', position: 0, size: 'medium' },
                    { id: 'w2', type: 'totalEarnings', position: 1, size: 'small' }
                ])
            }
        });

        console.log('👤 Creating Regular User account...');
        const userPassword = await bcrypt.hash('user123', 10);
        const regularUser = await prisma.user.create({
            data: {
                email: 'user@himkaplastic.ru',
                name: 'Regular User',
                password: userPassword,
                role: 'user',
                isAdmin: false,
                companyName: 'Client Company LLC',
                inn: '1234567890',
                kpp: '123456789',
                billingAddress: 'Moscow, Russia',
                dashboardSettings: JSON.stringify([
                    { id: 'w1', type: 'totalOrders', position: 0, size: 'small' }
                ])
            }
        });

        console.log('🚚 Creating Supplier account...');
        const supplierPassword = await bcrypt.hash('supplier123', 10);
        const supplier = await prisma.user.create({
            data: {
                email: 'supplier@himkaplastic.ru',
                name: 'Material Supplier',
                password: supplierPassword,
                role: 'supplier',
                isAdmin: false,
                companyName: 'EcoSupplier Ltd',
                inn: '9876543210',
                kpp: '987654321',
                billingAddress: 'St. Petersburg, Russia',
                dashboardSettings: JSON.stringify([
                    { id: 'w1', type: 'totalOrders', position: 0, size: 'medium' },
                    { id: 'w2', type: 'materials', position: 1, size: 'large' }
                ])
            }
        });

        console.log('✅ Test users created successfully!');
        console.log('\n📋 Login Credentials:');
        console.log('┌─────────────────────────────────────────────────────────────┐');
        console.log('│                    ADMINISTRATOR                            │');
        console.log('│ Email: admin@himkaplastic.ru                               │');
        console.log('│ Password: admin123                                         │');
        console.log('│ Role: Full system access, user management, analytics      │');
        console.log('├─────────────────────────────────────────────────────────────┤');
        console.log('│                      MANAGER                               │');
        console.log('│ Email: manager@himkaplastic.ru                             │');
        console.log('│ Password: manager123                                       │');
        console.log('│ Role: Department management, order oversight               │');
        console.log('├─────────────────────────────────────────────────────────────┤');
        console.log('│                   REGULAR USER                             │');
        console.log('│ Email: user@himkaplastic.ru                                │');
        console.log('│ Password: user123                                          │');
        console.log('│ Role: Place orders, view own data, basic dashboard        │');
        console.log('├─────────────────────────────────────────────────────────────┤');
        console.log('│                     SUPPLIER                               │');
        console.log('│ Email: supplier@himkaplastic.ru                            │');
        console.log('│ Password: supplier123                                      │');
        console.log('│ Role: Material supply, inventory management                │');
        console.log('└─────────────────────────────────────────────────────────────┘');
        console.log('\n🌐 Access the system at: http://localhost:3000');

        // Create some test orders for demonstration
        console.log('\n📦 Creating sample orders...');
        
        await prisma.order.create({
            data: {
                userId: regularUser.id,
                materialType: 'PVC',
                volume: 500.0,
                price: 25000.0,
                environmentalImpact: 0.8,
                status: 'completed',
                pickupAddress: 'Moscow, Warehouse District',
                paymentStatus: 'paid',
                paymentMethod: 'bank_transfer',
                invoiceNumber: 'INV-2025-001'
            }
        });

        await prisma.order.create({
            data: {
                userId: supplier.id,
                materialType: 'PP',
                volume: 1000.0,
                price: 45000.0,
                environmentalImpact: 0.9,
                status: 'pending',
                pickupAddress: 'St. Petersburg, Industrial Zone',
                paymentStatus: 'pending',
                paymentMethod: 'credit_card'
            }
        });

        console.log('✅ Sample orders created!');

    } catch (error) {
        console.error('❌ Error creating test users:', error);
        
        if (error.code === 'P2002') {
            console.log('⚠️  Some users already exist. Try deleting them first or use different emails.');
        }
    } finally {
        await prisma.$disconnect();
    }
}

// Run the script
createTestUsersForAllRoles();
