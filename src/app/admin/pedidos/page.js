'use client';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import CustomCursor from '@/components/CustomCursor';
import { Toaster, toast } from 'react-hot-toast';
import {
  FaBox,
  FaChevronDown,
  FaChevronUp,
  FaUser,
  FaEnvelope,
  FaPhone,
  FaMapMarkerAlt,
  FaCalendar,
  FaShoppingCart,
  FaCheckCircle,
  FaClock,
  FaTimes,
  FaFilter
} from 'react-icons/fa';

export default function AdminPedidosPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [expandedOrder, setExpandedOrder] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const router = useRouter();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      router.push('/login');
    } else {
      setUser(user);
      loadOrders();
    }
  };

  const loadOrders = async () => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
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
    } catch (error) {
      console.error('Error updating order:', error);
      toast.error('Error al actualizar estado');
    }
  };

  const getStatusConfig = (status) => {
    const configs = {
      pending: {
        color: 'bg-yellow-500',
        icon: FaClock,
        label: 'Pendiente',
        textColor: 'text-yellow-500'
      },
      completed: {
        color: 'bg-green-500',
        icon: FaCheckCircle,
        label: 'Completado',
        textColor: 'text-green-500'
      },
      cancelled: {
        color: 'bg-red-500',
        icon: FaTimes,
        label: 'Cancelado',
        textColor: 'text-red-500'
      }
    };
    return configs[status] || configs.pending;
  };

  const filteredOrders = filterStatus === 'all' 
    ? orders 
    : orders.filter(order => order.status === filterStatus);

  const stats = {
    total: orders.length,
    pending: orders.filter(o => o.status === 'pending').length,
    completed: orders.filter(o => o.status === 'completed').length,
    cancelled: orders.filter(o => o.status === 'cancelled').length,
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-[var(--color-accent)] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <>
      <CustomCursor />
      <Header />
      <Toaster position="top-right" />

      <div className="min-h-screen bg-black pt-24 pb-20 px-4 md:px-6">
        <div className="container mx-auto max-w-7xl">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-12"
          >
            <div className="flex items-center gap-3 mb-4">
              <FaBox className="text-4xl text-[var(--color-accent)]" />
              <h1 className="text-5xl md:text-7xl font-black text-white">
                PEDIDOS <span className="text-[var(--color-accent)]">ADMIN</span>
              </h1>
            </div>
            <p className="text-gray-400 text-lg md:text-xl">
              Gestiona todos los pedidos realizados en la tienda
            </p>
          </motion.div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="glass rounded-2xl p-5 text-center"
            >
              <div className="text-4xl font-black text-white mb-2">{stats.total}</div>
              <div className="text-sm text-gray-400 uppercase tracking-wider">Total</div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 }}
              className="glass rounded-2xl p-5 text-center"
            >
              <div className="text-4xl font-black text-yellow-500 mb-2">{stats.pending}</div>
              <div className="text-sm text-gray-400 uppercase tracking-wider">Pendientes</div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="glass rounded-2xl p-5 text-center"
            >
              <div className="text-4xl font-black text-green-500 mb-2">{stats.completed}</div>
              <div className="text-sm text-gray-400 uppercase tracking-wider">Completados</div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
              className="glass rounded-2xl p-5 text-center"
            >
              <div className="text-4xl font-black text-red-500 mb-2">{stats.cancelled}</div>
              <div className="text-sm text-gray-400 uppercase tracking-wider">Cancelados</div>
            </motion.div>
          </div>

          {/* Filtros */}
          <div className="flex items-center gap-3 mb-8">
            <FaFilter className="text-[var(--color-accent)]" />
            <span className="text-gray-400 font-semibold">Filtrar:</span>
            {['all', 'pending', 'completed', 'cancelled'].map((status) => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`px-4 py-2 rounded-xl font-semibold text-sm uppercase transition-all ${
                  filterStatus === status
                    ? 'bg-[var(--color-accent)] text-black'
                    : 'glass text-gray-400 hover:text-white'
                }`}
              >
                {status === 'all' ? 'Todos' : getStatusConfig(status).label}
              </button>
            ))}
          </div>

          {/* Lista de pedidos */}
          {loading ? (
            <div className="flex justify-center py-20">
              <div className="w-16 h-16 border-4 border-[var(--color-accent)] border-t-transparent rounded-full animate-spin" />
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="text-center py-20">
              <FaBox className="text-6xl text-gray-700 mx-auto mb-4" />
              <p className="text-gray-500 text-xl">
                {orders.length === 0 ? 'No hay pedidos registrados' : 'No hay pedidos en este filtro'}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredOrders.map((order) => (
                <OrderCard
                  key={order.id}
                  order={order}
                  isExpanded={expandedOrder === order.id}
                  onToggle={() => setExpandedOrder(expandedOrder === order.id ? null : order.id)}
                  onUpdateStatus={updateOrderStatus}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

// Componente para cada tarjeta de pedido
function OrderCard({ order, isExpanded, onToggle, onUpdateStatus }) {
  const statusConfig = getStatusConfig(order.status);
  const StatusIcon = statusConfig.icon;

  const groupedItems = order.items.reduce((acc, item) => {
    const existing = acc.find(i => i.id === item.id);
    if (existing) {
      existing.quantity++;
    } else {
      acc.push({ ...item, quantity: 1 });
    }
    return acc;
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass rounded-2xl overflow-hidden hover:glass-accent transition-all duration-300"
    >
      {/* Header del pedido */}
      <div
        onClick={onToggle}
        className="p-5 cursor-pointer flex items-center justify-between hover:bg-white/5 transition-colors"
      >
        <div className="flex items-center gap-4 flex-1">
          {/* Estado */}
          <div className={`w-3 h-3 rounded-full ${statusConfig.color} animate-pulse`} />

          {/* Info básica */}
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-1">
              <h3 className="text-xl font-bold text-white">
                Pedido #{order.id.slice(0, 8)}
              </h3>
              <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${statusConfig.color} text-white`}>
                <StatusIcon className="inline mr-1" />
                {statusConfig.label}
              </span>
            </div>
            <div className="flex items-center gap-4 text-sm text-gray-400">
              <span className="flex items-center gap-1">
                <FaUser className="text-[var(--color-accent)]" />
                {order.customer_name}
              </span>
              <span className="flex items-center gap-1">
                <FaCalendar className="text-[var(--color-accent)]" />
                {new Date(order.created_at).toLocaleDateString('es-ES')}
              </span>
              <span className="flex items-center gap-1">
                <FaShoppingCart className="text-[var(--color-accent)]" />
                {order.items.length} productos
              </span>
            </div>
          </div>

          {/* Total */}
          <div className="text-right">
            <div className="text-3xl font-black text-[var(--color-accent)]">
              €{order.total}
            </div>
          </div>

          {/* Toggle */}
          <motion.div
            animate={{ rotate: isExpanded ? 180 : 0 }}
            className="text-white text-2xl"
          >
            <FaChevronDown />
          </motion.div>
        </div>
      </div>

      {/* Detalles expandibles */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-t border-gray-800"
          >
            <div className="p-5 space-y-6">
              {/* Información del cliente */}
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <h4 className="text-lg font-bold text-[var(--color-accent)] mb-3">
                    Datos del Cliente
                  </h4>
                  <div className="flex items-center gap-2 text-gray-300">
                    <FaUser className="text-[var(--color-accent)]" />
                    <span>{order.customer_name}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-300">
                    <FaEnvelope className="text-[var(--color-accent)]" />
                    <span>{order.customer_email}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-300">
                    <FaPhone className="text-[var(--color-accent)]" />
                    <span>{order.customer_phone}</span>
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="text-lg font-bold text-[var(--color-accent)] mb-3">
                    Dirección de Envío
                  </h4>
                  <div className="flex items-start gap-2 text-gray-300">
                    <FaMapMarkerAlt className="text-[var(--color-accent)] mt-1" />
                    <span>{order.shipping_address}</span>
                  </div>
                  {order.notes && (
                    <div className="mt-3 p-3 bg-[#1A1F2E] rounded-lg">
                      <p className="text-sm text-gray-400 italic">"{order.notes}"</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Productos */}
              <div>
                <h4 className="text-lg font-bold text-[var(--color-accent)] mb-3">
                  Productos del Pedido
                </h4>
                <div className="space-y-2">
                  {groupedItems.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between p-3 bg-[#1A1F2E] rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        {item.image && (
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-12 h-12 object-cover rounded-lg"
                          />
                        )}
                        <div>
                          <p className="text-white font-semibold">{item.name}</p>
                          <p className="text-sm text-gray-400">Cantidad: {item.quantity}</p>
                        </div>
                      </div>
                      <div className="text-[var(--color-accent)] font-bold">
                        €{(item.price * item.quantity).toFixed(2)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Cambiar estado */}
              <div>
                <h4 className="text-lg font-bold text-[var(--color-accent)] mb-3">
                  Cambiar Estado
                </h4>
                <div className="flex gap-3">
                  <button
                    onClick={() => onUpdateStatus(order.id, 'pending')}
                    disabled={order.status === 'pending'}
                    className="flex-1 px-4 py-3 rounded-xl font-bold bg-yellow-500/20 text-yellow-500 hover:bg-yellow-500 hover:text-black transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    <FaClock className="inline mr-2" />
                    Pendiente
                  </button>
                  <button
                    onClick={() => onUpdateStatus(order.id, 'completed')}
                    disabled={order.status === 'completed'}
                    className="flex-1 px-4 py-3 rounded-xl font-bold bg-green-500/20 text-green-500 hover:bg-green-500 hover:text-black transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    <FaCheckCircle className="inline mr-2" />
                    Completado
                  </button>
                  <button
                    onClick={() => onUpdateStatus(order.id, 'cancelled')}
                    disabled={order.status === 'cancelled'}
                    className="flex-1 px-4 py-3 rounded-xl font-bold bg-red-500/20 text-red-500 hover:bg-red-500 hover:text-black transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    <FaTimes className="inline mr-2" />
                    Cancelado
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function getStatusConfig(status) {
  const configs = {
    pending: {
      color: 'bg-yellow-500',
      icon: FaClock,
      label: 'Pendiente',
      textColor: 'text-yellow-500'
    },
    completed: {
      color: 'bg-green-500',
      icon: FaCheckCircle,
      label: 'Completado',
      textColor: 'text-green-500'
    },
    cancelled: {
      color: 'bg-red-500',
      icon: FaTimes,
      label: 'Cancelado',
      textColor: 'text-red-500'
    }
  };
  return configs[status] || configs.pending;
}
