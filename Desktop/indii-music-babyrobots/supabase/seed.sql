-- Seed data for Indii Music Platform
-- This populates the database with initial roles, permissions, and system data

-- Insert default roles
INSERT INTO roles (name, display_name, description, is_system, level) VALUES
('super_admin', 'Super Administrator', 'Full system access with all permissions', true, 100),
('admin', 'Administrator', 'Administrative access to manage users and content', true, 90),
('moderator', 'Moderator', 'Content moderation and user management', true, 50),
('artist', 'Artist', 'Music creator with track upload and management capabilities', true, 10),
('fan', 'Fan', 'Music listener with playlist and social features', true, 10),
('licensor', 'Licensor', 'Music licensing entity', true, 20),
('service_provider', 'Service Provider', 'Music industry service provider', true, 20),
('premium_user', 'Premium User', 'Enhanced features and capabilities', false, 15),
('beta_tester', 'Beta Tester', 'Access to experimental features', false, 5);

-- Insert permissions for different resources and actions
INSERT INTO permissions (name, display_name, description, resource, action, scope) VALUES
-- User management permissions
('manage_all_users', 'Manage All Users', 'Full user management capabilities', 'users', 'MANAGE', 'all'),
('read_all_users', 'Read All Users', 'View all user profiles', 'users', 'READ', 'all'),
('update_own_profile', 'Update Own Profile', 'Update personal profile', 'users', 'UPDATE', 'own'),
('delete_own_account', 'Delete Own Account', 'Delete personal account', 'users', 'DELETE', 'own'),

-- Track management permissions
('create_tracks', 'Create Tracks', 'Upload and create new tracks', 'tracks', 'CREATE', 'own'),
('read_public_tracks', 'Read Public Tracks', 'View public tracks', 'tracks', 'READ', 'public'),
('read_own_tracks', 'Read Own Tracks', 'View personal tracks', 'tracks', 'READ', 'own'),
('update_own_tracks', 'Update Own Tracks', 'Edit personal tracks', 'tracks', 'UPDATE', 'own'),
('delete_own_tracks', 'Delete Own Tracks', 'Delete personal tracks', 'tracks', 'DELETE', 'own'),
('manage_all_tracks', 'Manage All Tracks', 'Full track management', 'tracks', 'MANAGE', 'all'),
('moderate_tracks', 'Moderate Tracks', 'Moderate track content', 'tracks', 'MODERATE', 'public'),

-- Comment and rating permissions
('create_comments', 'Create Comments', 'Post comments on tracks', 'comments', 'CREATE', 'public'),
('rate_tracks', 'Rate Tracks', 'Rate and review tracks', 'tracks', 'RATE', 'public'),
('moderate_comments', 'Moderate Comments', 'Moderate user comments', 'comments', 'MODERATE', 'public'),

-- Admin and system permissions
('manage_roles', 'Manage Roles', 'Assign and manage user roles', 'roles', 'MANAGE', 'all'),
('view_admin_panel', 'View Admin Panel', 'Access administrative interface', 'admin', 'READ', 'all'),
('manage_system_settings', 'Manage System Settings', 'Configure system settings', 'system', 'MANAGE', 'all'),
('view_security_logs', 'View Security Logs', 'Access security audit logs', 'security', 'READ', 'all'),

-- Content creation and sharing
('upload_audio', 'Upload Audio', 'Upload audio files', 'audio', 'UPLOAD', 'own'),
('download_tracks', 'Download Tracks', 'Download audio tracks', 'tracks', 'DOWNLOAD', 'public'),
('share_tracks', 'Share Tracks', 'Share tracks publicly', 'tracks', 'SHARE', 'own'),

-- Workspace and project permissions
('create_projects', 'Create Projects', 'Create new project workspaces', 'projects', 'CREATE', 'own'),
('manage_own_projects', 'Manage Own Projects', 'Manage personal projects', 'projects', 'MANAGE', 'own'),

-- Premium features
('access_analytics', 'Access Analytics', 'View detailed track analytics', 'analytics', 'READ', 'own'),
('priority_support', 'Priority Support', 'Access to priority customer support', 'support', 'READ', 'own'),
('beta_features', 'Beta Features', 'Access to experimental features', 'features', 'READ', 'own');

-- Assign permissions to roles
-- Super Admin gets everything
INSERT INTO role_permissions (role_id, permission_id, is_granted)
SELECT r.id, p.id, true
FROM roles r, permissions p
WHERE r.name = 'super_admin';

-- Admin role permissions
INSERT INTO role_permissions (role_id, permission_id, is_granted)
SELECT r.id, p.id, true
FROM roles r, permissions p
WHERE r.name = 'admin' AND p.name IN (
    'manage_all_users', 'read_all_users', 'manage_all_tracks', 'moderate_tracks',
    'moderate_comments', 'manage_roles', 'view_admin_panel', 'view_security_logs'
);

-- Moderator role permissions
INSERT INTO role_permissions (role_id, permission_id, is_granted)
SELECT r.id, p.id, true
FROM roles r, permissions p
WHERE r.name = 'moderator' AND p.name IN (
    'read_all_users', 'moderate_tracks', 'moderate_comments', 'view_security_logs'
);

-- Artist role permissions
INSERT INTO role_permissions (role_id, permission_id, is_granted)
SELECT r.id, p.id, true
FROM roles r, permissions p
WHERE r.name = 'artist' AND p.name IN (
    'update_own_profile', 'delete_own_account', 'create_tracks', 'read_public_tracks',
    'read_own_tracks', 'update_own_tracks', 'delete_own_tracks', 'create_comments',
    'rate_tracks', 'upload_audio', 'download_tracks', 'share_tracks',
    'create_projects', 'manage_own_projects'
);

-- Fan role permissions
INSERT INTO role_permissions (role_id, permission_id, is_granted)
SELECT r.id, p.id, true
FROM roles r, permissions p
WHERE r.name = 'fan' AND p.name IN (
    'update_own_profile', 'delete_own_account', 'read_public_tracks',
    'create_comments', 'rate_tracks', 'download_tracks'
);

-- Licensor role permissions
INSERT INTO role_permissions (role_id, permission_id, is_granted)
SELECT r.id, p.id, true
FROM roles r, permissions p
WHERE r.name = 'licensor' AND p.name IN (
    'update_own_profile', 'delete_own_account', 'read_public_tracks',
    'download_tracks', 'create_projects', 'manage_own_projects'
);

-- Service Provider role permissions
INSERT INTO role_permissions (role_id, permission_id, is_granted)
SELECT r.id, p.id, true
FROM roles r, permissions p
WHERE r.name = 'service_provider' AND p.name IN (
    'update_own_profile', 'delete_own_account', 'read_public_tracks',
    'create_projects', 'manage_own_projects'
);

-- Premium User additional permissions
INSERT INTO role_permissions (role_id, permission_id, is_granted)
SELECT r.id, p.id, true
FROM roles r, permissions p
WHERE r.name = 'premium_user' AND p.name IN (
    'access_analytics', 'priority_support'
);

-- Beta Tester permissions
INSERT INTO role_permissions (role_id, permission_id, is_granted)
SELECT r.id, p.id, true
FROM roles r, permissions p
WHERE r.name = 'beta_tester' AND p.name IN (
    'beta_features'
);

-- Create a default admin user (you should change these credentials)
INSERT INTO users (email, password_hash, username, first_name, last_name, profile_type) VALUES
('admin@indii.music', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/lewdBWnVkVBOdnPZe', 'admin', 'System', 'Administrator', 'service_provider');

-- Assign super_admin role to the default admin user
INSERT INTO user_roles (user_id, role_id, assigned_by, assigned_at)
SELECT u.id, r.id, u.id, CURRENT_TIMESTAMP
FROM users u, roles r
WHERE u.email = 'admin@indii.music' AND r.name = 'super_admin';

-- Create service provider profile for admin user
INSERT INTO service_provider_profiles (user_id, company_name, service_type, description)
SELECT id, 'Indii Music', 'Platform Administration', 'System administration and platform management'
FROM users
WHERE email = 'admin@indii.music';

COMMENT ON TABLE roles IS 'System roles defining user capabilities and access levels';
COMMENT ON TABLE permissions IS 'Granular permissions for specific actions and resources';
COMMENT ON TABLE role_permissions IS 'Junction table mapping roles to their permissions';
