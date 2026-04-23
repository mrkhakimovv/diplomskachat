import { Link, useLocation } from 'react-router-dom';
import { FileUp, Database } from 'lucide-react';
import { cn } from '../lib/utils';

export function Sidebar() {
  const location = useLocation();

  const links = [
    { to: '/', label: 'Yangi yuklash', icon: FileUp },
    { to: '/baza', label: 'Diplomlar bazasi', icon: Database },
  ];

  return (
    <aside className="w-64 bg-slate-900 flex flex-col shrink-0 hidden md:flex">
      <div className="p-6 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-500 rounded flex items-center justify-center">
            <span className="text-white font-bold">D</span>
          </div>
          <span className="text-slate-100 font-semibold tracking-tight">DIPLOM.UZ</span>
        </div>
      </div>
      <nav className="flex-1 p-4 space-y-2">
        {links.map((link) => {
          const Icon = link.icon;
          const isActive = location.pathname === link.to;
          return (
            <Link
              key={link.to}
              to={link.to}
              className={cn(
                'w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors',
                isActive
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white transition-all'
              )}
            >
              <Icon className="w-5 h-5" />
              <span>{link.label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
