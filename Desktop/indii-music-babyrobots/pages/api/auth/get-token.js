import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

export default async function handler(req, res) {
  if (req.method === 'POST') {
    try {
      const { email, password } = req.body;

      // For testing: hardcode admin user credentials
      if (email === 'admin@test.com' && password === 'admin123') {
        const token = jwt.sign(
          { 
            userId: 5, 
            email: 'admin@test.com' 
          },
          process.env.JWT_SECRET || 'your-secret-key',
          { expiresIn: '24h' }
        );

        return res.status(200).json({ 
          success: true,
          token,
          user: {
            id: 5,
            email: 'admin@test.com',
            roles: ['admin']
          }
        });
      }

      return res.status(401).json({ error: 'Invalid test credentials' });

    } catch (error) {
      console.error('Token generation error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).json({ error: 'Method not allowed' });
  }
}
