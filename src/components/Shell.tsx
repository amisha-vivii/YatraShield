import { ShieldCheckIcon, MenuIcon, XIcon } from 'lucide-react';
import React, { useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useData } from '../contexts/DataContext';

const NAV = [
{ to: '/risk-check', label: 'Risk Check' },
{ to: '/risk-map', label: 'Risk Map' },
{ to: '/services', label: 'Services' },
{ to: '/report', label: 'Reports' },
];

const PAGE_BACKGROUNDS: Record<string, string> = {
  '/risk-check': '/im6.jpg',
  '/risk-map': '/im5.jpg',
  '/services': '/im4.jpg',
  '/report': '/Sunrise%20Over%20Varanasi%20Ghats.jpg',
  '/about': '/India.jpg',
};


export function Shell({ children }: {children: React.ReactNode;}) {
  const { status } = useData();
  const { account, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();

  const statusLabel =
  status === 'checking' ? 'Checking API' : status === 'connected' ? 'Operational' : 'Demo Mode';
  const statusColor =
  status === 'checking' ? 'bg-charcoal-400' : status === 'connected' ? 'bg-good' : 'bg-warn';

  const backgroundImage = PAGE_BACKGROUNDS[pathname.startsWith('/services/') ? '/services' : pathname];
  const navigation = account?.role === 'admin' ? [...NAV, { to: '/admin', label: 'Admin' }] : NAV;

  return (
    <div className="relative min-h-screen w-full bg-canvas flex flex-col">
      {backgroundImage &&
      <div
        className="page-background"
        style={{ backgroundImage: `url(${backgroundImage})` }}
        aria-hidden />}
      <header className="sticky top-0 z-[900] bg-white border-b border-line">
        <div className="mx-auto max-w-[1240px] px-5 h-14 flex items-center gap-6">
          <Link to="/" className="flex items-center gap-2 shrink-0" aria-label="YatraShield home">
            <ShieldCheckIcon className="w-5 h-5 text-navy-500" strokeWidth={2} />
            <span className="font-semibold text-navy tracking-tight">YatraShield</span>
          </Link>

          <nav className="hidden lg:flex items-center gap-1 flex-1" aria-label="Main">
            {navigation.map((item) =>
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
              `px-3 py-1.5 text-[13px] font-medium rounded-sm whitespace-nowrap transition-colors duration-150 ${
              isActive ?
              'text-navy bg-navy-100' :
              'text-charcoal-600 hover:text-navy hover:bg-canvas'}`

              }>
              
                {item.label}
              </NavLink>
            )}
          </nav>

          <div className="ml-auto flex items-center gap-3">
            {account ? <><Link to="/dashboard" className="hidden sm:inline text-[11px] font-semibold text-navy-500">{account.fullName}</Link><button type="button" onClick={logout} className="hidden sm:inline text-[11px] font-semibold text-charcoal-600">LOG OUT</button></> : <><Link to="/login" className="text-[11px] font-semibold text-navy-500">LOGIN</Link><Link to="/register" className="hidden sm:inline bg-navy text-white px-3 py-2 rounded-sm text-[11px] font-semibold">GET STARTED</Link></>}
            <div className="hidden sm:flex items-center gap-2 border border-line rounded-sm px-2.5 py-1">
              <span className="text-[11px] text-charcoal-400 font-medium">System Status</span>
              <span className={`w-1.5 h-1.5 rounded-full ${statusColor}`} aria-hidden />
              <span className="text-[11px] font-semibold text-charcoal">{statusLabel}</span>
            </div>
            <button
              type="button"
              className="lg:hidden p-1.5 text-charcoal-600"
              onClick={() => setOpen((v) => !v)}
              aria-label={open ? 'Close menu' : 'Open menu'}
              aria-expanded={open}>
              
              {open ? <XIcon className="w-5 h-5" /> : <MenuIcon className="w-5 h-5" />}
            </button>
          </div>
        </div>
        {open &&
        <nav className="lg:hidden border-t border-line bg-white px-5 py-2" aria-label="Mobile">
            {navigation.map((item) =>
          <Link
            key={item.to}
            to={item.to}
            onClick={() => setOpen(false)}
            className={`block px-2 py-2.5 text-sm font-medium border-b border-line last:border-0 ${
            pathname === item.to ? 'text-navy' : 'text-charcoal-600'}`
            }>
            
                {item.label}
              </Link>
          )}
          </nav>
        }
      </header>

      <footer className="relative z-10 border-t border-line bg-white">
        <div className="mx-auto max-w-[1240px] px-5 py-5 flex flex-wrap items-center justify-between gap-3 text-[11px] text-charcoal-400">
          <Link to="/about" className="font-semibold text-navy-500 hover:text-navy">ABOUT YATRASHIELD</Link>
        </div>
      </footer>

      <main className="relative z-10 flex-1 w-full">{children}</main>
    </div>);

}