const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: 'file:./dev.db',
    },
  },
});

async function assignAdminRole() {
  try {
    console.log('🔐 Assigning admin role to test user...');

    // Debug: List all users
    const allUsers = await prisma.user.findMany();
    console.log('All users in database:');
    allUsers.forEach(user => {
      console.log(`  - ID: ${user.id}, Email: ${user.email}`);
    });

    // Find the admin role
    const adminRole = await prisma.role.findUnique({
      where: { name: 'admin' }
    });

    if (!adminRole) {
      console.error('❌ Admin role not found. Please run seed-roles.js first.');
      return;
    }

    // Find or create the test user (admin@test.com)
    let testUser = await prisma.user.findUnique({
      where: { email: 'admin@test.com' }
    });

    if (!testUser) {
      console.log('Creating admin@test.com user...');
      const bcrypt = require('bcrypt');
      const hashedPassword = await bcrypt.hash('admin123', 10);
      
      testUser = await prisma.user.create({
        data: {
          email: 'admin@test.com',
          passwordHash: hashedPassword,
          username: 'admin',
          profileType: 'artist'
        }
      });
      console.log('✅ Admin user created successfully.');
    }

    // Check if user already has admin role
    const existingUserRole = await prisma.userRole.findUnique({
      where: {
        userId_roleId: {
          userId: testUser.id,
          roleId: adminRole.id
        }
      }
    });

    if (existingUserRole) {
      console.log('⚠️  User already has admin role assigned.');
      return;
    }

    // Assign admin role to user
    await prisma.userRole.create({
      data: {
        userId: testUser.id,
        roleId: adminRole.id,
        isActive: true,
        assignedBy: testUser.id // Self-assigned for this test
      }
    });

    console.log('✅ Admin role assigned successfully to admin@test.com');

    // Verify the assignment
    const userWithRoles = await prisma.user.findUnique({
      where: { id: testUser.id },
      include: {
        userRoles: {
          include: {
            role: true
          }
        }
      }
    });

    console.log('📋 User roles:');
    userWithRoles.userRoles.forEach(userRole => {
      console.log(`  - ${userRole.role.displayName} (${userRole.role.name})`);
    });

  } catch (error) {
    console.error('❌ Error assigning admin role:', error);
  } finally {
    await prisma.$disconnect();
  }
}

assignAdminRole();
