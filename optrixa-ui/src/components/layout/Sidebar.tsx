import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard, Package, Receipt,
  ShoppingCart, BarChart3, Settings, Zap, Tag
} from 'lucide-react';

const navItems = [
  { to: '/dashboard',  icon: LayoutDashboard, label: 'Dashboard'  },
  { to: '/inventory',  icon: Package,          label: 'Inventory'  },
  { to: '/expenses',   icon: Receipt,           label: 'Expenses'   },
  { to: '/sales',      icon: ShoppingCart,      label: 'Sales'      },
  { to: '/categories', icon: Tag,               label: 'Categories' },
  { to: '/reports',    icon: BarChart3,          label: 'Reports'    },
];

const Sidebar = () => {
  return (
    <aside className="w-64 bg-gray-900 text-white flex flex-col shrink-0">
      <div className="flex items-center gap-3 px-6 py-5 border-b border-gray-700">
        <div className="w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center">
          <Zap size={18} className="text-white" />
        </div>
        <span className="text-xl font-bold tracking-tight">Optrixa</span>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-indigo-600 text-white'
                  : 'text-gray-400 hover:bg-gray-800 hover:text-white'
              }`
            }
          >
            <Icon size={18} />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="px-3 py-4 border-t border-gray-700">
        <NavLink
          to="/settings"
          className={({ isActive }) =>
            `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
              isActive
                ? 'bg-indigo-600 text-white'
                : 'text-gray-400 hover:bg-gray-800 hover:text-white'
            }`
          }
        >
          <Settings size={18} />
          Settings
        </NavLink>
      </div>
    </aside>
  );
};

export default Sidebar;