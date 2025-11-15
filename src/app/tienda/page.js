'use client';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import ProductGrid from '@/components/shop/ProductGrid';
import CartButton from '@/components/shop/CartButton';
import CartSidebar from '@/components/shop/CartSidebar';
import Header from '@/components/Header';
import CustomCursor from '@/components/CustomCursor';
import { Toaster, toast } from 'react-hot-toast';
import { FaStore, FaPlus, FaTimes, FaUpload, FaLink } from 'react-icons/fa';

export default function TiendaPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [user, setUser] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  useEffect(() => {
    checkUser();
    loadProducts();
  }, []);

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setUser(user);
  };

  const loadProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('available', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      console.error('Error loading products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
  };

  const handleDelete = async (product) => {
    if (!confirm(`¿Eliminar "${product.name}"?`)) return;

    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', product.id);

      if (error) throw error;

      toast.success('Producto eliminado');
      loadProducts();
    } catch (error) {
      console.error('Error deleting product:', error);
      toast.error('Error al eliminar producto');
    }
  };

  const categories = ['all', ...new Set(products.map(p => p.category))];
  const filteredProducts = selectedCategory === 'all' 
    ? products 
    : products.filter(p => p.category === selectedCategory);

  return (
    <>
      <CustomCursor />
      <Header />
      <Toaster position="top-right" />
      <CartButton />
      <CartSidebar />
      
      <div className="min-h-screen bg-black pt-24 pb-20 px-4 md:px-6">
        <div className="container mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-12"
          >
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
              <div className="flex items-center gap-3">
                <FaStore className="text-4xl text-[var(--color-accent)]" />
                <h1 className="text-5xl md:text-7xl font-black text-white">
                  TIENDA <span className="text-[var(--color-accent)]">DEMO</span>
                </h1>
              </div>
              
              {user && (
                <button
                  onClick={() => setShowAddModal(true)}
                  className="flex items-center gap-2 px-6 py-3 bg-[var(--color-accent)] text-black font-bold rounded-xl hover:bg-white transition-all duration-300 hover:scale-105"
                >
                  <FaPlus />
                  <span>Añadir Producto</span>
                </button>
              )}
            </div>
            
            <p className="text-gray-400 text-lg md:text-xl max-w-3xl">
              Ejemplo de e-commerce funcional. Sistema completo de gestión de productos y pedidos.
            </p>
          </motion.div>

          {/* Filtros */}
          {categories.length > 1 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="mb-8 flex flex-wrap gap-3"
            >
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-6 py-3 rounded-full font-semibold text-sm uppercase tracking-wider transition-all duration-300 ${
                    selectedCategory === category
                      ? 'bg-[var(--color-accent)] text-black'
                      : 'glass text-gray-400 hover:text-white hover:glass-accent'
                  }`}
                >
                  {category === 'all' ? 'Todos' : category}
                </button>
              ))}
            </motion.div>
          )}

          {/* Grid productos */}
          {loading ? (
            <div className="flex justify-center items-center py-20">
              <div className="w-16 h-16 border-4 border-[var(--color-accent)] border-t-transparent rounded-full animate-spin" />
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="text-center py-20">
              <FaStore className="text-6xl text-gray-700 mx-auto mb-4" />
              <p className="text-gray-500 text-xl mb-6">
                {products.length === 0 ? 'No hay productos disponibles' : 'No hay productos en esta categoría'}
              </p>
              {products.length === 0 && user && (
                <button
                  onClick={() => setShowAddModal(true)}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-[var(--color-accent)] text-black font-bold rounded-xl hover:bg-white transition-colors"
                >
                  <FaPlus />
                  <span>Añadir Primer Producto</span>
                </button>
              )}
            </div>
          ) : (
            <ProductGrid
              products={filteredProducts}
              isAdmin={!!user}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          )}
        </div>
      </div>

      {showAddModal && (
        <ProductFormModal
          onClose={() => setShowAddModal(false)}
          onSuccess={() => {
            setShowAddModal(false);
            loadProducts();
          }}
        />
      )}

      {editingProduct && (
        <ProductFormModal
          product={editingProduct}
          onClose={() => setEditingProduct(null)}
          onSuccess={() => {
            setEditingProduct(null);
            loadProducts();
          }}
        />
      )}
    </>
  );
}

// Modal unificado para crear/editar productos
function ProductFormModal({ product, onClose, onSuccess }) {
  const isEditing = !!product;
  const [loading, setLoading] = useState(false);
  const [uploadMethod, setUploadMethod] = useState('url');
  const [formData, setFormData] = useState({
    name: product?.name || '',
    description: product?.description || '',
    price: product?.price || '',
    image: product?.image || '',
    category: product?.category || '',
    stock: product?.stock || 100,
    available: product?.available ?? true,
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(product?.image || '');

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Solo se permiten imágenes');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('La imagen no puede superar 5MB');
      return;
    }

    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const uploadImageToSupabase = async (file) => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
      const filePath = `products/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('product-images')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('product-images')
        .getPublicUrl(filePath);

      return publicUrl;
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error('Error al subir imagen: ' + error.message);
      throw error;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      let imageUrl = formData.image;

      if (uploadMethod === 'upload' && imageFile) {
        imageUrl = await uploadImageToSupabase(imageFile);
      }

      if (!imageUrl) {
        toast.error('Debes proporcionar una imagen');
        setLoading(false);
        return;
      }

      const productData = {
        name: formData.name,
        description: formData.description,
        price: parseFloat(formData.price),
        image: imageUrl,
        category: formData.category || 'General',
        stock: parseInt(formData.stock),
        available: formData.available,
      };

      if (isEditing) {
        const { error } = await supabase
          .from('products')
          .update(productData)
          .eq('id', product.id);

        if (error) throw error;
        toast.success('✅ Producto actualizado');
      } else {
        const { error } = await supabase
          .from('products')
          .insert([productData]);

        if (error) throw error;
        toast.success('✅ Producto creado');
      }

      onSuccess();
    } catch (error) {
      console.error('Error saving product:', error);
      toast.error('❌ Error al guardar el producto');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-[#0A0F1C] border-2 border-[var(--color-accent)] rounded-3xl w-full max-w-2xl max-h-[85vh] overflow-hidden flex flex-col shadow-2xl"
        >
          {/* Header */}
          <div className="bg-[#050A14] p-4 flex justify-between items-center border-b border-[var(--color-accent)]/30 flex-shrink-0">
            <h2 className="text-2xl font-black text-[var(--color-accent)]">
              {isEditing ? 'Editar Producto' : 'Nuevo Producto'}
            </h2>
            <button
              onClick={onClose}
              className="w-10 h-10 rounded-full bg-[#1A1F2E] hover:bg-red-500 transition-colors flex items-center justify-center text-white"
            >
              <FaTimes />
            </button>
          </div>

          {/* Contenido con scroll */}
          <div className="overflow-y-auto flex-1 p-6 bg-[#0A0F1C]">
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Método de imagen */}
              <div>
                <label className="text-sm font-bold text-[var(--color-accent)] mb-3 block">
                  📷 Método de Imagen *
                </label>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setUploadMethod('url')}
                    className={`flex-1 px-4 py-3 rounded-xl text-sm font-bold transition-all border-2 ${
                      uploadMethod === 'url'
                        ? 'bg-[var(--color-accent)] text-black border-[var(--color-accent)]'
                        : 'bg-[#1A1F2E] text-gray-400 border-gray-700 hover:border-[var(--color-accent)]'
                    }`}
                  >
                    <FaLink className="inline mr-2" /> URL
                  </button>
                  <button
                    type="button"
                    onClick={() => setUploadMethod('upload')}
                    className={`flex-1 px-4 py-3 rounded-xl text-sm font-bold transition-all border-2 ${
                      uploadMethod === 'upload'
                        ? 'bg-[var(--color-accent)] text-black border-[var(--color-accent)]'
                        : 'bg-[#1A1F2E] text-gray-400 border-gray-700 hover:border-[var(--color-accent)]'
                    }`}
                  >
                    <FaUpload className="inline mr-2" /> Subir
                  </button>
                </div>
              </div>

              {/* Input de imagen */}
              {uploadMethod === 'url' ? (
                <div>
                  <label className="text-sm font-bold text-[var(--color-accent)] mb-2 block">
                    URL de la Imagen *
                  </label>
                  <input
                    type="url"
                    required
                    value={formData.image}
                    onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                    className="w-full px-4 py-3 bg-[#1A1F2E] border-2 border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-[var(--color-accent)] transition-colors"
                    placeholder="https://ejemplo.com/imagen.jpg"
                  />
                </div>
              ) : (
                <div>
                  <label className="text-sm font-bold text-[var(--color-accent)] mb-2 block">
                    Subir Imagen {!isEditing && '*'}
                  </label>
                  <label className="cursor-pointer block w-full px-4 py-8 bg-[#1A1F2E] rounded-xl border-2 border-dashed border-gray-700 hover:border-[var(--color-accent)] transition-colors text-center">
                    <FaUpload className="text-4xl text-gray-600 mx-auto mb-3" />
                    <p className="text-gray-400 font-semibold mb-1">
                      {imageFile ? imageFile.name : 'Click para seleccionar imagen'}
                    </p>
                    <p className="text-xs text-gray-600">PNG, JPG, WEBP (máx 5MB)</p>
                    <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                  </label>
                  {imagePreview && (
                    <img 
                      src={imagePreview} 
                      alt="Preview" 
                      className="mt-4 w-full h-40 object-cover rounded-xl border-2 border-[var(--color-accent)]" 
                    />
                  )}
                </div>
              )}

              {/* Nombre */}
              <div>
                <label className="text-sm font-bold text-[var(--color-accent)] mb-2 block">
                  🏷️ Nombre *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-3 bg-[#1A1F2E] border-2 border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-[var(--color-accent)] transition-colors"
                  placeholder="Ej: MacBook Pro M3"
                />
              </div>

              {/* Descripción */}
              <div>
                <label className="text-sm font-bold text-[var(--color-accent)] mb-2 block">
                  📝 Descripción
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-3 bg-[#1A1F2E] border-2 border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-[var(--color-accent)] resize-none transition-colors"
                  placeholder="Descripción breve del producto"
                />
              </div>

              {/* Precio y Stock */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-bold text-[var(--color-accent)] mb-2 block">
                    💰 Precio (€) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    className="w-full px-4 py-3 bg-[#1A1F2E] border-2 border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-[var(--color-accent)] transition-colors"
                    placeholder="19.99"
                  />
                </div>
                <div>
                  <label className="text-sm font-bold text-[var(--color-accent)] mb-2 block">
                    📦 Stock
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                    className="w-full px-4 py-3 bg-[#1A1F2E] border-2 border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-[var(--color-accent)] transition-colors"
                    placeholder="100"
                  />
                </div>
              </div>

              {/* Categoría */}
              <div>
                <label className="text-sm font-bold text-[var(--color-accent)] mb-2 block">
                  🏪 Categoría
                </label>
                <input
                  type="text"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-4 py-3 bg-[#1A1F2E] border-2 border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-[var(--color-accent)] transition-colors"
                  placeholder="Ej: Electrónica, Ropa, Audio..."
                />
              </div>

              {/* Disponible */}
              <div className="flex items-center gap-3 p-4 bg-[#1A1F2E] rounded-xl border-2 border-gray-700">
                <input
                  type="checkbox"
                  id="available"
                  checked={formData.available}
                  onChange={(e) => setFormData({ ...formData, available: e.target.checked })}
                  className="w-6 h-6 rounded accent-[var(--color-accent)]"
                />
                <label htmlFor="available" className="text-white font-semibold">
                  👁️ Producto visible en tienda pública
                </label>
              </div>

              {/* Botón */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-[var(--color-accent)] text-black font-black text-lg rounded-xl hover:bg-white transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-[var(--color-accent)]/50"
              >
                {loading ? (
                  <>
                    <div className="w-6 h-6 border-3 border-black border-t-transparent rounded-full animate-spin" />
                    <span>{isEditing ? 'Actualizando...' : 'Creando...'}</span>
                  </>
                ) : (
                  <>
                    <FaPlus className="text-xl" />
                    <span>{isEditing ? 'ACTUALIZAR PRODUCTO' : 'CREAR PRODUCTO'}</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
