import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, LogOut, ChevronDown } from 'lucide-react';
import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/react';
import { useAuth } from '../../context/AuthContext';

/**
 * UserMenu — avatar/burger button that opens a dropdown with
 * profile info, a link to /employee/profile, and logout.
 * Fully self-contained: reads auth itself, no props needed.
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
            className="inline-flex items-center gap-2 px-4 py-2.5 border-[3px] border-black shadow-[4px_4px_0_black] bg-(--yellow) font-['Space_Grotesk'] font-bold text-sm uppercase tracking-[0.05em]"
          >
            <span className="max-w-[180px] truncate text-black">
              {fullName || 'My Account'}
            </span>
            <ChevronDown
              size={16}
              color="#0a0a0a"
              style={{
                transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
                transition: 'transform 0.2s ease',
              }}
            />
          </MenuButton>

          <MenuItems
            anchor="bottom end"
            transition
            className="z-[200] mt-2 min-w-[280px] border-[3px] border-black shadow-[6px_6px_0_black] bg-(--card-bg) p-0 focus:outline-none origin-top-right transition duration-200 ease-out data-[closed]:opacity-0 data-[closed]:scale-95 data-[closed]:-translate-y-1"
          >
            <div className="px-4 py-4 border-b-2 border-black bg-(--yellow)">
              <p className="font-['Space_Grotesk'] font-extrabold text-sm uppercase tracking-[0.04em] text-black m-0">
                {fullName || 'My Account'}
              </p>
              <p className="font-mono text-xs text-black/70 mt-1 break-all m-0">
                {user?.email || ''}
              </p>
            </div>

            <div className="p-2">
              <MenuItem>
                <Link
                  to={profileHref}
                  className="flex items-center gap-3 px-4 py-3 rounded-md font-['Space_Grotesk'] font-bold text-sm uppercase tracking-[0.06em] text-(--fg) data-[focus]:bg-(--bg)"
                >
                  <User size={16} />
                  My Profile
                </Link>
              </MenuItem>

              <MenuItem>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-md font-['Space_Grotesk'] font-bold text-sm uppercase tracking-[0.06em] text-(--coral) data-[focus]:bg-(--bg)"
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
