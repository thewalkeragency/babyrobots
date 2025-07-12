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
      
      // Check if user has permission to view roles
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

      // Check if user has MANAGE permission for roles or is admin
      const hasRoleManagePermission = userWithRoles.userRoles.some(userRole => 
        userRole.role.rolePermissions.some(rolePermission => 
          rolePermission.permission.resource === 'roles' && 
          (rolePermission.permission.action === 'MANAGE' || rolePermission.permission.action === 'READ') &&
          rolePermission.isGranted
        ) || userRole.role.name === 'admin'
      );

      if (!hasRoleManagePermission) {
        return res.status(403).json({ error: 'Insufficient permissions to view roles' });
      }

      // Get all roles with their permissions
      const roles = await prisma.role.findMany({
        include: {
          rolePermissions: {
            include: {
              permission: true
            }
          },
          parentRole: true,
          childRoles: true,
          _count: {
            select: {
              userRoles: true
            }
          }
        },
        orderBy: [
          { level: 'asc' },
          { name: 'asc' }
        ]
      });

      res.status(200).json({ 
        success: true,
        roles: roles.map(role => ({
          ...role,
          userCount: role._count.userRoles,
          permissions: role.rolePermissions.map(rp => ({
            ...rp.permission,
            isGranted: rp.isGranted
          }))
        }))
      });

    } catch (error) {
      console.error('Roles fetch error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  } 
  else if (req.method === 'POST') {
    try {
      // Verify authentication and admin access
      const token = req.headers.authorization?.replace('Bearer ', '');
      if (!token) {
        return res.status(401).json({ error: 'No token provided' });
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
      
      // Check if user has permission to create roles
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

      // Check if user has MANAGE permission for roles or is admin
      const hasRoleManagePermission = userWithRoles.userRoles.some(userRole => 
        userRole.role.rolePermissions.some(rolePermission => 
          rolePermission.permission.resource === 'roles' && 
          rolePermission.permission.action === 'MANAGE' &&
          rolePermission.isGranted
        ) || userRole.role.name === 'admin'
      );

      if (!hasRoleManagePermission) {
        return res.status(403).json({ error: 'Insufficient permissions to create roles' });
      }

      const { name, displayName, description, parentRoleId, level } = req.body;

      if (!name || !displayName) {
        return res.status(400).json({ error: 'Name and display name are required' });
      }

      // Check if role name already exists
      const existingRole = await prisma.role.findUnique({
        where: { name }
      });

      if (existingRole) {
        return res.status(400).json({ error: 'Role name already exists' });
      }

      // Create new role
      const newRole = await prisma.role.create({
        data: {
          name,
          displayName,
          description,
          parentRoleId,
          level: level || 0,
          isSystem: false
        },
        include: {
          parentRole: true,
          rolePermissions: {
            include: {
              permission: true
            }
          }
        }
      });

      res.status(201).json({ 
        success: true, 
        message: 'Role created successfully',
        role: newRole
      });

    } catch (error) {
      console.error('Role creation error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  } 
  else {
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).json({ error: 'Method not allowed' });
  }
}
