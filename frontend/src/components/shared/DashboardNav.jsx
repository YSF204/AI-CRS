import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Sun, Moon, Briefcase, FileText, User, Search,
  ChevronRight, ChevronLeft, LayoutDashboard, PlusSquare,
  Users, Settings, CheckCircle, LayoutTemplate, LogOut, Menu, X, Globe
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useTranslation } from '../../context/LanguageContext';
import logoExpanded from '../../assets/LOGO 1.svg';
import logoCollapsed from '../../assets/LOGO2.svg';
import './DashboardNav.css';

export default function DashboardNav({ role = 'employee' }) {
  const { theme, toggleTheme } = useTheme();
  const { user, logout } = useAuth();
  const { t, lang, toggleLanguage } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(() => {
    // On mobile, sidebar is closed by default
    if (typeof window !== 'undefined' && window.innerWidth < 768) {
      return false;
    }
    return localStorage.getItem('sidebarOpen') === 'true';
  });
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  const fullName = `${user?.firstName || ''} ${user?.lastName || ''}`.trim() || t('dashboard.myAccount');

  // Check if we're on mobile
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (mobile) {
        setIsMobileOpen(false);
      }
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    if (isOpen) {
      document.body.classList.add('sidebar-open');
      // Force CSS variable update for immediate effect
      document.documentElement.style.setProperty('--sidebar-width', '16rem');
    } else {
      document.body.classList.remove('sidebar-open');
      // Force CSS variable update for immediate effect
      document.documentElement.style.setProperty('--sidebar-width', 'calc(5rem + 10px)');
    }

    return () => {
      document.body.classList.remove('sidebar-open');
    };
  }, [isOpen]);

  useEffect(() => {
    if (isMobileOpen) {
      document.body.classList.add('mobile-sidebar-open');
    } else {
      document.body.classList.remove('mobile-sidebar-open');
    }

    return () => {
      document.body.classList.remove('mobile-sidebar-open');
    };
  }, [isMobileOpen]);

  const handleToggle = () => {
    const nextState = !isOpen;
    setIsOpen(nextState);
    localStorage.setItem('sidebarOpen', nextState.toString());
  };

  const handleMobileToggle = () => {
    setIsMobileOpen(!isMobileOpen);
  };

  // Close mobile sidebar when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (isMobile && isMobileOpen) {
        const sidebar = e.target.closest('.jd-sidebar');
        const menuBtn = e.target.closest('.mobile-menu-btn');
        if (!sidebar && !menuBtn) {
          setIsMobileOpen(false);
        }
      }
    };

    if (isMobile && isMobileOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isMobile, isMobileOpen]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const roleConfig = {
    employer: {
      baseLink: '/employer',
      items: [
        { label: t("dashboard.dashboard"), href: "/employer", icon: LayoutDashboard },
        { label: t("dashboard.postJob"), href: "/employer/post-job", icon: PlusSquare },
        { label: t("dashboard.manageJobs"), href: "/employer/jobs", icon: Briefcase },
        { label: t("dashboard.findTalent"), href: "/employer/search", icon: Users },
      ],
    },
    admin: {
      baseLink: '/admin',
      items: [
        { label: t("dashboard.dashboard"), href: "/admin", icon: LayoutDashboard },
        { label: t("dashboard.manageUsers"), href: "/admin/users", icon: Users },
      ],
    },
    employee: {
      baseLink: '/employee',
      items: [
        { label: t("dashboard.myCvs"), href: "/employee/cvs", icon: FileText },
        { label: t("dashboard.atsScore"), href: "/employee/ats-score", icon: CheckCircle },
        { label: t("dashboard.cvTemplates"), href: "/employee/cv-templates", icon: LayoutTemplate },
        { label: t("dashboard.findJobs"), href: "/employee/jobs", icon: Search },
        { label: t("dashboard.applications"), href: "/employee/applications", icon: Briefcase },
      ],
    },
  };

  const config = roleConfig[role] || roleConfig.employee;

  // Close mobile sidebar when clicking a link
  const handleMobileLinkClick = () => {
    if (isMobile) {
      setIsMobileOpen(false);
    }
  };

  return (
    <>
      {/* Mobile menu button */}
      <button
        className="mobile-menu-btn"
        onClick={handleMobileToggle}
        aria-label="Open menu"
        aria-expanded={isMobileOpen}
      >
        {isMobileOpen ? <X size={20} strokeWidth={3} /> : <Menu size={20} strokeWidth={3} />}
      </button>

      {/* Mobile Backdrop overlay (separate from sidebar to avoid transform inheritance issues) */}
      {isMobile && isMobileOpen && (
        <div 
          className="jd-sidebar-backdrop" 
          onClick={handleMobileToggle}
        />
      )}

      <aside className="jd-sidebar">
        <div className="jd-sidebar-header" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <Link to={config.baseLink} className="jd-sidebar-brand" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%' }}>
            {isOpen ? (
              <img src={logoExpanded} alt="Logo" style={{ height: '64px', width: 'auto' }} />
            ) : (
              <img src={logoCollapsed} alt="Logo" style={{ height: '64px', width: 'auto' }} />
            )}
          </Link>
        </div>
        <button
          className="jd-sidebar-toggle"
          onClick={handleToggle}
          aria-label="Toggle Sidebar"
          aria-expanded={isOpen}
          style={{ display: isMobile ? 'none' : 'flex' }}
        >
          {isOpen ? <ChevronLeft size={16} strokeWidth={3} /> : <ChevronRight size={16} strokeWidth={3} />}
        </button>

        <nav className="jd-sidebar-nav">
          {config.items.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname.startsWith(item.href) && (item.href !== '/employer' && item.href !== '/employee' && item.href !== '/admin' || location.pathname === item.href);
            return (
              <Link
                key={item.href}
                to={item.href}
                className="jd-sidebar-link"
                data-active={location.pathname === item.href || isActive}
                onClick={handleMobileLinkClick}
              >
                <div className="jd-sidebar-link-icon">
                  <Icon size={20} strokeWidth={2.5} />
                </div>
                <span className="jd-sidebar-link-text">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="jd-sidebar-footer">
          <Link
            to={role === 'employer' ? '/employer/profile' : role === 'admin' ? '/admin/profile' : '/employee/profile'}
            className="jd-sidebar-action"
            onClick={handleMobileLinkClick}
          >
            <div className="jd-sidebar-link-icon">
              <User size={20} strokeWidth={3} />
            </div>
            <span className="jd-sidebar-action-text truncate">{fullName}</span>
          </Link>

          <button onClick={toggleLanguage} className="jd-sidebar-action">
            <div className="jd-sidebar-link-icon">
              <Globe size={20} strokeWidth={2.5} />
            </div>
            <span className="jd-sidebar-action-text">{lang === 'en' ? 'العربية' : 'English'}</span>
          </button>

          <button onClick={toggleTheme} className="jd-sidebar-action">
            <div className="jd-sidebar-link-icon">
              {theme === 'light' ? <Moon size={20} strokeWidth={2.5} /> : <Sun size={20} strokeWidth={2.5} />}
            </div>
            <span className="jd-sidebar-action-text">{theme === 'light' ? t('dashboard.darkMode') : t('dashboard.lightMode')}</span>
          </button>

          <button onClick={handleLogout} className="jd-sidebar-action" style={{ color: 'var(--nm-error)' }}>
            <div className="jd-sidebar-link-icon">
              <LogOut size={20} strokeWidth={2.5} />
            </div>
            <span className="jd-sidebar-action-text">{t('dashboard.logout')}</span>
          </button>
        </div>
      </aside>
    </>
  );
}
