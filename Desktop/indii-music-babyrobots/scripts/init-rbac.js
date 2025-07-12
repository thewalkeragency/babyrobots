/**
 * RBAC Initialization Script
 * Sets up default roles, permissions, and role-permission mappings
 */

import rbacService from '../src/lib/rbac-service.js';

async function initializeRBAC() {
  try {
    console.log('🚀 Initializing RBAC system...');
    
    // Initialize basic roles and permissions
    await rbacService.initializeRoles();
    
    // Set up default role-permission mappings
    await setupRolePermissions();
    
    console.log('✅ RBAC system initialized successfully!');
    
    // Display summary
    const roles = await rbacService.getAllRoles();
    console.log(`\n📊 Summary:`);
    console.log(`   Roles created: ${roles.length}`);
    
    roles.forEach(role => {
      console.log(`   - ${role.displayName} (${role.rolePermissions?.length || 0} permissions)`);
    });
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error initializing RBAC:', error);
    process.exit(1);
  }
}

async function setupRolePermissions() {
  try {
    console.log('🔧 Setting up role-permission mappings...');
    
    // Get all roles and permissions
    const roles = await rbacService.getAllRoles();
    const roleMap = {};
    roles.forEach(role => {
      roleMap[role.name] = role.id;
    });

    // Define role-permission mappings
    const mappings = [
      // Super Admin - all permissions
      { role: 'super_admin', permissions: [
        'manage_users', 'create_user', 'read_users', 'update_user', 'delete_user',
        'create_profile', 'read_profile', 'update_profile', 'delete_profile',
        'create_track', 'read_tracks', 'update_track', 'delete_track', 'download_track', 'upload_track',
        'moderate_content', 'report_content', 'access_admin', 'manage_roles',
        'comment', 'rate'
      ]},
      
      // Admin - most permissions except super admin functions
      { role: 'admin', permissions: [
        'manage_users', 'read_users', 'update_user',
        'create_profile', 'read_profile', 'update_profile',
        'create_track', 'read_tracks', 'update_track', 'delete_track', 'download_track', 'upload_track',
        'moderate_content', 'report_content', 'access_admin',
        'comment', 'rate'
      ]},
      
      // Moderator - content and user moderation
      { role: 'moderator', permissions: [
        'read_users', 'read_profile', 'read_tracks', 'moderate_content', 'report_content',
        'comment', 'rate'
      ]},
      
      // Premium User - enhanced features
      { role: 'premium_user', permissions: [
        'create_profile', 'read_profile', 'update_profile',
        'create_track', 'read_tracks', 'update_track', 'delete_track', 'download_track', 'upload_track',
        'comment', 'rate'
      ]},
      
      // Artist - track management and basic features
      { role: 'artist', permissions: [
        'create_profile', 'read_profile', 'update_profile',
        'create_track', 'read_tracks', 'update_track', 'delete_track', 'upload_track',
        'comment', 'rate'
      ]},
      
      // Fan - basic interaction features
      { role: 'fan', permissions: [
        'create_profile', 'read_profile', 'update_profile', 'read_tracks',
        'comment', 'rate', 'report_content'
      ]},
      
      // Licensor - profile and content access
      { role: 'licensor', permissions: [
        'create_profile', 'read_profile', 'update_profile', 'read_tracks',
        'download_track', 'comment', 'rate'
      ]},
      
      // Service Provider - profile and basic features
      { role: 'service_provider', permissions: [
        'create_profile', 'read_profile', 'update_profile', 'read_tracks',
        'comment', 'rate'
      ]}
    ];

    // Apply mappings
    for (const mapping of mappings) {
      const roleId = roleMap[mapping.role];
      if (!roleId) {
        console.warn(`⚠️  Role '${mapping.role}' not found, skipping...`);
        continue;
      }

      console.log(`   Setting up permissions for ${mapping.role}...`);
      
      for (const permissionName of mapping.permissions) {
        try {
          // Get permission by name (we need to query the database)
          const permission = await rbacService.prisma.permission.findUnique({
            where: { name: permissionName }
          });
          
          if (!permission) {
            console.warn(`     ⚠️  Permission '${permissionName}' not found`);
            continue;
          }

          await rbacService.assignPermissionToRole(roleId, permission.id, true);
        } catch (error) {
          if (!error.message.includes('Unique constraint')) {
            console.warn(`     ⚠️  Error assigning '${permissionName}': ${error.message}`);
          }
        }
      }
    }

    console.log('✅ Role-permission mappings completed');
  } catch (error) {
    console.error('Error setting up role permissions:', error);
    throw error;
  }
}

// Run the initialization
initializeRBAC();
