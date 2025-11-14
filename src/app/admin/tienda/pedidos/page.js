'use client';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { 
  FaShoppingCart, 
  FaCheck, 
  FaTimes, 
  FaTruck,
  FaClock,
  FaEye,
  FaArrowLeft,
  FaEnvelope,
  FaPhone,
  FaMapMarkerAlt,
  FaUser
} from 'react-icons/fa';
import { Toaster, toast } from 'react-hot-toast';
import Link from 'next/link';

export default function AdminPedidosPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [filter, setFilter] = useState('all'); // all, pending, confirmed, delivered, cancelled

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      router.push('/');
      return;
    }
    setUser(user);
    loadOrders();
  };

  const loadOrders = async () => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          order_items (*)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setOrders(data || []);
    } catch (error) {
      console.error('Error loading orders:', error);
      toast.error('Error al cargar pedidos');
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status: newStatus })
        .eq('id', orderId);

      if (error) throw error;
      
      toast.success('Estado actualizado');
      loadOrders();
      if (selectedOrder?.id === orderId) {
        setSelectedOrder({ ...selectedOrder, status: newStatus });
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error al actualizar');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-500/20 text-yellow-500';
      case 'confirmed': return 'bg-blue-500/20 text-blue-500';
      case 'delivered': return 'bg-green-500/20 text-green-500';
      case 'cancelled': return 'bg-red-500/20 text-red-500';
      default: return 'bg-gray-500/20 text-gray-500';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'pending': return 'Pendiente';
      case 'confirmed': return 'Confirmado';
      case 'delivered': return 'Entregado';
      case 'cancelled': return 'Cancelado';
      default: return status;
    }
  };

  const filteredOrders = filter === 'all' 
    ? orders 
    : orders.filter(o => o.status === filter);

  const stats = {
    total: orders.length,
    pending: orders.filter(o => o.status === 'pending').length,
    confirmed: orders.filter(o => o.status === 'confirmed').length,
    delivered: orders.filter(o => o.status === 'delivered').length,
    cancelled: orders.filter(o => o.status === 'cancelled').length,
    revenue: orders
      .filter(o => o.status !== 'cancelled')
      .reduce((acc, o) => acc + parseFloat(o.total), 0),
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-[var(--color-accent)] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <>
      <Toaster position="top-right" />
      
      <div className="min-h-screen bg-black pt-24 pb-20 px-4 md:px-6">
        <div className="container mx-auto max-w-7xl">
          {/* Header */}
          <div className="mb-8">
            <div className="flex gap-4 mb-4">
              <Link href="/">
                <button className="flex items-center gap-2 text-gray-400 hover:text-[var(--color-accent)] transition-colors">
                  <FaArrowLeft />
                  <span>Inicio</span>
                </button>
              </Link>
              <Link href="/admin/tienda">
                <button className="flex items-center gap-2 text-gray-400 hover:text-[var(--color-accent)] transition-colors">
                  <FaArrowLeft />
                  <span>Productos</span>
                </button>
              </Link>
            </div>

            <div className="flex items-center gap-3 mb-2">
              <FaShoppingCart className="text-4xl text-[var(--color-accent)]" />
              <h1 className="text-4xl md:text-5xl font-black text-white">
                GESTIÓN DE <span className="text-[var(--color-accent)]">PEDIDOS</span>
              </h1>
            </div>
            <p className="text-gray-400">
              {user?.email} • {stats.total} pedidos totales
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
            <div className="glass rounded-2xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <FaShoppingCart className="text-xl text-gray-400" />
                <span className="text-sm text-gray-400">Total</span>
              </div>
              <span className="text-3xl font-black text-white">{stats.total}</span>
            </div>

            <div className="glass rounded-2xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <FaClock className="text-xl text-yellow-500" />
                <span className="text-sm text-gray-400">Pendientes</span>
              </div>
              <span className="text-3xl font-black text-white">{stats.pending}</span>
            </div>

            <div className="glass rounded-2xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <FaCheck className="text-xl text-blue-500" />
                <span className="text-sm text-gray-400">Confirmados</span>
              </div>
              <span className="text-3xl font-black text-white">{stats.confirmed}</span>
            </div>

            <div className="glass rounded-2xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <FaTruck className="text-xl text-green-500" />
                <span className="text-sm text-gray-400">Entregados</span>
              </div>
              <span className="text-3xl font-black text-white">{stats.delivered}</span>
            </div>

            <div className="glass rounded-2xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <FaTimes className="text-xl text-red-500" />
                <span className="text-sm text-gray-400">Cancelados</span>
              </div>
              <span className="text-3xl font-black text-white">{stats.cancelled}</span>
            </div>

            <div className="glass rounded-2xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xl">€</span>
                <span className="text-sm text-gray-400">Ingresos</span>
              </div>
              <span className="text-2xl font-black text-[var(--color-accent)]">
                €{stats.revenue.toFixed(2)}
              </span>
            </div>
          </div>

          {/* Filtros */}
          <div className="flex flex-wrap gap-3 mb-6">
            {[
              { key: 'all', label: 'Todos', icon: FaShoppingCart },
              { key: 'pending', label: 'Pendientes', icon: FaClock },
              { key: 'confirmed', label: 'Confirmados', icon: FaCheck },
              { key: 'delivered', label: 'Entregados', icon: FaTruck },
              { key: 'cancelled', label: 'Cancelados', icon: FaTimes },
            ].map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => setFilter(key)}
                className={`
                  px-4 py-2 rounded-full font-semibold text-sm uppercase tracking-wider
                  transition-all duration-300 flex items-center gap-2
                  ${filter === key
                    ? 'bg-[var(--color-accent)] text-black'
                    : 'glass text-gray-400 hover:text-white hover:glass-accent'
                  }
                `}
              >
                <Icon />
                {label}
              </button>
            ))}
          </div>

          {/* Lista de pedidos */}
          {filteredOrders.length === 0 ? (
            <div className="text-center py-20">
              <FaShoppingCart className="text-6xl text-gray-700 mx-auto mb-4" />
              <p className="text-gray-500 text-xl">
                {filter === 'all' ? 'No hay pedidos' : `No hay pedidos ${getStatusText(filter).toLowerCase()}`}
              </p>
            </div>
          ) : (
            <div className="grid gap-4">
              {filteredOrders.map((order) => (
                <motion.div
                  key={order.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="glass rounded-2xl p-6"
                >
                  <div className="flex flex-col lg:flex-row justify-between gap-4">
                    {/* Info del pedido */}
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-3 mb-3">
                        <span className="text-sm text-gray-500 font-mono">
                          #{order.id.slice(0, 8).toUpperCase()}
                        </span>
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${getStatusColor(order.status)}`}>
                          {getStatusText(order.status)}
                        </span>
                        <span className="text-sm text-gray-500">
                          {new Date(order.created_at).toLocaleString('es-ES', {
                            dateStyle: 'short',
                            timeStyle: 'short'
                          })}
                        </span>
                      </div>

                      <div className="grid md:grid-cols-2 gap-4 mb-4">
                        <div>
                          <p className="text-sm text-gray-400 mb-1 flex items-center gap-2">
                            <FaUser className="text-[var(--color-accent)]" />
                            Cliente
                          </p>
                          <p className="text-white font-semibold">{order.customer_name}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-400 mb-1 flex items-center gap-2">
                            <FaEnvelope className="text-[var(--color-accent)]" />
                            Email
                          </p>
                          <p className="text-white">{order.customer_email}</p>
                        </div>
                        {order.customer_phone && (
                          <div>
                            <p className="text-sm text-gray-400 mb-1 flex items-center gap-2">
                              <FaPhone className="text-[var(--color-accent)]" />
                              Teléfono
                            </p>
                            <p className="text-white">{order.customer_phone}</p>
                          </div>
                        )}
                        {order.customer_address && (
                          <div>
                            <p className="text-sm text-gray-400 mb-1 flex items-center gap-2">
                              <FaMapMarkerAlt className="text-[var(--color-accent)]" />
                              Dirección
                            </p>
                            <p className="text-white text-sm line-clamp-2">{order.customer_address}</p>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-400">
                          {order.order_items?.length || 0} productos
                        </span>
                        <span className="text-2xl font-black text-[var(--color-accent)]">
                          €{parseFloat(order.total).toFixed(2)}
                        </span>
                      </div>
                    </div>

                    {/* Acciones */}
                    <div className="flex lg:flex-col gap-2">
                      <button
                        onClick={() => setSelectedOrder(order)}
                        className="flex-1 lg:flex-none px-4 py-2 glass-accent hover:bg-blue-500 rounded-lg transition-colors flex items-center justify-center gap-2"
                        title="Ver detalles"
                      >
                        <FaEye />
                        <span className="lg:hidden">Ver</span>
                      </button>

                      {order.status === 'pending' && (
                        <button
                          onClick={() => updateOrderStatus(order.id, 'confirmed')}
                          className="flex-1 lg:flex-none px-4 py-2 glass-accent hover:bg-blue-500 rounded-lg transition-colors flex items-center justify-center gap-2"
                          title="Confirmar"
                        >
                          <FaCheck />
                          <span className="lg:hidden">Confirmar</span>
                        </button>
                      )}

                      {order.status === 'confirmed' && (
                        <button
                          onClick={() => updateOrderStatus(order.id, 'delivered')}
                          className="flex-1 lg:flex-none px-4 py-2 glass-accent hover:bg-green-500 rounded-lg transition-colors flex items-center justify-center gap-2"
                          title="Marcar entregado"
                        >
                          <FaTruck />
                          <span className="lg:hidden">Entregado</span>
                        </button>
                      )}

                      {(order.status === 'pending' || order.status === 'confirmed') && (
                        <button
                          onClick={() => updateOrderStatus(order.id, 'cancelled')}
                          className="flex-1 lg:flex-none px-4 py-2 glass-accent hover:bg-red-500 rounded-lg transition-colors flex items-center justify-center gap-2"
                          title="Cancelar"
                        >
                          <FaTimes />
                          <span className="lg:hidden">Cancelar</span>
                        </button>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modal detalles del pedido */}
      {selectedOrder && (
        <OrderDetailsModal
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
          onStatusChange={(newStatus) => updateOrderStatus(selectedOrder.id, newStatus)}
        />
      )}
    </>
  );
}

// Modal de detalles del pedido
function OrderDetailsModal({ order, onClose, onStatusChange }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      onClick={onClose}
      className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
    >
      <motion.div
        initial={{ scale: 0.9 }}
        animate={{ scale: 1 }}
        onClick={(e) => e.stopPropagation()}
        className="glass-strong rounded-3xl max-w-3xl w-full max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="sticky top-0 glass-dark p-6 flex justify-between items-center border-b border-gray-800">
          <div>
            <h2 className="text-2xl font-black text-white">Detalles del Pedido</h2>
            <p className="text-sm text-gray-400 font-mono">#{order.id.slice(0, 8).toUpperCase()}</p>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full glass-accent hover:bg-red-500 transition-colors flex items-center justify-center"
          >
            <FaTimes />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Estado */}
          <div className="glass rounded-xl p-4">
            <p className="text-sm text-gray-400 mb-3">Estado del pedido:</p>
            <div className="flex flex-wrap gap-2">
              {['pending', 'confirmed', 'delivered', 'cancelled'].map((status) => (
                <button
                  key={status}
                  onClick={() => onStatusChange(status)}
                  disabled={order.status === status}
                  className={`
                    px-4 py-2 rounded-lg font-semibold text-sm uppercase transition-all
                    ${order.status === status
                      ? 'bg-[var(--color-accent)] text-black'
                      : 'glass-accent hover:bg-[var(--color-accent)] hover:text-black'
                    }
                    disabled:opacity-50 disabled:cursor-not-allowed
                  `}
                >
                  {status === 'pending' && <FaClock className="inline mr-2" />}
                  {status === 'confirmed' && <FaCheck className="inline mr-2" />}
                  {status === 'delivered' && <FaTruck className="inline mr-2" />}
                  {status === 'cancelled' && <FaTimes className="inline mr-2" />}
                  {status === 'pending' ? 'Pendiente' : status === 'confirmed' ? 'Confirmado' : status === 'delivered' ? 'Entregado' : 'Cancelado'}
                </button>
              ))}
            </div>
          </div>

          {/* Información del cliente */}
          <div className="glass rounded-xl p-4">
            <h3 className="text-lg font-bold text-white mb-4">Información del Cliente</h3>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <FaUser className="text-[var(--color-accent)] mt-1 flex-shrink-0" />
                <div>
                  <p className="text-sm text-gray-400">Nombre</p>
                  <p className="text-white font-semibold">{order.customer_name}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <FaEnvelope className="text-[var(--color-accent)] mt-1 flex-shrink-0" />
                <div>
                  <p className="text-sm text-gray-400">Email</p>
                  <p className="text-white">{order.customer_email}</p>
                </div>
              </div>
              {order.customer_phone && (
                <div className="flex items-start gap-3">
                  <FaPhone className="text-[var(--color-accent)] mt-1 flex-shrink-0" />
                  <div>
                    <p className="text-sm text-gray-400">Teléfono</p>
                    <p className="text-white">{order.customer_phone}</p>
                  </div>
                </div>
              )}
              {order.customer_address && (
                <div className="flex items-start gap-3">
                  <FaMapMarkerAlt className="text-[var(--color-accent)] mt-1 flex-shrink-0" />
                  <div>
                    <p className="text-sm text-gray-400">Dirección de envío</p>
                    <p className="text-white">{order.customer_address}</p>
                  </div>
                </div>
              )}
              {order.notes && (
                <div className="flex items-start gap-3">
                  <span className="text-[var(--color-accent)] mt-1">💬</span>
                  <div>
                    <p className="text-sm text-gray-400">Notas</p>
                    <p className="text-white">{order.notes}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Productos */}
          <div className="glass rounded-xl p-4">
            <h3 className="text-lg font-bold text-white mb-4">Productos ({order.order_items?.length || 0})</h3>
            <div className="space-y-3">
              {order.order_items?.map((item, index) => (
                <div key={index} className="flex justify-between items-center p-3 glass-accent rounded-lg">
                  <div>
                    <p className="text-white font-semibold">{item.product_name}</p>
                    <p className="text-sm text-gray-400">
                      €{parseFloat(item.product_price).toFixed(2)} x {item.quantity}
                    </p>
                  </div>
                  <span className="text-lg font-bold text-[var(--color-accent)]">
                    €{parseFloat(item.subtotal).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Total */}
          <div className="glass-accent rounded-xl p-6">
            <div className="flex justify-between items-center">
              <span className="text-xl text-white font-bold">TOTAL:</span>
              <span className="text-4xl font-black text-[var(--color-accent)]">
                €{parseFloat(order.total).toFixed(2)}
              </span>
            </div>
          </div>

          {/* Fecha */}
          <div className="text-center text-sm text-gray-500">
            Pedido realizado el {new Date(order.created_at).toLocaleString('es-ES', {
              dateStyle: 'full',
              timeStyle: 'short'
            })}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
