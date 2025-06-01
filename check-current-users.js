const { PrismaClient } = require('./ecotrack/node_modules/@prisma/client');

const prisma = new PrismaClient();

async function verifyUsers() {
    try {
        console.log('🔍 Checking existing users in database...');
        
        const users = await prisma.user.findMany({
            select: {
                email: true,
                name: true,
                role: true,
                isAdmin: true
            }
        });

        console.log(`Found ${users.length} users:`);
        
        users.forEach(user => {
            console.log(`📧 ${user.email} | 👤 ${user.name} | 🎭 ${user.role} | 👑 Admin: ${user.isAdmin}`);
        });

    } catch (error) {
        console.error('❌ Error checking users:', error.message);
    } finally {
        await prisma.$disconnect();
    }
}

verifyUsers();
