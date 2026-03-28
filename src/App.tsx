import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  Package, 
  Wallet, 
  ShoppingCart, 
  Ticket, 
  Settings, 
  LogOut, 
  Menu, 
  X, 
  Plus, 
  Search, 
  Filter, 
  CheckCircle, 
  XCircle, 
  Clock,
  Bell,
  User,
  ChevronRight,
  Star,
  MessageSquare,
  Truck,
  Image as ImageIcon,
  Upload,
  CreditCard
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

// Utility for tailwind classes
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// --- Types ---
interface User {
  id: number;
  name: string;
  email: string;
  role: 'admin' | 'seller';
  wallet_balance: number;
  store_name?: string;
}

interface Product {
  id: number;
  title: string;
  short_description: string;
  long_description: string;
  price: number;
  stock: number;
  image: string;
  category_id: number;
  category_name?: string;
}

interface Category {
  id: number;
  name: string;
}

interface Deposit {
  id: number;
  user_id: number;
  user_name?: string;
  amount: number;
  payment_method: string;
  screenshot: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
}

interface Order {
  id: number;
  user_id: number;
  user_name?: string;
  product_id: number;
  product_title?: string;
  quantity: number;
  total_price: number;
  shipping_label: string;
  delivery_partner: string;
  status: 'pending' | 'shipped' | 'delivered';
  created_at: string;
}

interface Ticket {
  id: number;
  user_id: number;
  user_name?: string;
  category: string;
  message: string;
  status: 'open' | 'replied' | 'closed';
  reply?: string;
  created_at: string;
}

// --- Components ---

const Button = ({ className, variant = 'primary', ...props }: any) => {
  const variants: any = {
    primary: 'bg-orange-600 text-white hover:bg-orange-700',
    secondary: 'bg-gray-100 text-gray-900 hover:bg-gray-200',
    outline: 'border border-gray-300 text-gray-700 hover:bg-gray-50',
    danger: 'bg-red-600 text-white hover:bg-red-700',
    success: 'bg-green-600 text-white hover:bg-green-700',
  };
  return (
    <button 
      className={cn('px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50', variants[variant], className)} 
      {...props} 
    />
  );
};

const Input = ({ className, ...props }: any) => (
  <input 
    className={cn('w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all', className)} 
    {...props} 
  />
);

const Card = ({ children, className }: any) => (
  <div className={cn('bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden', className)}>
    {children}
  </div>
);

const Badge = ({ children, variant = 'info' }: any) => {
  const variants: any = {
    info: 'bg-blue-50 text-blue-700 border-blue-100',
    success: 'bg-green-50 text-green-700 border-green-100',
    warning: 'bg-yellow-50 text-yellow-700 border-yellow-100',
    danger: 'bg-red-50 text-red-700 border-red-100',
  };
  return (
    <span className={cn('px-2 py-0.5 rounded-full text-xs font-semibold border', variants[variant])}>
      {children}
    </span>
  );
};

// --- Main App ---

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [view, setView] = useState('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState<any[]>([]);

  useEffect(() => {
    if (token) {
      fetchProfile();
    } else {
      setLoading(false);
    }
  }, [token]);

  const fetchProfile = async () => {
    try {
      const res = await fetch('/api/user/profile', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setUser(data);
      } else {
        logout();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    setView('login');
  };

  if (loading) return <div className="flex items-center justify-center h-screen">Loading...</div>;

  if (!user) {
    return <AuthPage setToken={(t: string) => { localStorage.setItem('token', t); setToken(t); }} />;
  }

  return (
    <div className="flex h-screen bg-gray-50 font-sans text-gray-900">
      {/* Sidebar */}
      <aside className={cn(
        "bg-white border-r border-gray-200 transition-all duration-300 flex flex-col",
        isSidebarOpen ? "w-64" : "w-20"
      )}>
        <div className="p-6 flex items-center gap-3">
          <div className="w-10 h-10 bg-orange-600 rounded-lg flex items-center justify-center text-white font-bold text-xl">
            D
          </div>
          {isSidebarOpen && <span className="font-bold text-xl tracking-tight">DropShip</span>}
        </div>

        <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
          <NavItem icon={<LayoutDashboard size={20} />} label="Dashboard" active={view === 'dashboard'} onClick={() => setView('dashboard')} collapsed={!isSidebarOpen} />
          {user.role === 'seller' && (
            <>
              <NavItem icon={<Package size={20} />} label="Products" active={view === 'products'} onClick={() => setView('products')} collapsed={!isSidebarOpen} />
              <NavItem icon={<ShoppingCart size={20} />} label="My Orders" active={view === 'orders'} onClick={() => setView('orders')} collapsed={!isSidebarOpen} />
              <NavItem icon={<Wallet size={20} />} label="Wallet & Deposits" active={view === 'wallet'} onClick={() => setView('wallet')} collapsed={!isSidebarOpen} />
            </>
          )}
          {user.role === 'admin' && (
            <>
              <NavItem icon={<Package size={20} />} label="Manage Products" active={view === 'admin-products'} onClick={() => setView('admin-products')} collapsed={!isSidebarOpen} />
              <NavItem icon={<ShoppingCart size={20} />} label="Manage Orders" active={view === 'admin-orders'} onClick={() => setView('admin-orders')} collapsed={!isSidebarOpen} />
              <NavItem icon={<Wallet size={20} />} label="Manage Deposits" active={view === 'admin-deposits'} onClick={() => setView('admin-deposits')} collapsed={!isSidebarOpen} />
              <NavItem icon={<User size={20} />} label="Manage Sellers" active={view === 'admin-sellers'} onClick={() => setView('admin-sellers')} collapsed={!isSidebarOpen} />
            </>
          )}
          <NavItem icon={<Ticket size={20} />} label="Support Tickets" active={view === 'tickets'} onClick={() => setView('tickets')} collapsed={!isSidebarOpen} />
          <NavItem icon={<Settings size={20} />} label="Settings" active={view === 'settings'} onClick={() => setView('settings')} collapsed={!isSidebarOpen} />
        </nav>

        <div className="p-4 border-t border-gray-200">
          <button 
            onClick={logout}
            className="flex items-center gap-3 w-full px-4 py-3 text-gray-600 hover:bg-red-50 hover:text-red-600 rounded-lg transition-colors"
          >
            <LogOut size={20} />
            {isSidebarOpen && <span className="font-medium">Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white border-bottom border-gray-200 h-16 flex items-center justify-between px-8 shrink-0">
          <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 hover:bg-gray-100 rounded-lg">
            <Menu size={20} />
          </button>

          <div className="flex items-center gap-6">
            <div className="relative">
              <button className="p-2 hover:bg-gray-100 rounded-lg relative">
                <Bell size={20} />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
              </button>
            </div>
            <div className="flex items-center gap-3 pl-6 border-l border-gray-200">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-bold">{user.name}</p>
                <p className="text-xs text-gray-500 capitalize">{user.role}</p>
              </div>
              <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center text-gray-600 font-bold uppercase">
                {user.name[0]}
              </div>
            </div>
          </div>
        </header>

        {/* View Content */}
        <div className="flex-1 overflow-y-auto p-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={view}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {view === 'dashboard' && <Dashboard user={user} token={token} setView={setView} />}
              {view === 'products' && <Products token={token} />}
              {view === 'orders' && <Orders token={token} />}
              {view === 'wallet' && <WalletView user={user} token={token} fetchProfile={fetchProfile} />}
              {view === 'tickets' && <Tickets token={token} user={user} />}
              {view === 'admin-products' && <AdminProducts token={token} />}
              {view === 'admin-orders' && <AdminOrders token={token} />}
              {view === 'admin-deposits' && <AdminDeposits token={token} />}
              {view === 'settings' && <SettingsView user={user} />}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}

function NavItem({ icon, label, active, onClick, collapsed }: any) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex items-center gap-3 w-full px-4 py-3 rounded-lg transition-all group",
        active 
          ? "bg-orange-50 text-orange-600" 
          : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
      )}
    >
      <span className={cn(active ? "text-orange-600" : "text-gray-400 group-hover:text-gray-600")}>
        {icon}
      </span>
      {!collapsed && <span className="font-medium">{label}</span>}
    </button>
  );
}

// --- Page Components ---

function AuthPage({ setToken }: any) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [storeName, setStoreName] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setError('');
    const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';
    const body = isLogin ? { email, password } : { name, email, password, store_name: storeName };

    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      const data = await res.json();
      if (res.ok) {
        if (isLogin) {
          setToken(data.token);
        } else {
          setIsLogin(true);
          alert('Registration successful! Please login.');
        }
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError('Something went wrong');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
      <Card className="w-full max-w-md p-8">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-orange-600 rounded-2xl flex items-center justify-center text-white font-bold text-3xl mx-auto mb-4 shadow-lg shadow-orange-200">
            D
          </div>
          <h1 className="text-2xl font-bold text-gray-900">{isLogin ? 'Welcome Back' : 'Create Seller Account'}</h1>
          <p className="text-gray-500 mt-2">{isLogin ? 'Enter your credentials to access your dashboard' : 'Join our platform and start dropshipping today'}</p>
        </div>

        {error && <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm mb-6 border border-red-100">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                <Input value={name} onChange={(e: any) => setName(e.target.value)} placeholder="John Doe" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Store Name</label>
                <Input value={storeName} onChange={(e: any) => setStoreName(e.target.value)} placeholder="My Awesome Store" required />
              </div>
            </>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
            <Input type="email" value={email} onChange={(e: any) => setEmail(e.target.value)} placeholder="name@example.com" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <Input type="password" value={password} onChange={(e: any) => setPassword(e.target.value)} placeholder="••••••••" required />
          </div>
          <Button type="submit" className="w-full py-3 mt-2">{isLogin ? 'Sign In' : 'Create Account'}</Button>
        </form>

        <div className="mt-8 text-center">
          <button 
            onClick={() => setIsLogin(!isLogin)}
            className="text-sm text-orange-600 font-medium hover:underline"
          >
            {isLogin ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
          </button>
        </div>
      </Card>
    </div>
  );
}

function Dashboard({ user, token, setView }: any) {
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    const endpoint = user.role === 'admin' ? '/api/admin/stats' : '/api/seller/orders';
    const res = await fetch(endpoint, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const data = await res.json();
    if (user.role === 'admin') {
      setStats(data);
    } else {
      // Simple seller stats from orders
      setStats({
        totalOrders: data.length,
        pendingOrders: data.filter((o: any) => o.status === 'pending').length,
        walletBalance: user.wallet_balance
      });
    }
  };

  if (!stats) return <div>Loading dashboard...</div>;

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Hello, {user.name} 👋</h1>
          <p className="text-gray-500">Here's what's happening with your store today.</p>
        </div>
        {user.role === 'seller' && (
          <Button onClick={() => setView('wallet')} className="flex items-center gap-2">
            <Plus size={18} /> New Deposit
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard icon={<ShoppingCart className="text-blue-600" />} label="Total Orders" value={stats.totalOrders} color="blue" />
        <StatCard icon={<Clock className="text-yellow-600" />} label="Pending Orders" value={stats.pendingOrders} color="yellow" />
        {user.role === 'admin' ? (
          <>
            <StatCard icon={<CreditCard className="text-green-600" />} label="Total Deposits" value={`$${stats.totalDeposits}`} color="green" />
            <StatCard icon={<User className="text-purple-600" />} label="Total Sellers" value={stats.totalUsers} color="purple" />
          </>
        ) : (
          <>
            <StatCard icon={<Wallet className="text-green-600" />} label="Wallet Balance" value={`$${stats.walletBalance}`} color="green" />
            <StatCard icon={<Package className="text-purple-600" />} label="Store Name" value={user.store_name} color="purple" />
          </>
        )}
      </div>

      {user.role === 'admin' && stats.partnerStats && (
        <Card className="p-6">
          <h3 className="font-bold mb-4">Orders by Delivery Partner</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {stats.partnerStats.map((p: any) => (
              <div key={p.delivery_partner} className="p-4 bg-gray-50 rounded-lg text-center">
                <p className="text-xs text-gray-500 uppercase font-bold tracking-wider">{p.delivery_partner}</p>
                <p className="text-2xl font-bold mt-1">{p.count}</p>
              </div>
            ))}
          </div>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold">Recent Activity</h3>
            <button className="text-orange-600 text-sm font-medium hover:underline">View All</button>
          </div>
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="flex items-center gap-4 p-3 hover:bg-gray-50 rounded-lg transition-colors">
                <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center">
                  <ShoppingCart size={18} />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-bold">New Order Placed</p>
                  <p className="text-xs text-gray-500">Order #ORD-2024-{i}0{i}</p>
                </div>
                <p className="text-xs text-gray-400">2 hours ago</p>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold">Quick Actions</h3>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <QuickAction icon={<Package />} label="Add Product" onClick={() => setView(user.role === 'admin' ? 'admin-products' : 'products')} />
            <QuickAction icon={<Wallet />} label="Add Funds" onClick={() => setView('wallet')} />
            <QuickAction icon={<MessageSquare />} label="Support" onClick={() => setView('tickets')} />
            <QuickAction icon={<Settings />} label="Settings" onClick={() => setView('settings')} />
          </div>
        </Card>
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, color }: any) {
  const colors: any = {
    blue: 'bg-blue-50',
    yellow: 'bg-yellow-50',
    green: 'bg-green-50',
    purple: 'bg-purple-50',
  };
  return (
    <Card className="p-6">
      <div className="flex items-center gap-4">
        <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center", colors[color])}>
          {icon}
        </div>
        <div>
          <p className="text-sm text-gray-500 font-medium">{label}</p>
          <p className="text-2xl font-bold mt-0.5">{value}</p>
        </div>
      </div>
    </Card>
  );
}

function QuickAction({ icon, label, onClick }: any) {
  return (
    <button 
      onClick={onClick}
      className="flex flex-col items-center justify-center p-6 bg-gray-50 hover:bg-orange-50 hover:text-orange-600 rounded-xl transition-all group border border-transparent hover:border-orange-100"
    >
      <div className="text-gray-400 group-hover:text-orange-600 mb-2">
        {React.cloneElement(icon, { size: 24 })}
      </div>
      <span className="text-sm font-bold">{label}</span>
    </button>
  );
}

function Products({ token }: any) {
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [orderQty, setOrderQty] = useState(1);
  const [partner, setPartner] = useState('Daraz');
  const [label, setLabel] = useState<File | null>(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    const res = await fetch('/api/products');
    const data = await res.json();
    setProducts(data);
  };

  const handleOrder = async (e: any) => {
    e.preventDefault();
    if (!selectedProduct) return;

    const formData = new FormData();
    formData.append('product_id', selectedProduct.id.toString());
    formData.append('quantity', orderQty.toString());
    formData.append('delivery_partner', partner);
    if (label) formData.append('shipping_label', label);

    const res = await fetch('/api/seller/orders', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: formData
    });

    if (res.ok) {
      alert('Order placed successfully!');
      setSelectedProduct(null);
      fetchProducts();
    } else {
      const data = await res.json();
      alert(data.error);
    }
  };

  const filtered = products.filter(p => p.title.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Product Catalog</h1>
          <p className="text-gray-500">Browse and order products for your store.</p>
        </div>
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <Input 
            className="pl-10" 
            placeholder="Search products..." 
            value={search}
            onChange={(e: any) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filtered.map(product => (
          <Card key={product.id} className="group cursor-pointer" onClick={() => setSelectedProduct(product)}>
            <div className="aspect-square bg-gray-100 relative overflow-hidden">
              {product.image ? (
                <img src={product.image} alt={product.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" referrerPolicy="no-referrer" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-300">
                  <ImageIcon size={48} />
                </div>
              )}
              <div className="absolute top-3 right-3">
                <Badge variant={product.stock > 0 ? 'success' : 'danger'}>
                  {product.stock > 0 ? 'In Stock' : 'Out of Stock'}
                </Badge>
              </div>
            </div>
            <div className="p-4">
              <p className="text-xs text-orange-600 font-bold uppercase tracking-wider mb-1">{product.category_name || 'General'}</p>
              <h3 className="font-bold text-gray-900 line-clamp-1">{product.title}</h3>
              <p className="text-sm text-gray-500 line-clamp-2 mt-1 h-10">{product.short_description}</p>
              <div className="mt-4 flex items-center justify-between">
                <p className="text-xl font-bold text-gray-900">${product.price}</p>
                <Button variant="outline" className="p-2">
                  <Plus size={18} />
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Order Modal */}
      <AnimatePresence>
        {selectedProduct && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/50 backdrop-blur-sm">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl overflow-hidden flex flex-col md:flex-row"
            >
              <div className="w-full md:w-1/2 bg-gray-100">
                {selectedProduct.image ? (
                  <img src={selectedProduct.image} alt={selectedProduct.title} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-300">
                    <ImageIcon size={64} />
                  </div>
                )}
              </div>
              <div className="w-full md:w-1/2 p-8 flex flex-col">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <Badge variant="info">{selectedProduct.category_name || 'General'}</Badge>
                    <h2 className="text-2xl font-bold mt-2">{selectedProduct.title}</h2>
                  </div>
                  <button onClick={() => setSelectedProduct(null)} className="p-2 hover:bg-gray-100 rounded-full">
                    <X size={20} />
                  </button>
                </div>
                
                <p className="text-gray-600 mb-6">{selectedProduct.long_description}</p>
                
                <div className="mt-auto space-y-6">
                  <div className="flex items-center justify-between">
                    <p className="text-3xl font-bold text-gray-900">${selectedProduct.price}</p>
                    <p className="text-sm text-gray-500">Stock: <span className="font-bold text-gray-900">{selectedProduct.stock}</span></p>
                  </div>

                  <form onSubmit={handleOrder} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Quantity</label>
                        <Input type="number" min="1" max={selectedProduct.stock} value={orderQty} onChange={(e: any) => setOrderQty(e.target.value)} />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Partner</label>
                        <select 
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none"
                          value={partner}
                          onChange={(e: any) => setPartner(e.target.value)}
                        >
                          <option>Daraz</option>
                          <option>Leopards</option>
                          <option>TCS</option>
                          <option>Custom</option>
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Shipping Label (PDF/Image)</label>
                      <div className="relative">
                        <input 
                          type="file" 
                          className="absolute inset-0 opacity-0 cursor-pointer" 
                          onChange={(e: any) => setLabel(e.target.files[0])}
                        />
                        <div className="w-full px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center gap-2 text-gray-500 hover:border-orange-500 hover:text-orange-600 transition-all">
                          <Upload size={18} />
                          <span className="text-sm font-medium">{label ? label.name : 'Upload Label'}</span>
                        </div>
                      </div>
                    </div>
                    <Button type="submit" className="w-full py-4 text-lg" disabled={selectedProduct.stock === 0}>
                      Place Order
                    </Button>
                  </form>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function WalletView({ user, token, fetchProfile }: any) {
  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState('Bank Transfer');
  const [screenshot, setScreenshot] = useState<File | null>(null);
  const [history, setHistory] = useState<Deposit[]>([]);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    // In a real app, we'd have a specific endpoint for seller's own deposits
    const res = await fetch('/api/admin/deposits', {
      headers: { Authorization: `Bearer ${token}` }
    });
    const data = await res.json();
    setHistory(data.filter((d: any) => d.user_id === user.id));
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('amount', amount);
    formData.append('payment_method', method);
    if (screenshot) formData.append('screenshot', screenshot);

    const res = await fetch('/api/seller/deposits', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: formData
    });

    if (res.ok) {
      alert('Deposit request submitted!');
      setAmount('');
      setScreenshot(null);
      fetchHistory();
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-1 space-y-6">
        <Card className="p-6 bg-orange-600 text-white border-none shadow-xl shadow-orange-100">
          <p className="text-orange-100 text-sm font-medium">Available Balance</p>
          <h2 className="text-4xl font-bold mt-1">${user.wallet_balance.toFixed(2)}</h2>
          <div className="mt-8 flex items-center gap-2 text-orange-100 text-sm">
            <CheckCircle size={16} /> Verified Account
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="font-bold mb-6 flex items-center gap-2">
            <Plus size={20} className="text-orange-600" /> New Deposit Request
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Amount ($)</label>
              <Input type="number" placeholder="0.00" value={amount} onChange={(e: any) => setAmount(e.target.value)} required />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Payment Method</label>
              <select 
                className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none"
                value={method}
                onChange={(e: any) => setMethod(e.target.value)}
              >
                <option>Bank Transfer</option>
                <option>JazzCash</option>
                <option>EasyPaisa</option>
                <option>Crypto (USDT)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Payment Screenshot</label>
              <div className="relative">
                <input 
                  type="file" 
                  className="absolute inset-0 opacity-0 cursor-pointer" 
                  onChange={(e: any) => setScreenshot(e.target.files[0])}
                  required
                />
                <div className="w-full px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center gap-2 text-gray-500 hover:border-orange-500 hover:text-orange-600 transition-all">
                  <Upload size={18} />
                  <span className="text-sm font-medium">{screenshot ? screenshot.name : 'Upload Proof'}</span>
                </div>
              </div>
            </div>
            <Button type="submit" className="w-full py-3">Submit Request</Button>
          </form>
        </Card>
      </div>

      <div className="lg:col-span-2">
        <Card className="h-full">
          <div className="p-6 border-b border-gray-100 flex items-center justify-between">
            <h3 className="font-bold">Deposit History</h3>
            <button onClick={fetchHistory} className="text-gray-400 hover:text-gray-600">
              <Clock size={18} />
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-50 text-xs text-gray-500 uppercase font-bold">
                <tr>
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4">Method</th>
                  <th className="px-6 py-4">Amount</th>
                  <th className="px-6 py-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {history.map(d => (
                  <tr key={d.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 text-sm text-gray-600">{new Date(d.created_at).toLocaleDateString()}</td>
                    <td className="px-6 py-4 text-sm font-medium">{d.payment_method}</td>
                    <td className="px-6 py-4 text-sm font-bold">${d.amount}</td>
                    <td className="px-6 py-4">
                      <Badge variant={d.status === 'approved' ? 'success' : d.status === 'pending' ? 'warning' : 'danger'}>
                        {d.status}
                      </Badge>
                    </td>
                  </tr>
                ))}
                {history.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center text-gray-400">No deposits found</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
}

function Orders({ token }: any) {
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    const res = await fetch('/api/seller/orders', {
      headers: { Authorization: `Bearer ${token}` }
    });
    const data = await res.json();
    setOrders(data);
  };

  return (
    <Card>
      <div className="p-6 border-b border-gray-100">
        <h3 className="font-bold">My Orders</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-gray-50 text-xs text-gray-500 uppercase font-bold">
            <tr>
              <th className="px-6 py-4">Order ID</th>
              <th className="px-6 py-4">Product</th>
              <th className="px-6 py-4">Qty</th>
              <th className="px-6 py-4">Total</th>
              <th className="px-6 py-4">Partner</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4">Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {orders.map(o => (
              <tr key={o.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 text-sm font-bold">#ORD-{o.id}</td>
                <td className="px-6 py-4 text-sm">{o.product_title}</td>
                <td className="px-6 py-4 text-sm">{o.quantity}</td>
                <td className="px-6 py-4 text-sm font-bold">${o.total_price}</td>
                <td className="px-6 py-4 text-sm">{o.delivery_partner}</td>
                <td className="px-6 py-4">
                  <Badge variant={o.status === 'delivered' ? 'success' : o.status === 'pending' ? 'warning' : 'info'}>
                    {o.status}
                  </Badge>
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">{new Date(o.created_at).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

function Tickets({ token, user }: any) {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [category, setCategory] = useState('Payment');
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    const endpoint = user.role === 'admin' ? '/api/admin/tickets' : '/api/seller/tickets';
    const res = await fetch(endpoint, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const data = await res.json();
    setTickets(data);
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    const res = await fetch('/api/seller/tickets', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}` 
      },
      body: JSON.stringify({ category, message })
    });
    if (res.ok) {
      alert('Ticket submitted!');
      setMessage('');
      fetchTickets();
    }
  };

  const handleReply = async (id: number, reply: string) => {
    const res = await fetch(`/api/admin/tickets/${id}/reply`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}` 
      },
      body: JSON.stringify({ reply })
    });
    if (res.ok) {
      alert('Reply sent!');
      fetchTickets();
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {user.role === 'seller' && (
        <div className="lg:col-span-1">
          <Card className="p-6">
            <h3 className="font-bold mb-6">Create Support Ticket</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Category</label>
                <select 
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none"
                  value={category}
                  onChange={(e: any) => setCategory(e.target.value)}
                >
                  <option>Payment</option>
                  <option>Order Issue</option>
                  <option>Product Inquiry</option>
                  <option>Other</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Message</label>
                <textarea 
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none h-32"
                  value={message}
                  onChange={(e: any) => setMessage(e.target.value)}
                  required
                />
              </div>
              <Button type="submit" className="w-full">Submit Ticket</Button>
            </form>
          </Card>
        </div>
      )}

      <div className={cn(user.role === 'seller' ? 'lg:col-span-2' : 'lg:col-span-3')}>
        <div className="space-y-4">
          {tickets.map(t => (
            <Card key={t.id} className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <Badge variant={t.status === 'open' ? 'warning' : 'success'}>{t.status}</Badge>
                  <span className="text-xs text-gray-500 font-bold uppercase tracking-wider">{t.category}</span>
                </div>
                <span className="text-xs text-gray-400">{new Date(t.created_at).toLocaleString()}</span>
              </div>
              {user.role === 'admin' && <p className="text-xs font-bold text-orange-600 mb-1">From: {t.user_name}</p>}
              <p className="text-gray-800 font-medium">{t.message}</p>
              
              {t.reply && (
                <div className="mt-4 p-4 bg-gray-50 rounded-lg border-l-4 border-orange-500">
                  <p className="text-xs font-bold text-orange-600 mb-1">Support Reply:</p>
                  <p className="text-sm text-gray-700">{t.reply}</p>
                </div>
              )}

              {user.role === 'admin' && !t.reply && (
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <textarea 
                    id={`reply-${t.id}`}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none text-sm mb-2"
                    placeholder="Type your reply..."
                  />
                  <Button 
                    size="sm" 
                    onClick={() => {
                      const el = document.getElementById(`reply-${t.id}`) as HTMLTextAreaElement;
                      handleReply(t.id, el.value);
                    }}
                  >
                    Send Reply
                  </Button>
                </div>
              )}
            </Card>
          ))}
          {tickets.length === 0 && (
            <div className="text-center py-12 text-gray-400">No tickets found</div>
          )}
        </div>
      </div>
    </div>
  );
}

// --- Admin Components ---

function AdminProducts({ token }: any) {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  
  // Form state
  const [title, setTitle] = useState('');
  const [shortDesc, setShortDesc] = useState('');
  const [longDesc, setLongDesc] = useState('');
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState('');
  const [catId, setCatId] = useState('');
  const [image, setImage] = useState<File | null>(null);

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  const fetchProducts = async () => {
    const res = await fetch('/api/products');
    const data = await res.json();
    setProducts(data);
  };

  const fetchCategories = async () => {
    const res = await fetch('/api/categories');
    const data = await res.json();
    setCategories(data);
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('title', title);
    formData.append('short_description', shortDesc);
    formData.append('long_description', longDesc);
    formData.append('price', price);
    formData.append('stock', stock);
    formData.append('category_id', catId);
    if (image) formData.append('image', image);

    const res = await fetch('/api/admin/products', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: formData
    });

    if (res.ok) {
      alert('Product added!');
      setShowAdd(false);
      fetchProducts();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Manage Products</h1>
        <Button onClick={() => setShowAdd(true)} className="flex items-center gap-2">
          <Plus size={18} /> Add New Product
        </Button>
      </div>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 text-xs text-gray-500 uppercase font-bold">
              <tr>
                <th className="px-6 py-4">Image</th>
                <th className="px-6 py-4">Title</th>
                <th className="px-6 py-4">Category</th>
                <th className="px-6 py-4">Price</th>
                <th className="px-6 py-4">Stock</th>
                <th className="px-6 py-4">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {products.map(p => (
                <tr key={p.id}>
                  <td className="px-6 py-4">
                    <div className="w-12 h-12 rounded bg-gray-100 overflow-hidden">
                      {p.image && <img src={p.image} className="w-full h-full object-cover" referrerPolicy="no-referrer" />}
                    </div>
                  </td>
                  <td className="px-6 py-4 font-bold">{p.title}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{p.category_name}</td>
                  <td className="px-6 py-4 font-bold">${p.price}</td>
                  <td className="px-6 py-4">{p.stock}</td>
                  <td className="px-6 py-4">
                    <button className="text-blue-600 hover:underline mr-4">Edit</button>
                    <button className="text-red-600 hover:underline">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {showAdd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/50 backdrop-blur-sm">
          <Card className="w-full max-w-2xl p-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">Add New Product</h2>
              <button onClick={() => setShowAdd(false)}><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Title</label>
                  <Input value={title} onChange={(e: any) => setTitle(e.target.value)} required />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Price ($)</label>
                  <Input type="number" value={price} onChange={(e: any) => setPrice(e.target.value)} required />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Stock</label>
                  <Input type="number" value={stock} onChange={(e: any) => setStock(e.target.value)} required />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Category</label>
                  <select 
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none"
                    value={catId}
                    onChange={(e: any) => setCatId(e.target.value)}
                    required
                  >
                    <option value="">Select Category</option>
                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Short Description</label>
                  <Input value={shortDesc} onChange={(e: any) => setShortDesc(e.target.value)} required />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Long Description</label>
                  <textarea 
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none h-24"
                    value={longDesc}
                    onChange={(e: any) => setLongDesc(e.target.value)}
                    required
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Product Image</label>
                  <Input type="file" onChange={(e: any) => setImage(e.target.files[0])} />
                </div>
              </div>
              <Button type="submit" className="w-full py-3">Save Product</Button>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
}

function AdminOrders({ token }: any) {
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    const res = await fetch('/api/admin/orders', {
      headers: { Authorization: `Bearer ${token}` }
    });
    const data = await res.json();
    setOrders(data);
  };

  return (
    <Card>
      <div className="p-6 border-b border-gray-100">
        <h3 className="font-bold">All Orders</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-gray-50 text-xs text-gray-500 uppercase font-bold">
            <tr>
              <th className="px-6 py-4">ID</th>
              <th className="px-6 py-4">Seller</th>
              <th className="px-6 py-4">Product</th>
              <th className="px-6 py-4">Qty</th>
              <th className="px-6 py-4">Total</th>
              <th className="px-6 py-4">Partner</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {orders.map(o => (
              <tr key={o.id}>
                <td className="px-6 py-4 text-sm font-bold">#ORD-{o.id}</td>
                <td className="px-6 py-4 text-sm">{o.user_name}</td>
                <td className="px-6 py-4 text-sm">{o.product_title}</td>
                <td className="px-6 py-4 text-sm">{o.quantity}</td>
                <td className="px-6 py-4 text-sm font-bold">${o.total_price}</td>
                <td className="px-6 py-4 text-sm">{o.delivery_partner}</td>
                <td className="px-6 py-4">
                  <Badge variant={o.status === 'delivered' ? 'success' : 'warning'}>{o.status}</Badge>
                </td>
                <td className="px-6 py-4">
                  <button className="text-orange-600 hover:underline text-sm font-bold">Fulfill</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

function AdminDeposits({ token }: any) {
  const [deposits, setDeposits] = useState<Deposit[]>([]);
  const [selectedScreenshot, setSelectedScreenshot] = useState<string | null>(null);

  useEffect(() => {
    fetchDeposits();
  }, []);

  const fetchDeposits = async () => {
    const res = await fetch('/api/admin/deposits', {
      headers: { Authorization: `Bearer ${token}` }
    });
    const data = await res.json();
    setDeposits(data);
  };

  const handleAction = async (id: number, action: 'approve' | 'reject') => {
    const res = await fetch(`/api/admin/deposits/${id}/${action}`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` }
    });
    if (res.ok) {
      alert(`Deposit ${action}ed!`);
      fetchDeposits();
    }
  };

  return (
    <Card>
      <div className="p-6 border-b border-gray-100">
        <h3 className="font-bold">Deposit Requests</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-gray-50 text-xs text-gray-500 uppercase font-bold">
            <tr>
              <th className="px-6 py-4">Seller</th>
              <th className="px-6 py-4">Amount</th>
              <th className="px-6 py-4">Method</th>
              <th className="px-6 py-4">Screenshot</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {deposits.map(d => (
              <tr key={d.id}>
                <td className="px-6 py-4 text-sm font-bold">{d.user_name}</td>
                <td className="px-6 py-4 text-sm font-bold">${d.amount}</td>
                <td className="px-6 py-4 text-sm">{d.payment_method}</td>
                <td className="px-6 py-4">
                  <button 
                    onClick={() => setSelectedScreenshot(d.screenshot)}
                    className="text-orange-600 hover:underline text-xs font-bold flex items-center gap-1"
                  >
                    <ImageIcon size={14} /> View
                  </button>
                </td>
                <td className="px-6 py-4">
                  <Badge variant={d.status === 'approved' ? 'success' : d.status === 'pending' ? 'warning' : 'danger'}>
                    {d.status}
                  </Badge>
                </td>
                <td className="px-6 py-4">
                  {d.status === 'pending' && (
                    <div className="flex gap-2">
                      <button onClick={() => handleAction(d.id, 'approve')} className="text-green-600 hover:underline text-xs font-bold">Approve</button>
                      <button onClick={() => handleAction(d.id, 'reject')} className="text-red-600 hover:underline text-xs font-bold">Reject</button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selectedScreenshot && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm" onClick={() => setSelectedScreenshot(null)}>
          <div className="max-w-2xl w-full bg-white p-2 rounded-lg relative">
            <img src={selectedScreenshot} className="w-full h-auto rounded" referrerPolicy="no-referrer" />
            <button className="absolute -top-10 right-0 text-white flex items-center gap-2 font-bold">
              <X size={24} /> Close
            </button>
          </div>
        </div>
      )}
    </Card>
  );
}

function SettingsView({ user }: any) {
  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <h1 className="text-2xl font-bold">Account Settings</h1>
      
      <Card className="p-8">
        <h3 className="font-bold mb-6">Profile Information</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Full Name</label>
            <Input value={user.name} disabled />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Email Address</label>
            <Input value={user.email} disabled />
          </div>
          {user.role === 'seller' && (
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Store Name</label>
              <Input value={user.store_name} disabled />
            </div>
          )}
        </div>
      </Card>

      <Card className="p-8">
        <h3 className="font-bold mb-6">Security</h3>
        <form className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Current Password</label>
            <Input type="password" placeholder="••••••••" />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">New Password</label>
            <Input type="password" placeholder="••••••••" />
          </div>
          <Button className="w-full">Update Password</Button>
        </form>
      </Card>
    </div>
  );
}
