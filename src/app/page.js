'use client';

import Header from '@/components/Header';
import Hero from '@/components/Hero';
import PortfolioFotos from '@/components/PortfolioFotos';
import VideosYoutube from '@/components/VideosYoutube';
import Footer from '@/components/Footer';
import CustomCursor from '@/components/CustomCursor';
import AdminPanel from '@/components/AdminPanel';
import Hero3D from '@/components/Hero3D';

export default function Home() {
  return (
    <>
      <CustomCursor />
      <Header />
      <main>
        <Hero3D />
        <PortfolioFotos />
        <VideosYoutube />
      </main>
      <Footer />
      <AdminPanel />
    </>
  );
}
