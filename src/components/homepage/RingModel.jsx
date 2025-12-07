import React, { useRef, useEffect, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { useGLTF, OrbitControls, Environment } from "@react-three/drei";

function RingModel() {
  const { scene } = useGLTF("https://res.cloudinary.com/dxoxbnptl/image/upload/v1765110838/chaos_emerald_cfiwad.glb");
  const ref = useRef();

  // Auto rotation
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
useGLTF.preload("https://res.cloudinary.com/dxoxbnptl/image/upload/v1765110838/chaos_emerald_cfiwad.glbhttps://res.cloudinary.com/dxoxbnptl/image/upload/v1765110838/chaos_emerald_cfiwad.glb");

export default function HeroWithEmerald() {
  const [scrollProgress, setScrollProgress] = useState(0);
  const sectionRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => {
      if (sectionRef.current) {
        const rect = sectionRef.current.getBoundingClientRect();
        const windowHeight = window.innerHeight;
        const elementTop = rect.top;
        
        // Calculate progress: 0 when element enters viewport, 1 when fully visible
        const progress = Math.min(Math.max((windowHeight - elementTop) / windowHeight, 0), 1);
        setScrollProgress(progress);
      }
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Initial check
    
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div
      ref={sectionRef}
      className="hero-container"
      style={{
        position: "relative",
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "clamp(2rem, 5vw, 3rem) clamp(1rem, 4vw, 2rem)",
        minHeight: "75vh",
        overflow: "hidden",
        gap: "clamp(2rem, 5vw, 3rem)",
        boxSizing: "border-box",
        flexWrap: "wrap",
      }}
    >
      {/* Background Image */}
      <img
        src="https://res.cloudinary.com/dxoxbnptl/image/upload/v1765110874/bg2_jnmbg0.jpg"
        alt=""
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          objectFit: "cover",
          objectPosition: "center",
          zIndex: 0,
          pointerEvents: "none",
        }}
      />

      {/* Subtle Overlay */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "radial-gradient(circle at 30% 40%, rgba(255, 250, 240, 0.8), transparent 60%)",
          zIndex: 0,
          pointerEvents: "none",
        }}
      />

      {/* Delicate Gold Accent */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "radial-gradient(circle at 70% 50%, rgba(184, 134, 11, 0.08), transparent 50%)",
          animation: "gentleGlow 8s ease-in-out infinite alternate",
          zIndex: 0,
          pointerEvents: "none",
        }}
      />

      {/* Emerald Subtle Glow */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "radial-gradient(circle at 80% 50%, rgba(16, 124, 16, 0.06), transparent 40%)",
          animation: "gentleGlow 6s ease-in-out infinite alternate",
          zIndex: 0,
          pointerEvents: "none",
        }}
      />

      {/* Fine Texture */}
      <div
        style={{
          position: "absolute",
          inset: 0,
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
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: "120px",
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

        @media (max-width: 768px) {
          .hero-container {
            flex-direction: column !important;
            justify-content: center !important;
            text-align: center;
            min-height: auto !important;
            padding-top: 2rem !important;
            padding-bottom: 2rem !important;
          }
        }

        @media (max-width: 480px) {
          .hero-container {
            min-height: auto !important;
            padding: 1.5rem 1rem !important;
          }
        }
      `}</style>

      {/* LEFT SIDE TEXT */}
      <div
        style={{
          flex: 1,
          paddingRight: "clamp(0rem, 2vw, 2rem)",
          minWidth: "min(300px, 100%)",
          maxWidth: "100%",
          zIndex: 2,
          opacity: scrollProgress,
          transform: `translateX(${-60 + scrollProgress * 60}px)`,
          transition: "opacity 0.6s ease-out, transform 0.6s ease-out",
        }}
      >
        <h1
          style={{
            fontSize: "clamp(2rem, 5vw, 4.8rem)",
            fontWeight: "1000",
            color: "#2a1810",
            textShadow: "1px 1px 2px rgba(184, 134, 11, 0.15), 0 2px 8px rgba(255, 255, 255, 0.6)",
            marginBottom: "clamp(0.5rem, 1.5vw, 0.8rem)",
            letterSpacing: "clamp(4px, 1vw, 12px)",
            textTransform: "uppercase",
            fontFamily: "'Playfair Display', serif",
            lineHeight: "1.15",
            display: "flex",
            alignItems: "center",
            gap: "clamp(0.5rem, 1.2vw, 1.2rem)",
            flexWrap: "nowrap",
            whiteSpace: "nowrap",
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
          style={{
            width: "clamp(100px, 25vw, 180px)",
            height: "2px",
            background: "linear-gradient(90deg, #b8860b 0%, rgba(184, 134, 11, 0.4) 100%)",
            boxShadow: "0 2px 6px rgba(184, 134, 11, 0.3)",
            margin: "clamp(0.5rem, 1vw, 0.8rem) 0 clamp(0.8rem, 1.5vw, 1.5rem) 0",
            borderRadius: "2px",
            opacity: 0.7,
          }}
        />

        <h3
          style={{
            fontSize: "clamp(0.9rem, 1.8vw, 1.5rem)",
            color: "#362d23ff",
            textShadow: "0 1px 3px rgba(255, 255, 255, 0.5)",
            fontWeight: "900",
            marginBottom: "clamp(0.8rem, 1.5vw, 1.5rem)",
            fontFamily: " serif",
            letterSpacing: "clamp(1px, 0.25vw, 2px)",
            opacity: 0.85,
            outlineWidth:"1px",
          }}
        >
          Since 1988
        </h3>

        <p
          style={{
            fontSize: "clamp(0.9rem, 1.45vw, 1.3rem)",
            lineHeight: "1.7",
            color: "#3a2a1a",
            textShadow: "0 1px 3px rgba(255, 255, 255, 0.4)",
            maxWidth: "min(520px, 100%)",
            fontFamily: "'Cormorant Garamond', serif",
            fontWeight: "600",
            background: "rgba(255, 250, 245, 0.5)",
            backdropFilter: "blur(10px)",
            padding: "clamp(0.8rem, 1.8vw, 1.5rem) clamp(1rem, 2vw, 2rem)",
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

      {/* RIGHT SIDE MODEL */}
      <div
        style={{
          flex: 1,
          height: "clamp(300px, 50vh, 450px)",
          minWidth: "min(300px, 100%)",
          maxWidth: "100%",
          zIndex: 2,
          opacity: Math.min(scrollProgress * 1.2, 1),
          transform: `scale(${0.9 + scrollProgress * 0.1})`,
          transition: "opacity 0.8s ease-out, transform 0.8s ease-out",
        }}
      >
        <Canvas 
          camera={{ position: [1.6, 1.2, 2.3], fov: 34 }}
          gl={{ alpha: true, antialias: true }}
          style={{ background: 'transparent' }}
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
  );
}