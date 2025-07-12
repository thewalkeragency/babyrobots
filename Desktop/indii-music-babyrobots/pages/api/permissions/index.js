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
      
      // Check if user has permission to view permissions
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

      // Check if user has permission to view permissions or is admin
      const hasPermissionViewAccess = userWithRoles.userRoles.some(userRole => 
        userRole.role.rolePermissions.some(rolePermission => 
          rolePermission.permission.resource === 'permissions' && 
          (rolePermission.permission.action === 'MANAGE' || rolePermission.permission.action === 'READ') &&
          rolePermission.isGranted
        ) || userRole.role.name === 'admin'
      );

      if (!hasPermissionViewAccess) {
        return res.status(403).json({ error: 'Insufficient permissions to view permissions' });
      }

      // Get all permissions grouped by resource
      const permissions = await prisma.permission.findMany({
        include: {
          rolePermissions: {
            include: {
              role: true
            }
          }
        },
        orderBy: [
          { resource: 'asc' },
          { action: 'asc' },
          { scope: 'asc' }
        ]
      });

      // Group permissions by resource
      const groupedPermissions = permissions.reduce((acc, permission) => {
        if (!acc[permission.resource]) {
          acc[permission.resource] = [];
        }
        acc[permission.resource].push({
          ...permission,
          assignedRoles: permission.rolePermissions.map(rp => ({
            role: rp.role,
            isGranted: rp.isGranted
          }))
        });
        return acc;
      }, {});

      res.status(200).json({ 
        success: true,
        permissions: groupedPermissions,
        totalCount: permissions.length
      });

    } catch (error) {
      console.error('Permissions fetch error:', error);
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
      
      // Check if user has permission to create permissions
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

      // Check if user has MANAGE permission for permissions or is admin
      const hasPermissionManageAccess = userWithRoles.userRoles.some(userRole => 
        userRole.role.rolePermissions.some(rolePermission => 
          rolePermission.permission.resource === 'permissions' && 
          rolePermission.permission.action === 'MANAGE' &&
          rolePermission.isGranted
        ) || userRole.role.name === 'admin'
      );

      if (!hasPermissionManageAccess) {
        return res.status(403).json({ error: 'Insufficient permissions to create permissions' });
      }

      const { name, displayName, description, resource, action, scope } = req.body;

      if (!name || !displayName || !resource || !action) {
        return res.status(400).json({ error: 'Name, display name, resource, and action are required' });
      }

      // Check if permission with same resource, action, scope already exists
      const existingPermission = await prisma.permission.findFirst({
        where: {
          resource,
          action,
          scope: scope || 'own'
        }
      });

      if (existingPermission) {
        return res.status(400).json({ error: 'Permission with this resource, action, and scope already exists' });
      }

      // Create new permission
      const newPermission = await prisma.permission.create({
        data: {
          name,
          displayName,
          description,
          resource,
          action,
          scope: scope || 'own',
          isSystem: false
        }
      });

      res.status(201).json({ 
        success: true, 
        message: 'Permission created successfully',
        permission: newPermission
      });

    } catch (error) {
      console.error('Permission creation error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  } 
  else {
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).json({ error: 'Method not allowed' });
  }
}
