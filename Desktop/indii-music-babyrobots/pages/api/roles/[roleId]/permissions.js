import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

export default async function handler(req, res) {
  const { roleId } = req.query;

  if (req.method === 'GET') {
    try {
      // Verify authentication
      const token = req.headers.authorization?.replace('Bearer ', '');
      if (!token) {
        return res.status(401).json({ error: 'No token provided' });
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
      
      // Check if user has permission to view role permissions
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

      // Check if user has permission to view roles or is admin
      const hasRoleViewAccess = userWithRoles.userRoles.some(userRole => 
        userRole.role.rolePermissions.some(rolePermission => 
          rolePermission.permission.resource === 'roles' && 
          (rolePermission.permission.action === 'MANAGE' || rolePermission.permission.action === 'READ') &&
          rolePermission.isGranted
        ) || userRole.role.name === 'admin'
      );

      if (!hasRoleViewAccess) {
        return res.status(403).json({ error: 'Insufficient permissions to view role permissions' });
      }

      // Get role with its permissions
      const role = await prisma.role.findUnique({
        where: { id: parseInt(roleId) },
        include: {
          rolePermissions: {
            include: {
              permission: true
            }
          }
        }
      });

      if (!role) {
        return res.status(404).json({ error: 'Role not found' });
      }

      res.status(200).json({ 
        success: true,
        role: {
          ...role,
          permissions: role.rolePermissions.map(rp => ({
            ...rp.permission,
            isGranted: rp.isGranted,
            assignedAt: rp.createdAt
          }))
        }
      });

    } catch (error) {
      console.error('Role permissions fetch error:', error);
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
      
      // Check if user has permission to manage role permissions
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
      const hasRoleManageAccess = userWithRoles.userRoles.some(userRole => 
        userRole.role.rolePermissions.some(rolePermission => 
          rolePermission.permission.resource === 'roles' && 
          rolePermission.permission.action === 'MANAGE' &&
          rolePermission.isGranted
        ) || userRole.role.name === 'admin'
      );

      if (!hasRoleManageAccess) {
        return res.status(403).json({ error: 'Insufficient permissions to manage role permissions' });
      }

      const { permissionId, isGranted } = req.body;

      if (!permissionId) {
        return res.status(400).json({ error: 'Permission ID is required' });
      }

      // Check if role exists
      const role = await prisma.role.findUnique({
        where: { id: parseInt(roleId) }
      });

      if (!role) {
        return res.status(404).json({ error: 'Role not found' });
      }

      // Check if permission exists
      const permission = await prisma.permission.findUnique({
        where: { id: parseInt(permissionId) }
      });

      if (!permission) {
        return res.status(404).json({ error: 'Permission not found' });
      }

      // Check if role-permission assignment already exists
      const existingAssignment = await prisma.rolePermission.findUnique({
        where: {
          roleId_permissionId: {
            roleId: parseInt(roleId),
            permissionId: parseInt(permissionId)
          }
        }
      });

      let result;

      if (existingAssignment) {
        // Update existing assignment
        result = await prisma.rolePermission.update({
          where: {
            roleId_permissionId: {
              roleId: parseInt(roleId),
              permissionId: parseInt(permissionId)
            }
          },
          data: {
            isGranted: isGranted !== undefined ? isGranted : true
          },
          include: {
            role: true,
            permission: true
          }
        });
      } else {
        // Create new assignment
        result = await prisma.rolePermission.create({
          data: {
            roleId: parseInt(roleId),
            permissionId: parseInt(permissionId),
            isGranted: isGranted !== undefined ? isGranted : true
          },
          include: {
            role: true,
            permission: true
          }
        });
      }

      res.status(200).json({ 
        success: true, 
        message: 'Role permission assignment updated successfully',
        rolePermission: result
      });

    } catch (error) {
      console.error('Role permission assignment error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
  else if (req.method === 'DELETE') {
    try {
      // Verify authentication and admin access
      const token = req.headers.authorization?.replace('Bearer ', '');
      if (!token) {
        return res.status(401).json({ error: 'No token provided' });
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
      
      // Check if user has permission to manage role permissions
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
      const hasRoleManageAccess = userWithRoles.userRoles.some(userRole => 
        userRole.role.rolePermissions.some(rolePermission => 
          rolePermission.permission.resource === 'roles' && 
          rolePermission.permission.action === 'MANAGE' &&
          rolePermission.isGranted
        ) || userRole.role.name === 'admin'
      );

      if (!hasRoleManageAccess) {
        return res.status(403).json({ error: 'Insufficient permissions to manage role permissions' });
      }

      const { permissionId } = req.body;

      if (!permissionId) {
        return res.status(400).json({ error: 'Permission ID is required' });
      }

      // Remove role-permission assignment
      const deleted = await prisma.rolePermission.delete({
        where: {
          roleId_permissionId: {
            roleId: parseInt(roleId),
            permissionId: parseInt(permissionId)
          }
        }
      });

      res.status(200).json({ 
        success: true, 
        message: 'Role permission assignment removed successfully'
      });

    } catch (error) {
      console.error('Role permission removal error:', error);
      if (error.code === 'P2025') {
        return res.status(404).json({ error: 'Role permission assignment not found' });
      }
      res.status(500).json({ error: 'Internal server error' });
    }
  }
  else {
    res.setHeader('Allow', ['GET', 'POST', 'DELETE']);
    res.status(405).json({ error: 'Method not allowed' });
  }
}
