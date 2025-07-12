import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      // Verify authentication
      const token = req.headers.authorization?.replace('Bearer ', '');
      if (!token) {
        return res.status(401).json({ error: 'No token provided' });
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
      console.log('Decoded token:', decoded);
      
      // Get user with roles
      const userWithRoles = await prisma.user.findUnique({
        where: { id: decoded.userId },
        include: {
          userRoles: {
            include: {
              role: {
                include: {
                  rolePermissions: {
                    include: {
                      permission: true
                    }
                  }
                }
              }
            }
          }
        }
      });

      if (!userWithRoles) {
        return res.status(404).json({ error: 'User not found' });
      }

      console.log('User with roles:', JSON.stringify(userWithRoles, null, 2));

      return res.status(200).json({
        success: true,
        user: {
          id: userWithRoles.id,
          email: userWithRoles.email,
          roles: userWithRoles.userRoles.map(ur => ({
            name: ur.role.name,
            displayName: ur.role.displayName,
            permissions: ur.role.rolePermissions.map(rp => ({
              name: rp.permission.name,
              action: rp.permission.action,
              resource: rp.permission.resource,
              scope: rp.permission.scope,
              isGranted: rp.isGranted
            }))
          }))
        }
      });

    } catch (error) {
      console.error('Auth test error:', error);
      return res.status(500).json({ error: 'Internal server error', details: error.message });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).json({ error: 'Method not allowed' });
  }
}
