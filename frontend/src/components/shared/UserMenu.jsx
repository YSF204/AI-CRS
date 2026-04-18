import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, LogOut, ChevronDown } from 'lucide-react';
import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/react';
import { useAuth } from '../../context/AuthContext';

/**
 * UserMenu — User dropdown with Paper design system.
 * Matches new navbar visual language with semantic tokens.
 *
 * @param {string} profileHref - Link to user profile page
 */
export default function UserMenu({ profileHref = '/employee/profile' }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const fullName = `${user?.firstName || ''} ${user?.lastName || ''}`.trim();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <Menu as="div" className="relative">
      {({ open }) => (
        <>
          <MenuButton
            className="nav-user-button focus-ring"
            aria-label="User menu"
          >
            <span className="max-w-[180px] truncate">
              {fullName || 'My Account'}
            </span>
            <ChevronDown
              size={16}
              style={{
                transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
                transition: 'transform 0.2s ease',
              }}
            />
          </MenuButton>

          <MenuItems
            anchor="bottom end"
            transition
            className="user-menu-dropdown z-[200] mt-2 min-w-[280px] border border-[var(--border-strong)] shadow-[var(--shadow-md)] bg-[var(--card-bg)] rounded-xl overflow-hidden p-0 focus:outline-none origin-top-right transition duration-200 ease-out data-[closed]:opacity-0 data-[closed]:scale-95 data-[closed]:-translate-y-1"
          >
            <div
              className="px-4 py-4 border-b border-[var(--border-strong)]"
              style={{ background: 'var(--surface-3)' }}
            >
              <p className="font-['Montserrat'] font-bold text-sm m-0" style={{ color: 'var(--text-primary)' }}>
                {fullName || 'My Account'}
              </p>
              <p className="font-mono text-xs mt-1 break-all m-0" style={{ color: 'var(--text-secondary)' }}>
                {user?.email || ''}
              </p>
            </div>

            <div className="p-2">
              <MenuItem>
                <Link
                  to={profileHref}
                  className="flex items-center gap-3 px-4 py-3 rounded-md font-['Montserrat'] font-medium text-sm transition-colors duration-200 hover:bg-[var(--surface-4)] focus-ring"
                  style={{ color: 'var(--text-primary)' }}
                >
                  <User size={16} />
                  My Profile
                </Link>
              </MenuItem>

              <MenuItem>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-md font-['Montserrat'] font-medium text-sm transition-colors duration-200 hover:bg-[var(--color-danger-light)] focus-ring"
                  style={{ color: 'var(--color-danger)' }}
                >
                  <LogOut size={16} />
                  Log Out
                </button>
              </MenuItem>
            </div>
          </MenuItems>
        </>
      )}
    </Menu>
  );
}
