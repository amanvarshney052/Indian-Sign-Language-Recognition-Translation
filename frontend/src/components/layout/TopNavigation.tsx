import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  Video,
  BookOpen,
  History,
  LayoutDashboard,
  Settings,
  Menu,
  X,
  User,
  Sparkles,
} from 'lucide-react';
import { ConnectionStatusBadge } from '../common/ConnectionStatusBadge';

interface TopNavigationProps {
  isOnline: boolean;
  isLoadingStatus: boolean;
  latencyMs: number | null;
  isMockMode: boolean;
  onToggleMockMode: () => void;
}

export const TopNavigation: React.FC<TopNavigationProps> = ({
  isOnline,
  isLoadingStatus,
  latencyMs,
  isMockMode,
  onToggleMockMode,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  const navLinks = [
    { to: '/', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/translate', label: 'Live Translate', icon: Video },
    { to: '/vocabulary', label: 'Vocabulary', icon: BookOpen },
    { to: '/history', label: 'Translation History', icon: History },
  ];

  return (
    <header className="sticky top-0 z-40 w-full bg-[#F7F8F4]/90 backdrop-blur-md border-b border-[#E8EEDF]/80 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
        {/* Left: Brand Logo & Title */}
        <NavLink to="/" className="flex items-center gap-3 group focus:outline-none shrink-0">
          <div className="w-11 h-11 rounded-2xl bg-[#D5E2C2] flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform duration-200">
            {/* Custom SVG logo: Two hands communicating / bridging */}
            <svg
              className="w-6 h-6 text-[#252720]"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              {/* Left hand stylized */}
              <path d="M7 11V7a2 2 0 0 1 4 0v4" />
              <path d="M11 9V5a2 2 0 0 1 4 0v6" />
              {/* Palm arc */}
              <path d="M5 13a4 4 0 0 0 8 0V9" />
              {/* Communication bridge waves */}
              <path d="M17 7c1.5 1.5 1.5 4 0 5.5" />
              <path d="M19.5 4.5c3 3 3 8 0 11" />
            </svg>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-xl tracking-tight text-[#252720]">
                ISL Bridge
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#D5E2C2] text-[#252720] uppercase tracking-wider">
                v1.0
              </span>
            </div>
            <p className="text-[11px] text-[#747873] hidden sm:block font-medium">
              Indian Sign Language AI
            </p>
          </div>
        </NavLink>

        {/* Center: Main Pill Navigation (Desktop) */}
        <nav className="hidden md:flex items-center gap-1.5 bg-[#FFFFFF] p-1.5 rounded-full shadow-soft border border-[#F0F2F3]">
          {navLinks.map((link) => {
            const Icon = link.icon;
            return (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) =>
                  `flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition-all duration-200 ${
                    isActive
                      ? 'bg-[#252720] text-white shadow-sm'
                      : 'text-[#747873] hover:text-[#252720] hover:bg-[#F0F2F3]/60'
                  }`
                }
              >
                <Icon className="w-4 h-4" />
                <span>{link.label}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* Right: Status badge, Settings, User avatar */}
        <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
          <ConnectionStatusBadge
            isOnline={isOnline}
            isLoading={isLoadingStatus}
            latencyMs={latencyMs}
            isMockMode={isMockMode}
            onClick={() => navigate('/settings')}
          />

          {/* Quick Mock Mode Toggle */}
          <button
            onClick={onToggleMockMode}
            title={isMockMode ? "Switch to Live Inference" : "Switch to Demo Mode"}
            aria-label="Toggle Demo Mode"
            className={`hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition ${
              isMockMode
                ? 'bg-[#FFE17A] text-[#78350F]'
                : 'bg-[#F0F2F3] text-[#747873] hover:text-[#252720]'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{isMockMode ? 'Demo Active' : 'Demo Mode'}</span>
          </button>

          {/* Settings button */}
          <NavLink
            to="/settings"
            title="System Settings"
            className={({ isActive }) =>
              `w-10 h-10 rounded-full flex items-center justify-center transition border ${
                isActive
                  ? 'bg-[#252720] text-white border-[#252720]'
                  : 'bg-white text-[#747873] border-[#F0F2F3] hover:text-[#252720] hover:bg-[#F0F2F3]'
              }`
            }
          >
            <Settings className="w-4 h-4" />
          </NavLink>

          {/* User Profile Avatar Pill */}
          <div className="w-10 h-10 rounded-full bg-[#B7C8FF] text-[#1E3A8A] flex items-center justify-center font-bold text-xs shadow-soft select-none cursor-pointer hover:ring-2 hover:ring-[#B7C8FF]/50 transition">
            <User className="w-4 h-4 text-[#1E3A8A]" />
          </div>

          {/* Mobile hamburger toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden w-10 h-10 rounded-full bg-white border border-[#F0F2F3] flex items-center justify-center text-[#252720]"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-[#F0F2F3] bg-white px-4 pt-3 pb-6 shadow-float animate-fadeIn">
          <nav className="flex flex-col gap-2">
            {navLinks.map((link) => {
              const Icon = link.icon;
              return (
                <NavLink
                  key={link.to}
                  to={link.to}
                  onClick={() => setMobileMenuOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-semibold transition ${
                      isActive
                        ? 'bg-[#252720] text-white'
                        : 'text-[#747873] hover:bg-[#F0F2F3] hover:text-[#252720]'
                    }`
                  }
                >
                  <Icon className="w-5 h-5" />
                  <span>{link.label}</span>
                </NavLink>
              );
            })}
            <div className="pt-2 mt-2 border-t border-[#F0F2F3] flex items-center justify-between">
              <button
                onClick={() => {
                  onToggleMockMode();
                  setMobileMenuOpen(false);
                }}
                className="flex items-center gap-2 text-xs font-semibold text-[#747873] py-2"
              >
                <Sparkles className="w-4 h-4 text-[#A4BF80]" />
                <span>Toggle Demo Mode ({isMockMode ? 'Active' : 'Off'})</span>
              </button>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
};

