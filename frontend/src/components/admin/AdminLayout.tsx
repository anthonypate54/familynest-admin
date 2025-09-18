import React from 'react';
import { Outlet, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { 
  Heart, 
  LayoutDashboard, 
  Users, 
  Settings, 
  Bell, 
  LogOut
} from 'lucide-react';

const AdminLayout: React.FC = () => {
  const { admin, logout } = useAuth();
  const location = useLocation();

  const navigation = [
    { name: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'Users', href: '/admin/users', icon: Users },
    { name: 'Settings', href: '/admin/settings', icon: Settings },
    { name: 'Notifications', href: '/admin/notifications', icon: Bell },
  ];

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb' }}>
      {/* Green AppBar */}
      <header style={{ 
        backgroundColor: '#16a34a', 
        color: 'white', 
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
      }}>
        {/* Top Section - Title and User */}
        <div style={{ padding: '16px 24px' }}>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between' 
          }}>
            {/* Left: App Title */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <Heart style={{ width: '28px', height: '28px', color: 'white' }} />
              <h1 style={{ 
                fontSize: '20px', 
                fontWeight: 'bold', 
                margin: 0,
                color: 'white'
              }}>
                FamilyNest Admin
              </h1>
            </div>

            {/* Right: User Info */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '14px', fontWeight: '500' }}>{admin?.email}</div>
                <div style={{ fontSize: '12px', color: '#bbf7d0' }}>{admin?.role}</div>
              </div>
              
              <div style={{
                width: '40px',
                height: '40px',
                backgroundColor: '#15803d',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <span style={{ color: 'white', fontWeight: 'bold' }}>
                  {admin?.email?.charAt(0).toUpperCase()}
                </span>
              </div>

              <button
                onClick={logout}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '8px 12px',
                  backgroundColor: '#15803d',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '14px'
                }}
                onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#166534'}
                onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#15803d'}
              >
                <LogOut style={{ width: '16px', height: '16px' }} />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        </div>

        {/* Menu Bar - Horizontal Navigation */}
        <nav style={{ 
          backgroundColor: '#15803d', 
          borderTop: '1px solid #16a34a' 
        }}>
          <div style={{ padding: '0 24px' }}>
            <div style={{ display: 'flex' }}>
              {navigation.map((item) => {
                const isActive = location.pathname === item.href;
                const IconComponent = item.icon;
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '12px 24px',
                      fontSize: '14px',
                      fontWeight: '500',
                      textDecoration: 'none',
                      color: isActive ? 'white' : '#bbf7d0',
                      backgroundColor: isActive ? '#166534' : 'transparent',
                      borderBottom: isActive ? '2px solid white' : '2px solid transparent',
                      transition: 'all 0.2s'
                    }}
                    onMouseOver={(e) => {
                      if (!isActive) {
                        e.currentTarget.style.color = 'white';
                        e.currentTarget.style.backgroundColor = '#16a34a';
                      }
                    }}
                    onMouseOut={(e) => {
                      if (!isActive) {
                        e.currentTarget.style.color = '#bbf7d0';
                        e.currentTarget.style.backgroundColor = 'transparent';
                      }
                    }}
                  >
                    <IconComponent style={{ width: '16px', height: '16px' }} />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        </nav>
      </header>

      {/* Main Content */}
      <main style={{ flex: 1 }}>
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;