'use client';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import PhotoModal from './PhotoModal';

export default function PortfolioFotos() {
  const [ref, inView] = useInView({
    triggerOnce: false,
    threshold: 0.1,
  });

  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [photosData, setPhotosData] = useState([]);

  useEffect(() => {
    const loadPhotos = async () => {
      try {
        const response = await fetch('/data/photos.json');
        const data = await response.json();
        setPhotosData(data);
      } catch (error) {
        console.error('Error cargando fotos:', error);
        setPhotosData([
          {
            id: 1,
            title: "Retrato Natural",
            description: "Sesión de retrato en luz natural",
            category: "Retratos",
            image: "https://i.imgur.com/CjD6odO.jpeg",
            author: "Javier Jiménez",
            date: "2024-10-15",
            location: "Sevilla, España",
            camera: "Canon EOS R6",
            lens: "RF 85mm f/1.2",
            settings: "f/1.8, 1/200s, ISO 100"
          },
          {
            id: 2,
            title: "Ciudad Nocturna",
            description: "Paisaje urbano durante la hora azul",
            category: "Paisaje Urbano",
            image: "https://i.imgur.com/04UemMB.jpeg",
            author: "Javier Jiménez",
            date: "2024-09-22",
            location: "Barcelona, España",
            camera: "Sony A7 IV",
            lens: "FE 24-70mm f/2.8",
            settings: "f/8, 15s, ISO 200"
          },
          {
            id: 3,
            title: "Bodas 2024",
            description: "Momentos especiales en celebración nupcial",
            category: "Eventos",
            image: "https://i.imgur.com/EP8prma.jpeg",
            author: "Javier Jiménez",
            date: "2024-06-18",
            location: "Madrid, España",
            camera: "Nikon Z9",
            lens: "Z 50mm f/1.2",
            settings: "f/2.0, 1/250s, ISO 400"
          },
          {
            id: 4,
            title: "Naturaleza Salvaje",
            description: "Fotografía de vida silvestre",
            category: "Naturaleza",
            image: "https://i.imgur.com/EDTD6dC.jpeg",
            author: "Javier Jiménez",
            date: "2024-08-05",
            location: "Andalucía",
            camera: "Canon EOS R5",
            lens: "RF 100-500mm f/4.5-7.1",
            settings: "f/5.6, 1/500s, ISO 800"
          },
          {
            id: 5,
            title: "Producto Comercial",
            description: "Fotografía de producto profesional",
            category: "Comercial",
            image: "https://i.imgur.com/CUF8fCX.jpeg",
            author: "Javier Jiménez",
            date: "2024-07-12",
            location: "Estudio, Sevilla",
            camera: "Fujifilm GFX 100S",
            lens: "GF 110mm f/2",
            settings: "f/11, 1/125s, ISO 100"
          },
          {
            id: 6,
            title: "Street Photography",
            description: "Momento espontáneo en la ciudad",
            category: "Calle",
            image: "https://i.imgur.com/Etgko19.jpeg",
            author: "Javier Jiménez",
            date: "2024-05-30",
            location: "Valencia, España",
            camera: "Leica Q2",
            lens: "Summilux 28mm f/1.7",
            settings: "f/2.8, 1/500s, ISO 200"
          }
        ]);
      }
    };

    loadPhotos();
  }, []);

  const openModal = (photo) => {
    setSelectedPhoto(photo);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setTimeout(() => setSelectedPhoto(null), 300);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 50, scale: 0.9 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.6,
        ease: 'easeOut'
      }
    }
  };

  return (
    <>
      <section id="portfolio" className="py-32 px-6 bg-black" ref={ref}>
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={inView ? { opacity: 1, x: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="container mx-auto"
        >
          <h2 className="text-6xl md:text-8xl font-black mb-4">
            <span className="text-white">MI</span>{' '}
            <span style={{ color: 'var(--color-accent)' }}>GALERÍA</span>
          </h2>
          <p className="text-gray-400 text-xl mb-16 max-w-2xl">
            Una selección de trabajos que demuestran creatividad, técnica y pasión por el diseño
          </p>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate={inView ? "visible" : "hidden"}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {photosData.map((project) => (
              <motion.div
                key={project.id}
                variants={itemVariants}
                whileHover={{ y: -20, scale: 1.05 }}
                onClick={() => openModal(project)}
                className="relative group overflow-hidden rounded-2xl aspect-square cursor-pointer"
              >
                <div
                  className="absolute inset-0 transition-all duration-500 group-hover:scale-110"
                  style={{
                    backgroundImage: `url(${project.image})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center'
                  }}
                />

                <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-all duration-300" />

                <div className="absolute inset-0 flex flex-col justify-end p-6">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileHover={{ opacity: 1, y: 0 }}
                    className="transform translate-y-8 group-hover:translate-y-0 transition-transform duration-300"
                  >
                    <span className="text-xs uppercase tracking-widest text-[var(--color-accent)] font-semibold mb-2 block">
                      {project.category}
                    </span>
                    <h3 className="text-2xl font-bold text-white mb-2">
                      {project.title}
                    </h3>
                    <div className="w-12 h-1 bg-[var(--color-accent)] group-hover:w-full transition-all duration-500" />
                  </motion.div>
                </div>

                <motion.div
                  className="absolute inset-0 border-2 border-transparent group-hover:border-[var(--color-accent)] transition-all duration-300 rounded-2xl"
                />
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </section>

      <PhotoModal 
        photo={selectedPhoto} 
        isOpen={isModalOpen} 
        onClose={closeModal} 
      />
    </>
  );
}
