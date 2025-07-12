const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: 'file:./dev.db',
    },
  },
});

async function seedRolesAndPermissions() {
  try {
    console.log('🌱 Seeding roles and permissions...');

    // Create basic permissions first
    const permissions = [
      // User management permissions
      { name: 'view_users', displayName: 'View Users', resource: 'users', action: 'READ', scope: 'all' },
      { name: 'create_users', displayName: 'Create Users', resource: 'users', action: 'CREATE', scope: 'all' },
      { name: 'update_users', displayName: 'Update Users', resource: 'users', action: 'UPDATE', scope: 'all' },
      { name: 'delete_users', displayName: 'Delete Users', resource: 'users', action: 'DELETE', scope: 'all' },
      
      // Role management permissions
      { name: 'view_roles', displayName: 'View Roles', resource: 'roles', action: 'READ', scope: 'all' },
      { name: 'manage_roles', displayName: 'Manage Roles', resource: 'roles', action: 'MANAGE', scope: 'all' },
      
      // Permission management permissions
      { name: 'view_permissions', displayName: 'View Permissions', resource: 'permissions', action: 'READ', scope: 'all' },
      { name: 'manage_permissions', displayName: 'Manage Permissions', resource: 'permissions', action: 'MANAGE', scope: 'all' },
      
      // Profile permissions
      { name: 'view_own_profile', displayName: 'View Own Profile', resource: 'profiles', action: 'READ', scope: 'own' },
      { name: 'update_own_profile', displayName: 'Update Own Profile', resource: 'profiles', action: 'UPDATE', scope: 'own' },
      { name: 'view_all_profiles', displayName: 'View All Profiles', resource: 'profiles', action: 'READ', scope: 'all' },
      
      // Track permissions
      { name: 'create_tracks', displayName: 'Create Tracks', resource: 'tracks', action: 'CREATE', scope: 'own' },
      { name: 'view_own_tracks', displayName: 'View Own Tracks', resource: 'tracks', action: 'READ', scope: 'own' },
      { name: 'update_own_tracks', displayName: 'Update Own Tracks', resource: 'tracks', action: 'UPDATE', scope: 'own' },
      { name: 'delete_own_tracks', displayName: 'Delete Own Tracks', resource: 'tracks', action: 'DELETE', scope: 'own' },
      { name: 'view_all_tracks', displayName: 'View All Tracks', resource: 'tracks', action: 'READ', scope: 'all' },
      
      // Audio file permissions
      { name: 'upload_audio', displayName: 'Upload Audio', resource: 'audio', action: 'UPLOAD', scope: 'own' },
      { name: 'download_audio', displayName: 'Download Audio', resource: 'audio', action: 'DOWNLOAD', scope: 'public' },
    ];

    console.log('Creating permissions...');
    for (const permission of permissions) {
      const existingPermission = await prisma.permission.findFirst({
        where: {
          resource: permission.resource,
          action: permission.action,
          scope: permission.scope,
        },
      });

      if (!existingPermission) {
        await prisma.permission.create({
          data: {
            ...permission,
            isSystem: true,
          },
        });
        console.log(`  ✅ Created permission: ${permission.name}`);
      } else {
        console.log(`  ⚠️  Permission already exists: ${permission.name}`);
      }
    }

    // Create basic roles
    const roles = [
      { name: 'admin', displayName: 'Administrator', description: 'Full system access', level: 100 },
      { name: 'moderator', displayName: 'Moderator', description: 'Content moderation and user management', level: 50 },
      { name: 'artist', displayName: 'Artist', description: 'Music creators and performers', level: 10 },
      { name: 'fan', displayName: 'Fan', description: 'Music listeners and supporters', level: 5 },
      { name: 'licensor', displayName: 'Licensor', description: 'Content licensing and rights management', level: 20 },
      { name: 'service_provider', displayName: 'Service Provider', description: 'Music industry service providers', level: 15 },
    ];

    console.log('Creating roles...');
    for (const role of roles) {
      const existingRole = await prisma.role.findUnique({
        where: { name: role.name },
      });

      if (!existingRole) {
        await prisma.role.create({
          data: {
            ...role,
            isSystem: true,
            isActive: true,
          },
        });
        console.log(`  ✅ Created role: ${role.name}`);
      } else {
        console.log(`  ⚠️  Role already exists: ${role.name}`);
      }
    }

    // Assign permissions to roles
    console.log('Assigning permissions to roles...');

    // Admin gets all permissions
    const adminRole = await prisma.role.findUnique({ where: { name: 'admin' } });
    const allPermissions = await prisma.permission.findMany();

    for (const permission of allPermissions) {
      const existingAssignment = await prisma.rolePermission.findUnique({
        where: {
          roleId_permissionId: {
            roleId: adminRole.id,
            permissionId: permission.id,
          },
        },
      });

      if (!existingAssignment) {
        await prisma.rolePermission.create({
          data: {
            roleId: adminRole.id,
            permissionId: permission.id,
            isGranted: true,
          },
        });
      }
    }
    console.log(`  ✅ Assigned all permissions to admin role`);

    // Artist gets profile and track permissions
    const artistRole = await prisma.role.findUnique({ where: { name: 'artist' } });
    const artistPermissions = [
      'view_own_profile', 'update_own_profile', 'create_tracks', 'view_own_tracks', 
      'update_own_tracks', 'delete_own_tracks', 'upload_audio', 'download_audio'
    ];

    for (const permName of artistPermissions) {
      const permission = await prisma.permission.findUnique({ where: { name: permName } });
      if (permission) {
        const existingAssignment = await prisma.rolePermission.findUnique({
          where: {
            roleId_permissionId: {
              roleId: artistRole.id,
              permissionId: permission.id,
            },
          },
        });

        if (!existingAssignment) {
          await prisma.rolePermission.create({
            data: {
              roleId: artistRole.id,
              permissionId: permission.id,
              isGranted: true,
            },
          });
        }
      }
    }
    console.log(`  ✅ Assigned permissions to artist role`);

    // Fan gets basic permissions
    const fanRole = await prisma.role.findUnique({ where: { name: 'fan' } });
    const fanPermissions = ['view_own_profile', 'update_own_profile', 'download_audio'];

    for (const permName of fanPermissions) {
      const permission = await prisma.permission.findUnique({ where: { name: permName } });
      if (permission) {
        const existingAssignment = await prisma.rolePermission.findUnique({
          where: {
            roleId_permissionId: {
              roleId: fanRole.id,
              permissionId: permission.id,
            },
          },
        });

        if (!existingAssignment) {
          await prisma.rolePermission.create({
            data: {
              roleId: fanRole.id,
              permissionId: permission.id,
              isGranted: true,
            },
          });
        }
      }
    }
    console.log(`  ✅ Assigned permissions to fan role`);

    console.log('🎉 Roles and permissions seeded successfully!');

  } catch (error) {
    console.error('❌ Error seeding roles and permissions:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the seeding function
seedRolesAndPermissions();
