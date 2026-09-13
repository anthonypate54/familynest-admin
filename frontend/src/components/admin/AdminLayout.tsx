import React, { useState, useEffect } from 'react';
import { Outlet, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { 
  Heart, 
  LayoutDashboard, 
  Users, 
  Settings, 
  Bell, 
  Megaphone,
  LogOut,
  Menu,
  X
} from 'lucide-react';

// Below this width, use the hamburger + dropdown instead of the
// horizontal tab bar (which doesn't fit 5 items at phone widths).
const MOBILE_BREAKPOINT_PX = 768;

const AdminLayout: React.FC = () => {
  const { admin, logout } = useAuth();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Decide mobile-vs-desktop nav in JS (window.innerWidth) instead of via
  // CSS media-query classes (Tailwind's "hidden"/"md:block"/"md:hidden").
  // In the production build, CSS is extracted into its own file and
  // loaded via a separate <link>, which can finish loading AFTER React
  // has already mounted the nav into the DOM - so for a brief moment
  // (sometimes not so brief on a slow connection) the "hidden" rule isn't
  // registered yet and the full desktop tab bar flashes visible on a
  // phone before the CSS applies and corrects it. Computing this from
  // window.innerWidth directly, synchronously on first render, has no
  // dependency on the CSS file at all, so there's nothing to race.
  const [isDesktopNav, setIsDesktopNav] = useState(
    () => window.innerWidth >= MOBILE_BREAKPOINT_PX
  );

  useEffect(() => {
    const handleResize = () => setIsDesktopNav(window.innerWidth >= MOBILE_BREAKPOINT_PX);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Close the mobile dropdown whenever a nav link is actually followed,
  // so it doesn't stay open over the next page.
  const handleNavClick = () => setMobileMenuOpen(false);

  const navigation = [
    { name: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'Users', href: '/admin/users', icon: Users },
    { name: 'Marketing', href: '/admin/marketing', icon: Megaphone },
    { name: 'Settings', href: '/admin/settings', icon: Settings },
    { name: 'Notifications', href: '/admin/notifications', icon: Bell },
  ];

  return (
    // overflowX: hidden here is a safety net so that ANY child that's too
    // wide for the viewport (like the nav bar below) is clipped at the page
    // level instead of forcing the whole document - and everything
    // positioned relative to it - wider than the screen. That's what was
    // causing "the UI pushes to the right" on real phones: with nothing
    // clipping it, a too-wide child expands the mobile layout viewport
    // itself, not just the one element. The nav bar opts back into
    // scrolling horizontally on its own further down, so nothing is lost.
    <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb', overflowX: 'hidden' }}>
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
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '8px'
          }}>
            {/* Left: App Title */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <Heart style={{ width: '28px', height: '28px', color: 'white', flexShrink: 0 }} />
              <h1 style={{ 
                fontSize: '20px', 
                fontWeight: 'bold', 
                margin: 0,
                color: 'white'
              }}>
                FamilyNest Admin
              </h1>
            </div>

            {/* Right: Hamburger (mobile only) + User Info */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
              {!isDesktopNav && (
                <button
                  onClick={() => setMobileMenuOpen((open) => !open)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '36px',
                    height: '36px',
                    backgroundColor: '#15803d',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    flexShrink: 0
                  }}
                  aria-label="Toggle navigation menu"
                >
                  {mobileMenuOpen ? <X style={{ width: '20px', height: '20px' }} /> : <Menu style={{ width: '20px', height: '20px' }} />}
                </button>
              )}
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

        {/* Menu Bar - Horizontal Navigation (desktop/tablet only) */}
        {isDesktopNav && (
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
        )}

        {/* Menu Bar - Dropdown Navigation (mobile only) */}
        {!isDesktopNav && mobileMenuOpen && (
          <nav style={{
            backgroundColor: '#15803d',
            borderTop: '1px solid #16a34a'
          }}>
            {navigation.map((item) => {
              const isActive = location.pathname === item.href;
              const IconComponent = item.icon;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={handleNavClick}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '14px 24px',
                    fontSize: '15px',
                    fontWeight: '500',
                    textDecoration: 'none',
                    color: isActive ? 'white' : '#bbf7d0',
                    backgroundColor: isActive ? '#166534' : 'transparent',
                    borderBottom: '1px solid #16a34a'
                  }}
                >
                  <IconComponent style={{ width: '18px', height: '18px' }} />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>
        )}
      </header>

      {/* Main Content */}
      <main style={{ flex: 1 }}>
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;