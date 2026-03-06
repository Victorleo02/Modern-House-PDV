
import React from 'react';
import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  PlusSquare, 
  BarChart3, 
  Settings,
  Menu as MenuIcon,
  X,
  LogOut,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { UserRole } from '../types';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(window.innerWidth > 1024);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  
  const user = JSON.parse(localStorage.getItem('mh_logged_user') || 'null');

  React.useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  const menuItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard, role: UserRole.ADMIN },
    { name: 'PDV (Vendas)', path: '/pdv', icon: ShoppingCart, role: UserRole.VENDEDOR },
    { name: 'Estoque', path: '/estoque', icon: Package, role: UserRole.VENDEDOR },
    { name: 'Entrada de Nota', path: '/entrada', icon: PlusSquare, role: UserRole.VENDEDOR },
    { name: 'Relatórios', path: '/relatorios', icon: BarChart3, role: UserRole.ADMIN },
    { name: 'Configurações', path: '/config', icon: Settings, role: UserRole.ADMIN },
  ];

  const handleLogout = () => {
    localStorage.removeItem('mh_logged_user');
    navigate('/login');
  };

  if (!user || location.pathname === '/login') return <>{children}</>;

  const filteredMenu = menuItems.filter(item => 
    user.role === UserRole.ADMIN || item.role === UserRole.VENDEDOR
  );

  return (
    <div className="min-h-screen flex bg-gray-50">
      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/60 z-50 lg:hidden backdrop-blur-sm no-print"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed lg:relative inset-y-0 left-0 z-50 no-print
        bg-slate-900 text-white transition-all duration-300 ease-in-out
        ${isSidebarOpen ? 'w-64' : 'w-20'} 
        ${isMobileMenuOpen ? 'translate-x-0 w-72' : '-translate-x-full lg:translate-x-0'}
        flex flex-col shadow-2xl lg:shadow-none
      `}>
        <div className="p-4 flex items-center justify-between border-b border-slate-800 h-16">
          <div className={`flex items-center gap-3 overflow-hidden ${(!isSidebarOpen && !isMobileMenuOpen) && 'lg:hidden'}`}>
            <div className="bg-blue-600 p-2 rounded-lg shrink-0">
              <LayoutDashboard size={20} />
            </div>
            <span className="font-bold text-lg whitespace-nowrap">Modern House</span>
          </div>
          <button 
            onClick={() => isMobileMenuOpen ? setIsMobileMenuOpen(false) : setIsSidebarOpen(!isSidebarOpen)} 
            className="p-2 hover:bg-slate-800 rounded-lg lg:flex hidden"
          >
            {isSidebarOpen ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
          </button>
        </div>
        
        <nav className="mt-6 px-3 space-y-1 flex-1 overflow-y-auto">
          {filteredMenu.map((item) => (
            <Link 
              key={item.path} 
              to={item.path}
              className={`flex items-center gap-4 p-3 rounded-xl transition-all ${
                location.pathname === item.path 
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20' 
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <item.icon size={22} className="shrink-0" />
              {(isSidebarOpen || isMobileMenuOpen) && <span className="font-medium whitespace-nowrap">{item.name}</span>}
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-800 bg-slate-900/50">
          <button 
            onClick={handleLogout}
            className="flex items-center gap-4 text-red-400 hover:text-red-300 p-3 w-full rounded-xl hover:bg-red-400/10 transition-colors"
          >
            <LogOut size={22} className="shrink-0" />
            {(isSidebarOpen || isMobileMenuOpen) && <span className="font-bold">Sair do Sistema</span>}
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header */}
        <header className="bg-white border-b border-slate-200 h-16 flex justify-between items-center px-4 md:px-8 sticky top-0 z-40 no-print">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsMobileMenuOpen(true)} 
              className="lg:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-lg"
            >
              <MenuIcon size={24} />
            </button>
            <h1 className="text-lg md:text-xl font-bold text-slate-800 truncate">
              {menuItems.find(i => i.path === location.pathname)?.name || 'Modern House'}
            </h1>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-bold text-slate-800 leading-none">{user.name}</p>
              <p className="text-[10px] text-slate-400 uppercase tracking-widest mt-1 font-bold">{user.role}</p>
            </div>
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-700 rounded-full flex items-center justify-center text-white font-bold shadow-md">
              {user.name.charAt(0)}
            </div>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 overflow-auto p-4 md:p-8">
          <div className="max-w-[1600px] mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};
