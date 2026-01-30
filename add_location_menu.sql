-- Add Location permissions
INSERT INTO permissions (id, name, description, resource, action, is_active)
VALUES 
  (RANDOM_UUID(), 'LOCATION_CREATE', 'Create new locations', 'LOCATION', 'CREATE', true),
  (RANDOM_UUID(), 'LOCATION_READ', 'View locations', 'LOCATION', 'READ', true),
  (RANDOM_UUID(), 'LOCATION_UPDATE', 'Update existing locations', 'LOCATION', 'UPDATE', true),
  (RANDOM_UUID(), 'LOCATION_DELETE', 'Delete locations', 'LOCATION', 'DELETE', true);

-- Add Location permissions to ADMIN role
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id 
FROM roles r, permissions p 
WHERE r.name = 'ADMIN' 
  AND p.resource = 'LOCATION';

-- Add Location menu item
INSERT INTO menu_items (id, menu_id, parent_id, title, url, icon, description, display_order, is_active, required_permission)
SELECT RANDOM_UUID(), m.id, NULL, 'Location Management', '/locations', 'location', 'Manage locations', 3, true, 'LOCATION_READ'
FROM menus m
WHERE m.name = 'Administration';
