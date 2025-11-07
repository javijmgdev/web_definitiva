'use client';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { FaTrash, FaSpinner, FaEdit, FaStar, FaHome, FaCamera, FaImages } from 'react-icons/fa';
import { supabase } from '@/lib/supabase';
import PhotoModal from '@/components/PhotoModal';
import EditPhotoModal from '@/components/EditPhotoModal';
import CustomCursor from '@/components/CustomCursor';
import AdminPanel from '@/components/AdminPanel';
import Link from 'next/link';

export default function AlbumPage() {
  const [ref, inView] = useInView({
    triggerOnce: false,
    threshold: 0.1,
  });

  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [albumPhotos, setAlbumPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  // Verificar usuario autenticado
  useEffect(() => {
    checkUser();

    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user || null);
    });

    return () => {
      authListener?.subscription?.unsubscribe();
    };
  }, []);

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setUser(user);
  };

  // Cargar fotos
  useEffect(() => {
    loadPhotos();

    const subscription = supabase
      .channel('photos_changes_album')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'photos' }, () => {
        loadPhotos();
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const loadPhotos = async () => {
    try {
      const { data, error } = await supabase
        .from('photos')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAlbumPhotos(data || []);
    } catch (error) {
      console.error('Error cargando fotos:', error);
    } finally {
      setLoading(false);
    }
  };

  const deletePhoto = async (photoId) => {
    if (!user) {
      alert('Debes iniciar sesión para eliminar fotos');
      return;
    }

    if (!confirm('¿Estás seguro de que quieres eliminar esta foto del álbum? Se borrará permanentemente.')) return;

    try {
      const { error } = await supabase
        .from('photos')
        .delete()
        .eq('id', photoId);

      if (error) throw error;
      
      setAlbumPhotos(albumPhotos.filter(photo => photo.id !== photoId));
    } catch (error) {
      console.error('Error eliminando foto:', error);
      alert('Error al eliminar la foto.');
    }
  };

  const openModal = (photo) => {
    setSelectedPhoto(photo);
    setIsModalOpen(true);
  };

  const openEditModal = (photo) => {
    setSelectedPhoto(photo);
    setIsEditModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setIsEditModalOpen(false);
    setTimeout(() => setSelectedPhoto(null), 300);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30, scale: 0.95 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.5,
        ease: 'easeOut'
      }
    }
  };

  if (loading) {
    return (
      <>
        <CustomCursor />
        <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black flex items-center justify-center">
          <div className="text-center">
            <FaSpinner className="animate-spin text-[var(--color-accent)] text-6xl mx-auto mb-4" />
            <p className="text-gray-400 text-xl">Cargando álbum...</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <CustomCursor />
      <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black text-white relative overflow-hidden">
        {/* Elementos decorativos de fondo */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {/* Grid animado */}
          <div className="absolute inset-0 bg-[linear-gradient(rgba(183,255,0,.03)_1px,transparent_1px),linear-gradient(90deg,rgba(183,255,0,.03)_1px,transparent_1px)] bg-[size:100px_100px] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_50%,black,transparent)]" />
          
          {/* Gradientes flotantes */}
          <motion.div
            className="absolute top-20 right-20 w-96 h-96 bg-[var(--color-accent)] rounded-full blur-3xl opacity-10"
            animate={{
              scale: [1, 1.2, 1],
              x: [0, 50, 0],
              y: [0, -30, 0],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
          <motion.div
            className="absolute bottom-40 left-10 w-80 h-80 bg-blue-500 rounded-full blur-3xl opacity-10"
            animate={{
              scale: [1, 1.3, 1],
              x: [0, -40, 0],
              y: [0, 40, 0],
            }}
            transition={{
              duration: 10,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        </div>

        {/* Header mejorado */}
        <header className="fixed top-0 left-0 right-0 z-50 bg-black/90 backdrop-blur-md shadow-lg border-b border-gray-800">
          <div className="container mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              {/* Título con ícono */}
              <motion.div 
                className="flex items-center gap-4"
                initial={{ x: -50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.5 }}
              >
                <div className="w-12 h-12 rounded-full bg-[var(--color-accent)]/20 flex items-center justify-center">
                  <FaImages className="text-2xl text-[var(--color-accent)]" />
                </div>
                <div>
                  <h1 className="text-2xl md:text-3xl font-black">
                    <span style={{ color: 'var(--color-accent)' }}>ÁLBUM</span> COMPLETO
                  </h1>
                  <p className="text-xs text-gray-500">Todas mis capturas</p>
                </div>
              </motion.div>

              {/* Botón volver mejorado */}
              <motion.div
                initial={{ x: 50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.5 }}
              >
                <Link href="/">
                  <button className="cursor-pointer flex items-center gap-2 px-6 py-3 rounded-full bg-[var(--color-accent)] hover:bg-white text-black font-semibold transition-all hover:scale-105 shadow-lg hover:shadow-[var(--color-accent)]/50">
                    <FaHome />
                    <span className="hidden sm:inline">Volver al Inicio</span>
                  </button>
                </Link>
              </motion.div>
            </div>
          </div>
        </header>

        {/* Contenido principal */}
        <section className="pt-32 pb-20 px-6 relative z-10" ref={ref}>
          <div className="container mx-auto">
            {/* Stats y filtros */}
            <motion.div
              className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="flex items-center gap-4">
                <div className="p-4 bg-gray-900/80 border border-gray-800 rounded-xl backdrop-blur-sm">
                  <p className="text-gray-400 text-sm mb-1">Total de fotos</p>
                  <p className="text-3xl font-black text-[var(--color-accent)]">
                    {albumPhotos.length}
                  </p>
                </div>
                
                {user && (
                  <div className="p-4 bg-gray-900/80 border border-gray-800 rounded-xl backdrop-blur-sm">
                    <p className="text-gray-400 text-sm mb-1">En portfolio</p>
                    <p className="text-3xl font-black text-[var(--color-accent)]">
                      {albumPhotos.filter(p => p.in_portfolio).length}
                    </p>
                  </div>
                )}
              </div>

              {/* Indicador si está logueado */}
              {user && (
                <motion.div
                  className="flex items-center gap-2 px-4 py-2 bg-green-500/20 border border-green-500/50 rounded-full"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  <span className="text-green-400 text-sm font-semibold">Modo edición activo</span>
                </motion.div>
              )}
            </motion.div>

            {/* Grid de fotos */}
            {albumPhotos.length === 0 ? (
              <motion.div 
                className="text-center py-32"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
              >
                <FaCamera className="text-6xl text-gray-700 mx-auto mb-6" />
                <p className="text-gray-500 text-2xl mb-2">No hay fotos en el álbum</p>
                <p className="text-gray-600 text-sm">Añade tu primera foto usando el botón flotante</p>
              </motion.div>
            ) : (
              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate={inView ? "visible" : "hidden"}
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
              >
                {albumPhotos.map((photo, index) => (
                  <motion.div
                    key={photo.id}
                    variants={itemVariants}
                    className="relative group overflow-hidden rounded-xl aspect-square bg-gray-900 border border-gray-800 hover:border-[var(--color-accent)] transition-all"
                    whileHover={{ y: -5, scale: 1.02 }}
                  >
                    {/* Badge de portfolio */}
                    {photo.in_portfolio && (
                      <motion.div 
                        className="absolute top-3 left-3 z-10 px-3 py-1 bg-[var(--color-accent)] text-black rounded-full text-xs font-bold flex items-center gap-1 shadow-lg"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: index * 0.05 }}
                      >
                        <FaStar size={10} />
                        Portfolio
                      </motion.div>
                    )}

                    {/* Botones de admin */}
                    {user && (
                      <div className="absolute top-3 right-3 z-10 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <motion.button
                          onClick={(e) => {
                            e.stopPropagation();
                            openEditModal(photo);
                          }}
                          className="cursor-pointer w-9 h-9 rounded-full bg-blue-500 hover:bg-blue-600 text-white flex items-center justify-center transition-all shadow-lg"
                          title="Editar"
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <FaEdit size={14} />
                        </motion.button>
                        <motion.button
                          onClick={(e) => {
                            e.stopPropagation();
                            deletePhoto(photo.id);
                          }}
                          className="cursor-pointer w-9 h-9 rounded-full bg-red-500 hover:bg-red-600 text-white flex items-center justify-center transition-all shadow-lg"
                          title="Eliminar"
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <FaTrash size={14} />
                        </motion.button>
                      </div>
                    )}

                    {/* Imagen */}
                    <div
                      onClick={() => openModal(photo)}
                      className="cursor-pointer w-full h-full relative"
                    >
                      <div
                        className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-110"
                        style={{ backgroundImage: `url(${photo.image})` }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-60 group-hover:opacity-80 transition-all" />
                      
                      <div className="absolute inset-0 flex flex-col justify-end p-4">
                        <div className="transform translate-y-4 group-hover:translate-y-0 transition-transform opacity-0 group-hover:opacity-100">
                          <span className="text-xs text-[var(--color-accent)] font-semibold mb-1 block uppercase tracking-wider">
                            {photo.category}
                          </span>
                          <h3 className="text-lg font-bold text-white line-clamp-2">
                            {photo.title}
                          </h3>
                        </div>
                      </div>

                      {/* Efecto de brillo en hover */}
                      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent transform -skew-x-12 translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000" />
                      </div>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </div>
        </section>
      </div>

      <PhotoModal 
        photo={selectedPhoto} 
        isOpen={isModalOpen} 
        onClose={closeModal} 
      />

      <EditPhotoModal
        photo={selectedPhoto}
        isOpen={isEditModalOpen}
        onClose={closeModal}
        onUpdate={loadPhotos}
      />

      <AdminPanel />
    </>
  );
}
