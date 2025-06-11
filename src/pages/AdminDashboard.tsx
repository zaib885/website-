import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  Users, 
  Package, 
  ShoppingBag, 
  LogOut, 
  Home, 
  Plus, 
  Edit, 
  Trash2, 
  X,
  Check,
  AlertCircle,
  BarChart3,
  DollarSign,
  TrendingUp
} from 'lucide-react';
import axios from 'axios';
import AdminAnalytics from './AdminAnalytics';

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  image_url: string;
  stock: number;
  category_id: number;
  created_at?: string;
}

interface Category {
  id: number;
  name: string;
  description: string;
}

interface User {
  id: number;
  name: string;
  email: string;
  role: 'admin' | 'user';
  created_at: string;
}

interface Order {
  id: number;
  user_id: number;
  user_name: string;
  total_amount: number;
  status: 'ordered' | 'shipped' | 'delivered' | 'cancelled';
  created_at: string;
  items: Array<{
    product_name: string;
    quantity: number;
    price: number;
  }>;
}

type ModalType = 'none' | 'add-product' | 'edit-product' | 'delete-product' | 'success' | 'add-category' | 'edit-category' | 'delete-category';

const AdminDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalType, setModalType] = useState<ModalType>('none');
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [successMessage, setSuccessMessage] = useState('');
  
  const [productForm, setProductForm] = useState({
    name: '',
    description: '',
    price: '',
    image_url: '',
    stock: '',
    category_id: ''
  });

  const [categoryForm, setCategoryForm] = useState({
    name: '',
    description: ''
  });

  const { user, logout } = useAuth();

  useEffect(() => {
    if (user && user.role === 'admin') {
      fetchData();
    }
  }, [user]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [productsRes, categoriesRes, usersRes, ordersRes] = await Promise.all([
        axios.get('http://localhost:3001/api/products'),
        axios.get('http://localhost:3001/api/categories'),
        axios.get('http://localhost:3001/api/users'),
        axios.get('http://localhost:3001/api/orders')
      ]);
      
      setProducts(productsRes.data);
      setCategories(categoriesRes.data);
      setUsers(usersRes.data);
      setOrders(ordersRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const showSuccessModal = (message: string) => {
    setSuccessMessage(message);
    setModalType('success');
    setTimeout(() => {
      setModalType('none');
      setSuccessMessage('');
    }, 2000);
  };

  // Product CRUD operations
  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:3001/api/products', {
        ...productForm,
        price: parseFloat(productForm.price),
        stock: parseInt(productForm.stock),
        category_id: parseInt(productForm.category_id)
      });
      
      setProducts([...products, response.data]);
      setProductForm({ name: '', description: '', price: '', image_url: '', stock: '', category_id: '' });
      setModalType('none');
      showSuccessModal('Product added successfully!');
    } catch (error) {
      console.error('Error adding product:', error);
      alert('Failed to add product');
    }
  };

  const handleEditProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await axios.put(`http://localhost:3001/api/products/${selectedItem.id}`, {
        ...productForm,
        price: parseFloat(productForm.price),
        stock: parseInt(productForm.stock),
        category_id: parseInt(productForm.category_id)
      });
      
      setProducts(products.map(p => p.id === selectedItem.id ? response.data : p));
      setModalType('none');
      setSelectedItem(null);
      showSuccessModal('Product updated successfully!');
    } catch (error) {
      console.error('Error updating product:', error);
      alert('Failed to update product');
    }
  };

  const handleDeleteProduct = async () => {
    try {
      await axios.delete(`http://localhost:3001/api/products/${selectedItem.id}`);
      setProducts(products.filter(p => p.id !== selectedItem.id));
      setModalType('none');
      setSelectedItem(null);
      showSuccessModal('Product deleted successfully!');
    } catch (error) {
      console.error('Error deleting product:', error);
      alert('Failed to delete product');
    }
  };

  // Category CRUD operations
  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:3001/api/categories', categoryForm);
      setCategories([...categories, response.data]);
      setCategoryForm({ name: '', description: '' });
      setModalType('none');
      showSuccessModal('Category added successfully!');
    } catch (error) {
      console.error('Error adding category:', error);
      alert('Failed to add category');
    }
  };

  const handleEditCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await axios.put(`http://localhost:3001/api/categories/${selectedItem.id}`, categoryForm);
      setCategories(categories.map(c => c.id === selectedItem.id ? response.data : c));
      setModalType('none');
      setSelectedItem(null);
      showSuccessModal('Category updated successfully!');
    } catch (error) {
      console.error('Error updating category:', error);
      alert('Failed to update category');
    }
  };

  const handleDeleteCategory = async () => {
    try {
      await axios.delete(`http://localhost:3001/api/categories/${selectedItem.id}`);
      setCategories(categories.filter(c => c.id !== selectedItem.id));
      setModalType('none');
      setSelectedItem(null);
      showSuccessModal('Category deleted successfully!');
    } catch (error) {
      console.error('Error deleting category:', error);
      alert('Failed to delete category');
    }
  };

  const openEditProductModal = (product: Product) => {
    setSelectedItem(product);
    setProductForm({
      name: product.name,
      description: product.description,
      price: product.price.toString(),
      image_url: product.image_url,
      stock: product.stock.toString(),
      category_id: product.category_id.toString()
    });
    setModalType('edit-product');
  };

  const openEditCategoryModal = (category: Category) => {
    setSelectedItem(category);
    setCategoryForm({
      name: category.name,
      description: category.description
    });
    setModalType('edit-category');
  };

  const closeModal = () => {
    setModalType('none');
    setSelectedItem(null);
    setProductForm({ name: '', description: '', price: '', image_url: '', stock: '', category_id: '' });
    setCategoryForm({ name: '', description: '' });
  };

  const updateOrderStatus = async (orderId: number, status: string) => {
    try {
      await axios.put(`http://localhost:3001/api/orders/${orderId}`, { status });
      setOrders(orders.map(o => o.id === orderId ? { ...o, status: status as any } : o));
      showSuccessModal(`Order status updated to ${status}!`);
    } catch (error) {
      console.error('Error updating order status:', error);
      alert('Failed to update order status');
    }
  };

  const updateUserRole = async (userId: number, role: string) => {
    try {
      await axios.put(`http://localhost:3001/api/users/${userId}`, { role });
      setUsers(users.map(u => u.id === userId ? { ...u, role: role as any } : u));
      showSuccessModal(`User role updated to ${role}!`);
    } catch (error) {
      console.error('Error updating user role:', error);
      alert('Failed to update user role');
    }
  };

  if (!user || user.role !== 'admin') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-text mb-2">Access Denied</h2>
          <p className="text-text-secondary mb-6">You don't have permission to access this page.</p>
          <Link to="/" className="btn-primary">
            Return to Home
          </Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-text-secondary">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  const stats = {
    totalProducts: products.length,
    totalUsers: users.length,
    totalOrders: orders.length,
    totalRevenue: orders.reduce((sum, order) => sum + (order.total_amount || 0), 0)
  };

  return (
    <div className="min-h-screen bg-bg">
      {/* Header */}
      <header className="bg-white shadow-lg border-b border-border sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <Package className="h-8 w-8 text-primary" />
              <h1 className="text-2xl font-bold text-text">Admin Dashboard</h1>
            </div>
            
            <nav className="flex items-center gap-4">
              <Link
                to="/"
                className="flex items-center gap-2 text-text-secondary hover:text-text transition-colors"
              >
                <Home className="h-4 w-4" />
                Home
              </Link>
              <button
                onClick={logout}
                className="flex items-center gap-2 text-text-secondary hover:text-text transition-colors"
              >
                <LogOut className="h-4 w-4" />
                Logout
              </button>
            </nav>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="bg-gradient-to-r from-primary to-primary-light rounded-2xl text-white p-8 mb-8">
          <h1 className="text-3xl font-bold mb-2">Welcome back, {user?.name}!</h1>
          <p className="text-xl opacity-90">Manage your e-commerce platform</p>
        </div>

        {/* Navigation Tabs */}
        <div className="flex flex-wrap gap-2 mb-8 bg-white p-2 rounded-2xl shadow-lg">
          {[
            { id: 'overview', label: 'Overview', icon: BarChart3 },
            { id: 'products', label: 'Products', icon: Package },
            { id: 'categories', label: 'Categories', icon: ShoppingBag },
            { id: 'orders', label: 'Orders', icon: ShoppingBag },
            { id: 'users', label: 'Users', icon: Users },
            { id: 'analytics', label: 'Analytics', icon: TrendingUp }
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all duration-200 ${
                  activeTab === tab.id
                    ? 'bg-primary text-white shadow-lg'
                    : 'text-text-secondary hover:text-text hover:bg-bg-secondary'
                }`}
              >
                <Icon className="h-4 w-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="card p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-text-secondary text-sm font-medium">Total Products</p>
                    <p className="text-3xl font-bold text-text">{stats.totalProducts}</p>
                  </div>
                  <Package className="h-12 w-12 text-primary" />
                </div>
              </div>

              <div className="card p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-text-secondary text-sm font-medium">Total Users</p>
                    <p className="text-3xl font-bold text-text">{stats.totalUsers}</p>
                  </div>
                  <Users className="h-12 w-12 text-primary" />
                </div>
              </div>

              <div className="card p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-text-secondary text-sm font-medium">Total Orders</p>
                    <p className="text-3xl font-bold text-text">{stats.totalOrders}</p>
                  </div>
                  <ShoppingBag className="h-12 w-12 text-primary" />
                </div>
              </div>

              <div className="card p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-text-secondary text-sm font-medium">Total Revenue</p>
                    <p className="text-3xl font-bold text-text">${stats.totalRevenue.toFixed(2)}</p>
                  </div>
                  <DollarSign className="h-12 w-12 text-primary" />
                </div>
              </div>
            </div>

            {/* Recent Orders */}
            <div className="card">
              <div className="p-6 border-b border-border">
                <h2 className="text-xl font-semibold text-text">Recent Orders</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-border">
                  <thead className="table-header">
                    <tr>
                      <th className="px-6 py-3 text-left">Order ID</th>
                      <th className="px-6 py-3 text-left">Customer</th>
                      <th className="px-6 py-3 text-left">Amount</th>
                      <th className="px-6 py-3 text-left">Status</th>
                      <th className="px-6 py-3 text-left">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {orders.slice(0, 5).map((order) => (
                      <tr key={order.id} className="table-row">
                        <td className="px-6 py-4 text-sm font-medium text-text">#{order.id}</td>
                        <td className="px-6 py-4 text-sm text-text">{order.user_name}</td>
                        <td className="px-6 py-4 text-sm text-text">${order.total_amount?.toFixed(2)}</td>
                        <td className="px-6 py-4">
                          <span className={`status-badge status-${order.status}`}>
                            {order.status.toUpperCase()}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-text-secondary">
                          {new Date(order.created_at).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Products Tab */}
        {activeTab === 'products' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-text">Products Management</h2>
              <button
                onClick={() => setModalType('add-product')}
                className="btn-primary flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Add Product
              </button>
            </div>

            <div className="card overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-border">
                  <thead className="table-header">
                    <tr>
                      <th className="px-6 py-3 text-left">Image</th>
                      <th className="px-6 py-3 text-left">Name</th>
                      <th className="px-6 py-3 text-left">Price</th>
                      <th className="px-6 py-3 text-left">Stock</th>
                      <th className="px-6 py-3 text-left">Category</th>
                      <th className="px-6 py-3 text-left">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {products.map((product) => (
                      <tr key={product.id} className="table-row">
                        <td className="px-6 py-4">
                          <img
                            src={product.image_url}
                            alt={product.name}
                            className="w-12 h-12 object-cover rounded-lg"
                          />
                        </td>
                        <td className="px-6 py-4 text-sm font-medium text-text">{product.name}</td>
                        <td className="px-6 py-4 text-sm text-text">${product.price}</td>
                        <td className="px-6 py-4 text-sm text-text">{product.stock}</td>
                        <td className="px-6 py-4 text-sm text-text">
                          {categories.find(c => c.id === product.category_id)?.name || 'Unknown'}
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <div className="flex gap-2">
                            <button
                              onClick={() => openEditProductModal(product)}
                              className="text-primary hover:text-primary-dark"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => {
                                setSelectedItem(product);
                                setModalType('delete-product');
                              }}
                              className="text-red-500 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Categories Tab */}
        {activeTab === 'categories' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-text">Categories Management</h2>
              <button
                onClick={() => setModalType('add-category')}
                className="btn-primary flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Add Category
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {categories.map((category) => (
                <div key={category.id} className="card p-6">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-lg font-semibold text-text">{category.name}</h3>
                    <div className="flex gap-2">
                      <button
                        onClick={() => openEditCategoryModal(category)}
                        className="text-primary hover:text-primary-dark"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => {
                          setSelectedItem(category);
                          setModalType('delete-category');
                        }}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                  <p className="text-text-secondary text-sm mb-4">{category.description}</p>
                  <p className="text-xs text-text-secondary">
                    {products.filter(p => p.category_id === category.id).length} products
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Orders Tab */}
        {activeTab === 'orders' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-text">Orders Management</h2>

            <div className="card overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-border">
                  <thead className="table-header">
                    <tr>
                      <th className="px-6 py-3 text-left">Order ID</th>
                      <th className="px-6 py-3 text-left">Customer</th>
                      <th className="px-6 py-3 text-left">Items</th>
                      <th className="px-6 py-3 text-left">Amount</th>
                      <th className="px-6 py-3 text-left">Status</th>
                      <th className="px-6 py-3 text-left">Date</th>
                      <th className="px-6 py-3 text-left">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {orders.map((order) => (
                      <tr key={order.id} className="table-row">
                        <td className="px-6 py-4 text-sm font-medium text-text">#{order.id}</td>
                        <td className="px-6 py-4 text-sm text-text">{order.user_name}</td>
                        <td className="px-6 py-4 text-sm text-text">{order.items?.length || 0}</td>
                        <td className="px-6 py-4 text-sm text-text">${order.total_amount?.toFixed(2)}</td>
                        <td className="px-6 py-4">
                          <span className={`status-badge status-${order.status}`}>
                            {order.status.toUpperCase()}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-text-secondary">
                          {new Date(order.created_at).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4">
                          <select
                            value={order.status}
                            onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                            className="text-xs border border-border rounded-lg px-2 py-1"
                          >
                            <option value="ordered">Ordered</option>
                            <option value="shipped">Shipped</option>
                            <option value="delivered">Delivered</option>
                            <option value="cancelled">Cancelled</option>
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-text">Users Management</h2>

            <div className="card overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-border">
                  <thead className="table-header">
                    <tr>
                      <th className="px-6 py-3 text-left">Name</th>
                      <th className="px-6 py-3 text-left">Email</th>
                      <th className="px-6 py-3 text-left">Role</th>
                      <th className="px-6 py-3 text-left">Joined</th>
                      <th className="px-6 py-3 text-left">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {users.map((user) => (
                      <tr key={user.id} className="table-row">
                        <td className="px-6 py-4 text-sm font-medium text-text">{user.name}</td>
                        <td className="px-6 py-4 text-sm text-text">{user.email}</td>
                        <td className="px-6 py-4">
                          <span className={`status-badge ${user.role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-800'}`}>
                            {user.role.toUpperCase()}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-text-secondary">
                          {new Date(user.created_at).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4">
                          <select
                            value={user.role}
                            onChange={(e) => updateUserRole(user.id, e.target.value)}
                            className="text-xs border border-border rounded-lg px-2 py-1"
                          >
                            <option value="user">User</option>
                            <option value="admin">Admin</option>
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Analytics Tab */}
        {activeTab === 'analytics' && <AdminAnalytics />}
      </div>

      {/* Modals */}
      {modalType !== 'none' && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            {/* Success Modal */}
            {modalType === 'success' && (
              <div className="p-8 text-center">
                <div className="bg-green-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <Check className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="text-xl font-semibold text-text mb-2">Success!</h3>
                <p className="text-text-secondary">{successMessage}</p>
              </div>
            )}

            {/* Add/Edit Product Modal */}
            {(modalType === 'add-product' || modalType === 'edit-product') && (
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-semibold text-text">
                    {modalType === 'add-product' ? 'Add New Product' : 'Edit Product'}
                  </h3>
                  <button onClick={closeModal} className="text-text-secondary hover:text-text">
                    <X className="h-6 w-6" />
                  </button>
                </div>

                <form onSubmit={modalType === 'add-product' ? handleAddProduct : handleEditProduct} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-text mb-1">Product Name</label>
                    <input
                      type="text"
                      required
                      value={productForm.name}
                      onChange={(e) => setProductForm({...productForm, name: e.target.value})}
                      className="input-field"
                      placeholder="Enter product name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-text mb-1">Description</label>
                    <textarea
                      required
                      rows={3}
                      value={productForm.description}
                      onChange={(e) => setProductForm({...productForm, description: e.target.value})}
                      className="input-field"
                      placeholder="Enter product description"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-text mb-1">Price ($)</label>
                      <input
                        type="number"
                        step="0.01"
                        required
                        value={productForm.price}
                        onChange={(e) => setProductForm({...productForm, price: e.target.value})}
                        className="input-field"
                        placeholder="0.00"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-text mb-1">Stock</label>
                      <input
                        type="number"
                        required
                        value={productForm.stock}
                        onChange={(e) => setProductForm({...productForm, stock: e.target.value})}
                        className="input-field"
                        placeholder="0"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-text mb-1">Category</label>
                    <select
                      required
                      value={productForm.category_id}
                      onChange={(e) => setProductForm({...productForm, category_id: e.target.value})}
                      className="input-field"
                    >
                      <option value="">Select a category</option>
                      {categories.map((category) => (
                        <option key={category.id} value={category.id}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-text mb-1">Image URL</label>
                    <input
                      type="url"
                      required
                      value={productForm.image_url}
                      onChange={(e) => setProductForm({...productForm, image_url: e.target.value})}
                      className="input-field"
                      placeholder="https://example.com/image.jpg"
                    />
                  </div>

                  <div className="flex gap-3 pt-4">
                    <button type="submit" className="btn-primary flex-1">
                      {modalType === 'add-product' ? 'Add Product' : 'Update Product'}
                    </button>
                    <button type="button" onClick={closeModal} className="btn-secondary flex-1">
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Add/Edit Category Modal */}
            {(modalType === 'add-category' || modalType === 'edit-category') && (
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-semibold text-text">
                    {modalType === 'add-category' ? 'Add New Category' : 'Edit Category'}
                  </h3>
                  <button onClick={closeModal} className="text-text-secondary hover:text-text">
                    <X className="h-6 w-6" />
                  </button>
                </div>

                <form onSubmit={modalType === 'add-category' ? handleAddCategory : handleEditCategory} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-text mb-1">Category Name</label>
                    <input
                      type="text"
                      required
                      value={categoryForm.name}
                      onChange={(e) => setCategoryForm({...categoryForm, name: e.target.value})}
                      className="input-field"
                      placeholder="Enter category name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-text mb-1">Description</label>
                    <textarea
                      required
                      rows={3}
                      value={categoryForm.description}
                      onChange={(e) => setCategoryForm({...categoryForm, description: e.target.value})}
                      className="input-field"
                      placeholder="Enter category description"
                    />
                  </div>

                  <div className="flex gap-3 pt-4">
                    <button type="submit" className="btn-primary flex-1">
                      {modalType === 'add-category' ? 'Add Category' : 'Update Category'}
                    </button>
                    <button type="button" onClick={closeModal} className="btn-secondary flex-1">
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Delete Confirmation Modals */}
            {(modalType === 'delete-product' || modalType === 'delete-category') && (
              <div className="p-6 text-center">
                <div className="bg-red-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <AlertCircle className="h-8 w-8 text-red-600" />
                </div>
                <h3 className="text-xl font-semibold text-text mb-2">Confirm Deletion</h3>
                <p className="text-text-secondary mb-6">
                  Are you sure you want to delete "{selectedItem?.name}"? This action cannot be undone.
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={modalType === 'delete-product' ? handleDeleteProduct : handleDeleteCategory}
                    className="btn-danger flex-1"
                  >
                    Delete
                  </button>
                  <button onClick={closeModal} className="btn-secondary flex-1">
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;