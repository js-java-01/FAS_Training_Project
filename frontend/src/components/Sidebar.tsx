import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { menuApi } from '../api/menuApi';
import type { Menu } from '../types/menu';
import { usePermissions } from '../hooks/usePermissions';

const iconMap: { [key: string]: string } = {
  dashboard: '📊',
  person: '👤',
  people: '👥',
  security: '🔐',
  menu: '📋',
  settings: '⚙️',
  school: '🎓',
  assignment: '📝',
  grade: '📈',
};

export const Sidebar: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const [menus, setMenus] = useState<Menu[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { hasPermission, user } = usePermissions();
  const location = useLocation();

  useEffect(() => {
    console.log('=== USER PERMISSIONS ===');
    console.log('Full user object:', user);
    console.log('User email:', user?.email);
    console.log('Role:', user?.role);
    console.log('Permissions:', user?.permissions);
    console.log('Permission count:', user?.permissions?.length || 0);
    console.log('Permissions is Array?', Array.isArray(user?.permissions));
    if (user?.permissions && user.permissions.length > 0) {
      console.log('First 5 permissions:', user.permissions.slice(0, 5));
      console.log('Has USER_READ?', user.permissions.includes('USER_READ'));
      console.log('Has ROLE_READ?', user.permissions.includes('ROLE_READ'));
    }
    loadMenus();
  }, []);

  const loadMenus = async () => {
    try {
      const data = await menuApi.getActiveMenus();
      console.log('=== MENU DEBUG ===');
      console.log('Loaded menus:', data);
      console.log('Menu count:', data.length);
      data.forEach((menu, idx) => {
        console.log(`Menu ${idx + 1}: ${menu.name} - Items: ${menu.menuItems?.length || 0}`);
        menu.menuItems?.forEach((item) => {
          console.log(`  - ${item.title} (${item.url}) - Permission: ${item.requiredPermission || 'none'}`);
        });
      });
      setMenus(data);
    } catch (error) {
      console.error('Error loading menus:', error);
      if (error instanceof Error) {
        console.error('Error message:', error.message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const isActiveRoute = (url?: string) => {
    if (!url) return false;
    return location.pathname === url || location.pathname.startsWith(url + '/');
  };

  const canAccessMenuItem = (requiredPermission?: string) => {
    if (!requiredPermission) return true;
    const hasAccess = hasPermission(requiredPermission);
    console.log(`Permission check: ${requiredPermission} = ${hasAccess}`);
    return hasAccess;
  };

  if (isLoading) {
    return (
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-gray-900 text-white transform transition-transform duration-200 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0 lg:static lg:inset-0`}
      >
        <div className="flex items-center justify-center h-full">
          <div className="text-gray-400">Loading menu...</div>
        </div>
      </aside>
    );
  }

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-gray-900 text-white transform transition-transform duration-200 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0 lg:static lg:inset-0 overflow-y-auto`}
      >
        <div className="flex items-center justify-between h-16 px-4 bg-gray-800 lg:hidden">
          <span className="text-xl font-bold">Menu</span>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="py-4">
          {menus.map((menu) => (
            <div key={menu.id} className="mb-6">
              <div className="px-4 mb-2">
                <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  {menu.name}
                </h3>
              </div>

              <nav className="space-y-1">
                {menu.menuItems
                  .filter((item) => !item.parentId && canAccessMenuItem(item.requiredPermission))
                  .sort((a, b) => a.displayOrder - b.displayOrder)
                  .map((item) => (
                    <div key={item.id}>
                      {item.url ? (
                        <Link
                          to={item.url}
                          onClick={() => onClose()}
                          className={`flex items-center px-4 py-3 text-sm font-medium transition-colors ${
                            isActiveRoute(item.url)
                              ? 'bg-gray-800 text-white border-l-4 border-blue-500'
                              : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                          }`}
                        >
                          <span className="mr-3 text-lg">
                            {iconMap[item.icon || ''] || '📄'}
                          </span>
                          <span>{item.title}</span>
                        </Link>
                      ) : (
                        <div className="px-4 py-3 text-sm font-medium text-gray-400">
                          <span className="mr-3 text-lg">
                            {iconMap[item.icon || ''] || '📄'}
                          </span>
                          <span>{item.title}</span>
                        </div>
                      )}

                      {item.children && item.children.length > 0 && (
                        <div className="ml-4 space-y-1">
                          {item.children
                            .filter((child) => canAccessMenuItem(child.requiredPermission))
                            .sort((a, b) => a.displayOrder - b.displayOrder)
                            .map((child) => (
                              <Link
                                key={child.id}
                                to={child.url || '#'}
                                onClick={() => onClose()}
                                className={`flex items-center px-4 py-2 text-sm transition-colors ${
                                  isActiveRoute(child.url)
                                    ? 'bg-gray-800 text-white'
                                    : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                                }`}
                              >
                                <span className="mr-3 text-base">
                                  {iconMap[child.icon || ''] || '•'}
                                </span>
                                <span>{child.title}</span>
                              </Link>
                            ))}
                        </div>
                      )}
                    </div>
                  ))}
              </nav>
            </div>
          ))}
        </div>

        <div className="absolute bottom-0 left-0 right-0 p-4 bg-gray-800">
          <div className="text-xs text-gray-400 text-center">
            RBAC System v1.0
          </div>
        </div>
      </aside>
    </>
  );
};
