'use client';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import PhotoModal from './PhotoModal';
import EditPhotoModal from './EditPhotoModal';
import { FaEdit, FaTimes, FaImages } from 'react-icons/fa';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';

export default function PortfolioFotos() {
  const [ref, inView] = useInView({
    triggerOnce: false,
    threshold: 0.1,
  });

  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [portfolioPhotos, setPortfolioPhotos] = useState([]);
  const [user, setUser] = useState(null);

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

  useEffect(() => {
    loadPortfolioPhotos();
    const subscription = supabase
      .channel('photos_changes_portfolio')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'photos' }, () => {
        loadPortfolioPhotos();
      })
      .subscribe();
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const loadPortfolioPhotos = async () => {
    try {
      const { data, error } = await supabase
        .from('photos')
        .select('*')
        .eq('in_portfolio', true)
        .order('created_at', { ascending: false });
      if (error) throw error;
      setPortfolioPhotos(data || []);
    } catch (error) {
      console.error('Error cargando portfolio:', error);
    }
  };

  const removeFromPortfolio = async (photoId) => {
    if (!user) {
      alert('Debes iniciar sesión');
      return;
    }
    if (!confirm('¿Quitar esta foto del portfolio? (No se eliminará del álbum)')) return;
    try {
      const { error } = await supabase
        .from('photos')
        .update({ in_portfolio: false })
        .eq('id', photoId);
      if (error) throw error;
      setPortfolioPhotos(portfolioPhotos.filter(photo => photo.id !== photoId));
    } catch (error) {
      console.error('Error quitando del portfolio:', error);
      alert('Error al quitar la foto del portfolio');
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
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: 'easeOut'
      }
    }
  };

  return (
    <>
      <section id="portfolio" className="py-20 md:py-32 px-4 md:px-6 bg-black" ref={ref}>
        <div className="container mx-auto">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8 }}
            className="mb-12 md:mb-16"
          >
            <div className="mb-6 md:mb-8">
              <h2 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black mb-3 md:mb-4 leading-tight">
                <span className="text-white">MI</span>{' '}
                <span style={{ color: 'var(--color-accent)' }}>PORTFOLIO</span>
              </h2>
              <p className="text-gray-400 text-base md:text-xl max-w-2xl">
                Una selección de mis mejores trabajos fotográficos
              </p>
            </div>

            <Link href="/album">
              <button className="cursor-pointer w-full sm:w-auto flex items-center justify-center gap-3 px-6 py-4 rounded-2xl bg-[var(--color-accent)] hover:bg-white text-black font-bold text-base md:text-lg transition-all duration-300 hover:scale-105 shadow-xl hover:shadow-[var(--color-accent)]/50">
                <FaImages className="text-xl" />
                <span>Ver Álbum Completo</span>
                <span className="hidden sm:inline">→</span>
              </button>
            </Link>
          </motion.div>

          {portfolioPhotos.length === 0 ? (
            <motion.div 
              className="text-center py-20"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <FaImages className="text-6xl text-gray-700 mx-auto mb-6" />
              <p className="text-gray-500 text-xl md:text-2xl mb-3">No hay fotos en el portfolio</p>
              <p className="text-gray-600 text-sm md:text-base mb-6">
                {user ? (
                  <>Ve al <Link href="/album" className="text-[var(--color-accent)] underline">álbum</Link> y marca fotos para mostrar aquí</>
                ) : (
                  'Pronto habrá contenido disponible'
                )}
              </p>
            </motion.div>
          ) : (
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate={inView ? "visible" : "hidden"}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-8"
            >
              {portfolioPhotos.map((photo) => (
                <motion.div
                  key={photo.id}
                  variants={itemVariants}
                  className="relative group overflow-hidden rounded-xl md:rounded-2xl aspect-square cursor-pointer"
                  onClick={() => openModal(photo)}
                >
                  {/* Botones admin */}
                  {user && (
                    <div className="absolute top-3 right-3 z-10 flex gap-2 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          openEditModal(photo);
                        }}
                        className="cursor-pointer w-9 h-9 rounded-full bg-blue-500 hover:bg-blue-600 text-white flex items-center justify-center transition-colors shadow-lg"
                      >
                        <FaEdit size={14} />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          removeFromPortfolio(photo.id);
                        }}
                        className="cursor-pointer w-9 h-9 rounded-full bg-red-500 hover:bg-red-600 text-white flex items-center justify-center transition-colors shadow-lg"
                      >
                        <FaTimes size={16} />
                      </button>
                    </div>
                  )}

                  {/* Imagen de fondo */}
                  <div
                    className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
                    style={{
                      backgroundImage: `url(${photo.image})`
                    }}
                  />

                  {/* Overlay oscuro */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-60 group-hover:opacity-40 transition-opacity duration-300" />

                  {/* Contenido de texto */}
                  <div className="absolute inset-0 flex flex-col justify-end p-4 md:p-6">
                    <div className="transform translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                      <span className="text-xs uppercase tracking-widest text-[var(--color-accent)] font-semibold mb-2 block">
                        {photo.category}
                      </span>
                      <h3 className="text-xl md:text-2xl font-bold text-white mb-2 line-clamp-2">
                        {photo.title}
                      </h3>
                      <div className="w-12 h-1 bg-[var(--color-accent)] group-hover:w-full transition-all duration-500" />
                    </div>
                  </div>

                  {/* Borde hover */}
                  <div className="absolute inset-0 border-2 border-transparent group-hover:border-[var(--color-accent)] transition-all duration-300 rounded-xl md:rounded-2xl pointer-events-none" />
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>
      </section>

      <PhotoModal 
        photo={selectedPhoto} 
        isOpen={isModalOpen} 
        onClose={closeModal} 
      />

      <EditPhotoModal
        photo={selectedPhoto}
        isOpen={isEditModalOpen}
        onClose={closeModal}
        onUpdate={loadPortfolioPhotos}
      />
    </>
  );
}
