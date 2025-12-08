import { useState, useEffect } from 'react';

const WhatsAppWidget = () => {
  const [showPopup, setShowPopup] = useState(false);

  useEffect(() => {
    // Show popup after 2 seconds initially
    const initialTimer = setTimeout(() => {
      setShowPopup(true);
      setTimeout(() => setShowPopup(false), 3000);
    }, 2000);

    // Show popup every 15 seconds
    const interval = setInterval(() => {
      setShowPopup(true);
      setTimeout(() => setShowPopup(false), 3000);
    }, 15000);

    return () => {
      clearTimeout(initialTimer);
      clearInterval(interval);
    };
  }, []);

  return (
    <div className="fixed bottom-[80px] md:bottom-[20px] left-[10px] z-[999999] flex flex-col items-start">
      {/* Popup message */}
      {showPopup && (
        <div className="bg-white text-gray-800 px-4 py-3 rounded-lg shadow-lg mb-2 text-[15px] animate-in slide-in-from-bottom-2 fade-in duration-300">
          👋 Need help? Chat with us!
        </div>
      )}

      {/* WhatsApp button */}
      <a
        href="https://wa.me/916350288120?text=Hello !%20I%20need%20help%20from%20your%20website."
        target="_blank"
        rel="noopener noreferrer"
        className="w-[60px] h-[60px] md:w-[60px] md:h-[60px] sm:w-[48px] sm:h-[48px] bg-[#25d366] rounded-full flex items-center justify-center shadow-lg hover:brightness-90 transition-all animate-in zoom-in duration-400"
        onClick={() => setShowPopup(false)}
        aria-label="Chat on WhatsApp"
      >
        <img
          src="https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg"
          alt="WhatsApp"
          className="w-[32px] h-[32px] md:w-[32px] md:h-[32px] sm:w-[26px] sm:h-[26px]"
        />
      </a>
    </div>
  );
};

export default WhatsAppWidget;