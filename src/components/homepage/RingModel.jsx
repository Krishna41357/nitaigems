import React, { useRef, useEffect, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { useGLTF, OrbitControls, Environment } from "@react-three/drei";

function RingModel() {
  const { scene } = useGLTF("https://res.cloudinary.com/dxoxbnptl/image/upload/v1765110838/chaos_emerald_cfiwad.glb");
  const ref = useRef();

  useFrame(() => {
    if (ref.current) ref.current.rotation.y += 0.005;
  });

  return (
    <group ref={ref}>
      <primitive
        object={scene}
        scale={1.5}
        position={[0, -0.2, 0]}
        rotation={[0.22, Math.PI, 0]}
      />
    </group>
  );
}
useGLTF.preload("https://res.cloudinary.com/dxoxbnptl/image/upload/v1765110838/chaos_emerald_cfiwad.glb");

export default function HeroWithEmerald() {
  const [scrollProgress, setScrollProgress] = useState(0);
  const sectionRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => {
      if (sectionRef.current) {
        const rect = sectionRef.current.getBoundingClientRect();
        const windowHeight = window.innerHeight;
        const elementTop = rect.top;
        
        const progress = Math.min(Math.max((windowHeight - elementTop) / windowHeight, 0), 1);
        setScrollProgress(progress);
      }
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll();
    
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div
      ref={sectionRef}
      className="w-full overflow-hidden relative"
      style={{
        minHeight: "75vh",
        boxSizing: "border-box",
      }}
    >
      {/* Background Image */}
      <img
        src="https://res.cloudinary.com/dxoxbnptl/image/upload/v1765110874/bg2_jnmbg0.jpg"
        alt=""
        className="absolute inset-0 w-full h-full object-cover"
        style={{
          zIndex: 0,
          pointerEvents: "none",
        }}
      />

      {/* Subtle Overlay */}
      <div
        className="absolute inset-0"
        style={{
          background: "radial-gradient(circle at 30% 40%, rgba(255, 250, 240, 0.8), transparent 60%)",
          zIndex: 0,
          pointerEvents: "none",
        }}
      />

      {/* Delicate Gold Accent */}
      <div
        className="absolute inset-0"
        style={{
          background: "radial-gradient(circle at 70% 50%, rgba(184, 134, 11, 0.08), transparent 50%)",
          animation: "gentleGlow 8s ease-in-out infinite alternate",
          zIndex: 0,
          pointerEvents: "none",
        }}
      />

      {/* Emerald Subtle Glow */}
      <div
        className="absolute inset-0"
        style={{
          background: "radial-gradient(circle at 80% 50%, rgba(16, 124, 16, 0.06), transparent 40%)",
          animation: "gentleGlow 6s ease-in-out infinite alternate",
          zIndex: 0,
          pointerEvents: "none",
        }}
      />

      {/* Fine Texture */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `repeating-linear-gradient(
            0deg,
            transparent,
            transparent 3px,
            rgba(184, 134, 11, 0.008) 3px,
            rgba(184, 134, 11, 0.008) 6px
          )`,
          zIndex: 1,
          pointerEvents: "none",
        }}
      />

      {/* Top gradient for smooth transition */}
      <div
        className="absolute top-0 left-0 right-0 h-28"
        style={{
          background: "linear-gradient(to bottom, rgba(255, 253, 245, 0.98) 0%, rgba(255, 253, 245, 0.6) 50%, transparent 100%)",
          zIndex: 1,
          pointerEvents: "none",
        }}
      />

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700;900&family=Cormorant+Garamond:wght@400;500;600;700&family=Playfair+Display:wght@400;500;600;700&display=swap');
        
        @keyframes gentleGlow {
          0% { opacity: 0.4; transform: scale(1); }
          100% { opacity: 0.7; transform: scale(1.05); }
        }
        
        @keyframes fadeInLeft {
          from {
            opacity: 0;
            transform: translateX(-60px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        /* Mobile: Stack vertically with text first */
        @media (max-width: 768px) {
          .hero-with-emerald-container {
            flex-direction: column !important;
            justify-content: flex-start !important;
            text-align: center !important;
            padding: 2rem 1rem !important;
            gap: 2rem !important;
          }
          
          .text-section-mobile {
            order: 1 !important;
            width: 100% !important;
            padding-right: 0 !important;
          }
          
          .model-section-mobile {
            order: 2 !important;
            width: 100% !important;
            height: 350px !important;
          }
          
          .mobile-center-title {
            justify-content: center !important;
          }
        }

        @media (max-width: 480px) {
          .model-section-mobile {
            height: 300px !important;
          }
        }
      `}</style>

      {/* MAIN CONTENT CONTAINER - FIXED: Full width with proper padding */}
      <div className="hero-with-emerald-container w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 lg:py-16 flex flex-col md:flex-row items-center justify-between gap-8 md:gap-12" style={{ zIndex: 2, position: "relative" }}>
        
        {/* LEFT SIDE TEXT (Desktop) / TOP (Mobile) */}
        <div
          className="text-section-mobile w-full md:w-1/2"
          style={{
            opacity: scrollProgress,
            transform: `translateX(${-60 + scrollProgress * 60}px)`,
            transition: "opacity 0.6s ease-out, transform 0.6s ease-out",
          }}
        >
          <h1
            className="mobile-center-title text-3xl sm:text-4xl md:text-5xl lg:text-6xl flex items-center gap-3 md:gap-4 flex-wrap md:justify-start justify-center mb-3 md:mb-4"
            style={{
              fontWeight: "1000",
              color: "#2a1810",
              textShadow: "1px 1px 2px rgba(184, 134, 11, 0.15), 0 2px 8px rgba(255, 255, 255, 0.6)",
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              fontFamily: "'Playfair Display', serif",
              lineHeight: "1.15",
            }}
          >
            <span>Nitai</span>
            <span style={{
              fontSize: "0.35em",
              color: "#b8860b",
              textShadow: "0 0 8px rgba(184, 134, 11, 0.4)",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              opacity: 1,
            }}>
              ◆
            </span>
            <span>Gems</span>
          </h1>

          <div
            className="mx-auto md:mx-0 mb-4 md:mb-6"
            style={{
              width: "140px",
              height: "2px",
              background: "linear-gradient(90deg, #b8860b 0%, rgba(184, 134, 11, 0.4) 100%)",
              boxShadow: "0 2px 6px rgba(184, 134, 11, 0.3)",
              borderRadius: "2px",
              opacity: 0.7,
            }}
          />

          <h3
            className="text-base sm:text-lg md:text-xl mb-4 md:mb-6"
            style={{
              color: "#362d23ff",
              textShadow: "0 1px 3px rgba(255, 255, 255, 0.5)",
              fontWeight: "900",
              fontFamily: "serif",
              letterSpacing: "0.05em",
              opacity: 0.85,
            }}
          >
            Since 1988
          </h3>

          <p
            className="text-sm sm:text-base md:text-lg mx-auto md:mx-0 max-w-xl"
            style={{
              lineHeight: "1.7",
              color: "#3a2a1a",
              textShadow: "0 1px 3px rgba(255, 255, 255, 0.4)",
              fontFamily: "'Cormorant Garamond', serif",
              fontWeight: "600",
              background: "rgba(255, 250, 245, 0.5)",
              backdropFilter: "blur(10px)",
              padding: "1.25rem 1.75rem",
              borderRadius: "8px",
              boxShadow: "0 4px 20px rgba(184, 134, 11, 0.08), inset 0 1px 2px rgba(255, 255, 255, 0.5)",
              border: "1px solid rgba(184, 134, 11, 0.1)",
            }}
          >
            Blending the heritage of fine craftsmanship with the purity
            of timeless gemstones. Every creation carries the legacy of
            artistry, devotion, and elegance — a tradition preserved for
            generations.
          </p>
        </div>

        {/* RIGHT SIDE MODEL (Desktop) / BOTTOM (Mobile) */}
        <div
          className="model-section-mobile w-full md:w-1/2 h-96 md:h-[450px]"
          style={{
            opacity: Math.min(scrollProgress * 1.2, 1),
            transform: `scale(${0.9 + scrollProgress * 0.1})`,
            transition: "opacity 0.8s ease-out, transform 0.8s ease-out",
          }}
        >
          <Canvas 
            camera={{ position: [1.6, 1.2, 2.3], fov: 34 }}
            gl={{ alpha: true, antialias: true }}
            style={{ background: 'transparent', width: '100%', height: '100%' }}
          >
            <ambientLight intensity={1.1} />
            <directionalLight position={[5, 8, 5]} intensity={1.2} />
            <pointLight position={[-3, 2, -3]} intensity={0.5} color="#b8860b" />

            <Environment preset="studio" />
            <RingModel />

            <OrbitControls
              enableZoom={false}
              minPolarAngle={Math.PI / 2}
              maxPolarAngle={Math.PI / 2}
              rotateSpeed={0.7}
            />
          </Canvas>
        </div>
      </div>
    </div>
  );
}