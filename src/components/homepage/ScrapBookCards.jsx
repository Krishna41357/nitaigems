import React from 'react';

export default function ScrapbookCards() {
  return (
    <div className="relative w-full h-screen overflow-hidden">
      {/* Background Image */}
      <img 
        src="/bg3.jpg" 
        alt="background"
        className="absolute inset-0 w-full h-full"
        style={{
          objectFit: 'contain',
          objectPosition: 'center'
        }}
      />
      
      {/* Overlay for better contrast */}
      <div className="absolute inset-0 bg-black/10" />
      
      {/* Top Right Card */}
      <div 
        className="absolute top-20 right-32 w-96 h-80 bg-amber-50 transform rotate-3 transition-transform hover:rotate-6 hover:scale-105 duration-300"
        style={{
          boxShadow: '8px 8px 20px rgba(0, 0, 0, 0.7)',
          clipPath: 'polygon(2% 0%, 5% 1%, 8% 0%, 95% 0%, 98% 2%, 100% 5%, 100% 92%, 98% 95%, 100% 98%, 95% 100%, 8% 100%, 5% 98%, 2% 100%, 0% 95%, 0% 5%)',
          filter: 'sepia(0.3) contrast(1.1)',
          backgroundImage: 'linear-gradient(to bottom, #fefce8 0%, #fef3c7 100%)',
          border: '1px solid rgba(120, 80, 50, 0.3)'
        }}
      >
        <div className="p-6 h-full flex flex-col justify-center items-center text-center">
          <div className="absolute top-3 right-3 w-8 h-8 bg-red-300/40 rounded-full blur-sm" />
          <h2 className="text-2xl font-serif text-amber-900 mb-4" style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.1)' }}>
            Precious Moments
          </h2>
          <p className="text-amber-800 font-light leading-relaxed">
            Like gems scattered across time, memories shine brightest when held close to the heart.
          </p>
          <div className="mt-4 w-16 h-0.5 bg-amber-400/50" />
        </div>
      </div>
      
      {/* Bottom Left Card */}
      <div 
        className="absolute bottom-24 left-32 w-96 h-80 bg-rose-50 transform -rotate-2 transition-transform hover:-rotate-4 hover:scale-105 duration-300"
        style={{
          boxShadow: '8px 8px 20px rgba(0, 0, 0, 0.7)',
          clipPath: 'polygon(0% 8%, 2% 5%, 0% 2%, 5% 0%, 92% 0%, 95% 2%, 98% 0%, 100% 5%, 100% 95%, 98% 92%, 100% 95%, 95% 100%, 8% 100%, 5% 98%, 2% 100%, 0% 92%)',
          filter: 'sepia(0.3) contrast(1.1)',
          backgroundImage: 'linear-gradient(to bottom, #fff1f2 0%, #ffe4e6 100%)',
          border: '1px solid rgba(120, 80, 80, 0.3)'
        }}
      >
        <div className="p-6 h-full flex flex-col justify-center items-center text-center relative">
          <div className="absolute top-4 left-4 w-6 h-6 bg-pink-300/40 rounded-full blur-sm" />
          <div className="absolute bottom-6 right-6 w-10 h-10 bg-purple-300/30 rounded-full blur-sm" />
          <h2 className="text-2xl font-serif text-rose-900 mb-4" style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.1)' }}>
            Timeless Beauty
          </h2>
          <p className="text-rose-800 font-light leading-relaxed">
            Each color tells a story, every facet reflects a dream captured in crystalline perfection.
          </p>
          <div className="mt-4 w-16 h-0.5 bg-rose-400/50" />
        </div>
      </div>
      
      {/* Decorative tape on cards */}
      <div 
        className="absolute top-16 right-40 w-16 h-6 bg-yellow-100/60 transform rotate-45"
        style={{
          boxShadow: '2px 2px 4px rgba(0, 0, 0, 0.3)',
          border: '1px dashed rgba(180, 150, 100, 0.4)'
        }}
      />
      
      <div 
        className="absolute bottom-20 left-40 w-16 h-6 bg-red-100/60 transform -rotate-12"
        style={{
          boxShadow: '2px 2px 4px rgba(0, 0, 0, 0.3)',
          border: '1px dashed rgba(180, 100, 100, 0.4)'
        }}
      />
    </div>
  );
}