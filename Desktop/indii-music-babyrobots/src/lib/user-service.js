import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

export class UserService {
  /**
   * Create a new user using Prisma
   */
  static async createUser({ email, password, username, firstName, lastName, profileType }) {
    try {
      // Hash password
      const saltRounds = 12;
      const passwordHash = await bcrypt.hash(password, saltRounds);

      // Create user via Prisma
      const user = await prisma.user.create({
        data: {
          email: email.toLowerCase(),
          passwordHash,
          username,
          firstName,
          lastName,
          profileType: profileType || 'fan',
        },
      });

      console.log('✅ User created via Prisma:', { id: user.id, email: user.email });
      return user;
    } catch (error) {
      console.error('❌ Error creating user via Prisma:', error);
      throw error;
    }
  }

  /**
   * Find user by email
   */
  static async findUserByEmail(email) {
    try {
      return await prisma.user.findUnique({
        where: { email: email.toLowerCase() },
      });
    } catch (error) {
      console.error('❌ Error finding user by email:', error);
      throw error;
    }
  }

  /**
   * Find user by ID
   */
  static async findUserById(id) {
    try {
      return await prisma.user.findUnique({
        where: { id: parseInt(id) },
      });
    } catch (error) {
      console.error('❌ Error finding user by ID:', error);
      throw error;
    }
  }

  /**
   * Validate user credentials
   */
  static async validateCredentials(email, password) {
    try {
      const user = await this.findUserByEmail(email);
      if (!user) {
        return null;
      }

      const isValid = await bcrypt.compare(password, user.passwordHash);
      if (!isValid) {
        return null;
      }

      return user;
    } catch (error) {
      console.error('❌ Error validating credentials:', error);
      throw error;
    }
  }

  /**
   * Update user password
   */
  static async updatePassword(userId, newPassword) {
    try {
      const saltRounds = 12;
      const passwordHash = await bcrypt.hash(newPassword, saltRounds);

      const user = await prisma.user.update({
        where: { id: parseInt(userId) },
        data: { passwordHash },
      });

      return user;
    } catch (error) {
      console.error('❌ Error updating password:', error);
      throw error;
    }
  }

  /**
   * Get all users (admin function)
   */
  static async getAllUsers() {
    try {
      return await prisma.user.findMany({
        select: {
          id: true,
          email: true,
          username: true,
          firstName: true,
          lastName: true,
          profileType: true,
          createdAt: true,
          _count: {
            select: {
              sessions: true,
            },
          },
        },
      });
    } catch (error) {
      console.error('❌ Error getting all users:', error);
      throw error;
    }
  }

  /**
   * Create test users for development
   */
  static async createTestUsers() {
    const testUsers = [
      {
        email: 'artist@test.com',
        password: 'testpass123',
        username: 'testartist',
        firstName: 'Test',
        lastName: 'Artist',
        profileType: 'artist',
      },
      {
        email: 'fan@test.com',
        password: 'testpass123',
        username: 'testfan',
        firstName: 'Test',
        lastName: 'Fan',
        profileType: 'fan',
      },
      {
        email: 'admin@indii.music',
        password: 'admin123!',
        username: 'admin',
        firstName: 'Admin',
        lastName: 'User',
        profileType: 'service_provider',
      },
    ];

    const createdUsers = [];
    for (const userData of testUsers) {
      try {
        // Check if user already exists
        const existingUser = await this.findUserByEmail(userData.email);
        if (existingUser) {
          console.log(`⚠️ User ${userData.email} already exists, skipping`);
          createdUsers.push(existingUser);
          continue;
        }

        const user = await this.createUser(userData);
        createdUsers.push(user);
        console.log(`✅ Created test user: ${user.email}`);
      } catch (error) {
        console.error(`❌ Failed to create test user ${userData.email}:`, error);
      }
    }

    return createdUsers;
  }

  /**
   * Clean up - close Prisma connection
   */
  static async disconnect() {
    await prisma.$disconnect();
  }
}

export default UserService;
