'use client';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { 
  FaStore, 
  FaPlus, 
  FaEdit, 
  FaTrash, 
  FaEye, 
  FaEyeSlash,
  FaBox,
  FaShoppingCart,
  FaArrowLeft
} from 'react-icons/fa';
import { Toaster, toast } from 'react-hot-toast';
import Link from 'next/link';

export default function AdminTiendaPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

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
    loadProducts();
  };

  const loadProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      console.error('Error loading products:', error);
      toast.error('Error al cargar productos');
    } finally {
      setLoading(false);
    }
  };

  const toggleAvailability = async (productId, currentStatus) => {
    try {
      const { error } = await supabase
        .from('products')
        .update({ available: !currentStatus })
        .eq('id', productId);

      if (error) throw error;
      
      toast.success(currentStatus ? 'Producto ocultado' : 'Producto visible');
      loadProducts();
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error al actualizar');
    }
  };

  const deleteProduct = async (productId) => {
    if (!confirm('¿Eliminar este producto?')) return;

    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', productId);

      if (error) throw error;
      
      toast.success('Producto eliminado');
      loadProducts();
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error al eliminar');
    }
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
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
            <div>
              <Link href="/">
                <button className="flex items-center gap-2 text-gray-400 hover:text-[var(--color-accent)] transition-colors mb-4">
                  <FaArrowLeft />
                  <span>Volver al inicio</span>
                </button>
              </Link>
              <div className="flex items-center gap-3 mb-2">
                <FaStore className="text-4xl text-[var(--color-accent)]" />
                <h1 className="text-4xl md:text-5xl font-black text-white">
                  GESTIÓN DE <span className="text-[var(--color-accent)]">TIENDA</span>
                </h1>
              </div>
              <p className="text-gray-400">
                {user?.email} • {products.length} productos
              </p>
            </div>

            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-2 px-6 py-3 bg-[var(--color-accent)] text-black font-bold rounded-xl hover:bg-white transition-all duration-300"
            >
              <FaPlus />
              <span>Añadir Producto</span>
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            <div className="glass rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-2">
                <FaBox className="text-2xl text-[var(--color-accent)]" />
                <span className="text-gray-400">Total Productos</span>
              </div>
              <span className="text-4xl font-black text-white">{products.length}</span>
            </div>

            <div className="glass rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-2">
                <FaEye className="text-2xl text-green-500" />
                <span className="text-gray-400">Disponibles</span>
              </div>
              <span className="text-4xl font-black text-white">
                {products.filter(p => p.available).length}
              </span>
            </div>

            <div className="glass rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-2">
                <FaShoppingCart className="text-2xl text-blue-500" />
                <span className="text-gray-400">Stock Total</span>
              </div>
              <span className="text-4xl font-black text-white">
                {products.reduce((acc, p) => acc + p.stock, 0)}
              </span>
            </div>
          </div>

          {/* Lista de productos */}
          {products.length === 0 ? (
            <div className="text-center py-20">
              <FaStore className="text-6xl text-gray-700 mx-auto mb-4" />
              <p className="text-gray-500 text-xl mb-6">No hay productos</p>
              <button
                onClick={() => setShowAddModal(true)}
                className="px-6 py-3 bg-[var(--color-accent)] text-black font-bold rounded-xl hover:bg-white transition-colors"
              >
                Añadir Primer Producto
              </button>
            </div>
          ) : (
            <div className="grid gap-4">
              {products.map((product) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="glass rounded-2xl p-6 flex flex-col md:flex-row gap-6"
                >
                  {/* Imagen */}
                  <div className="w-full md:w-32 h-32 rounded-xl overflow-hidden bg-gray-900 flex-shrink-0">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Info */}
                  <div className="flex-1">
                    <div className="flex items-start justify-between gap-4 mb-2">
                      <div>
                        <span className="text-xs text-[var(--color-accent)] font-semibold uppercase">
                          {product.category}
                        </span>
                        <h3 className="text-xl font-bold text-white mt-1">
                          {product.name}
                        </h3>
                      </div>
                      <span className="text-2xl font-black text-[var(--color-accent)]">
                        €{product.price.toFixed(2)}
                      </span>
                    </div>

                    <p className="text-gray-400 text-sm mb-4 line-clamp-2">
                      {product.description}
                    </p>

                    <div className="flex flex-wrap items-center gap-3">
                      {/* Stock */}
                      <span className={`
                        px-3 py-1 rounded-full text-xs font-bold
                        ${product.stock > 10 
                          ? 'bg-green-500/20 text-green-500' 
                          : product.stock > 0 
                            ? 'bg-orange-500/20 text-orange-500'
                            : 'bg-red-500/20 text-red-500'
                        }
                      `}>
                        Stock: {product.stock}
                      </span>

                      {/* Estado */}
                      <span className={`
                        px-3 py-1 rounded-full text-xs font-bold
                        ${product.available 
                          ? 'bg-green-500/20 text-green-500' 
                          : 'bg-gray-500/20 text-gray-500'
                        }
                      `}>
                        {product.available ? 'Visible' : 'Oculto'}
                      </span>

                      <span className="text-xs text-gray-500">
                        Creado: {new Date(product.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  {/* Acciones */}
                  <div className="flex md:flex-col gap-2">
                    <button
                      onClick={() => toggleAvailability(product.id, product.available)}
                      className="flex-1 md:flex-none px-4 py-2 glass-accent hover:bg-blue-500 rounded-lg transition-colors flex items-center justify-center gap-2"
                      title={product.available ? 'Ocultar' : 'Mostrar'}
                    >
                      {product.available ? <FaEyeSlash /> : <FaEye />}
                    </button>

                    <button
                      onClick={() => setEditingProduct(product)}
                      className="flex-1 md:flex-none px-4 py-2 glass-accent hover:bg-[var(--color-accent)] hover:text-black rounded-lg transition-colors flex items-center justify-center gap-2"
                      title="Editar"
                    >
                      <FaEdit />
                    </button>

                    <button
                      onClick={() => deleteProduct(product.id)}
                      className="flex-1 md:flex-none px-4 py-2 glass-accent hover:bg-red-500 rounded-lg transition-colors flex items-center justify-center gap-2"
                      title="Eliminar"
                    >
                      <FaTrash />
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modal Añadir/Editar */}
      {(showAddModal || editingProduct) && (
        <ProductFormModal
          product={editingProduct}
          onClose={() => {
            setShowAddModal(false);
            setEditingProduct(null);
          }}
          onSuccess={() => {
            setShowAddModal(false);
            setEditingProduct(null);
            loadProducts();
          }}
        />
      )}
    </>
  );
}

// Modal para añadir/editar producto
function ProductFormModal({ product, onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    name: product?.name || '',
    description: product?.description || '',
    price: product?.price || '',
    image: product?.image || '',
    category: product?.category || 'general',
    stock: product?.stock || 100,
    available: product?.available ?? true,
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (product) {
        // Editar
        const { error } = await supabase
          .from('products')
          .update(formData)
          .eq('id', product.id);

        if (error) throw error;
        toast.success('Producto actualizado');
      } else {
        // Crear
        const { error } = await supabase
          .from('products')
          .insert([formData]);

        if (error) throw error;
        toast.success('Producto creado');
      }

      onSuccess();
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error al guardar producto');
    } finally {
      setLoading(false);
    }
  };

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
        className="glass-strong rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
      >
        <div className="sticky top-0 glass-dark p-6 flex justify-between items-center border-b border-gray-800">
          <h2 className="text-2xl font-black text-white">
            {product ? 'Editar Producto' : 'Nuevo Producto'}
          </h2>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full glass-accent hover:bg-red-500 transition-colors flex items-center justify-center"
          >
            <FaTimes />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="text-sm text-gray-400 mb-2 block">Nombre *</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-3 glass rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
              placeholder="Nombre del producto"
            />
          </div>

          <div>
            <label className="text-sm text-gray-400 mb-2 block">Descripción</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              className="w-full px-4 py-3 glass rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] resize-none"
              placeholder="Descripción del producto"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-gray-400 mb-2 block">Precio (€) *</label>
              <input
                type="number"
                step="0.01"
                required
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
                className="w-full px-4 py-3 glass rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
                placeholder="19.99"
              />
            </div>

            <div>
              <label className="text-sm text-gray-400 mb-2 block">Stock</label>
              <input
                type="number"
                value={formData.stock}
                onChange={(e) => setFormData({ ...formData, stock: parseInt(e.target.value) })}
                className="w-full px-4 py-3 glass rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
                placeholder="100"
              />
            </div>
          </div>

          <div>
            <label className="text-sm text-gray-400 mb-2 block">URL de imagen *</label>
            <input
              type="url"
              required
              value={formData.image}
              onChange={(e) => setFormData({ ...formData, image: e.target.value })}
              className="w-full px-4 py-3 glass rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
              placeholder="https://..."
            />
          </div>

          <div>
            <label className="text-sm text-gray-400 mb-2 block">Categoría</label>
            <input
              type="text"
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full px-4 py-3 glass rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
              placeholder="Electrónica, Ropa, etc."
            />
          </div>

          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="available"
              checked={formData.available}
              onChange={(e) => setFormData({ ...formData, available: e.target.checked })}
              className="w-5 h-5 rounded"
            />
            <label htmlFor="available" className="text-white font-semibold">
              Producto visible en tienda
            </label>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-[var(--color-accent)] text-black font-bold text-lg rounded-xl hover:bg-white transition-colors disabled:opacity-50"
          >
            {loading ? 'Guardando...' : product ? 'Actualizar Producto' : 'Crear Producto'}
          </button>
        </form>
      </motion.div>
    </motion.div>
  );
}
