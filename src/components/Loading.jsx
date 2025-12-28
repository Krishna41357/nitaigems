import React from 'react';

const Loading = () => {
  return (
    <div style={styles.container}>
      <div style={styles.imageWrapper}>
        <img
          src="/logo/nitaigemsflower.png"
          alt="Loading"
          style={styles.image}
        />
      </div>
    </div>
  );
};

const styles = {
  container: {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100vw',
    height: '100vh',
    backgroundColor: '#000000',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  imageWrapper: {
    position: 'relative',
  },
  image: {
    width: '384px',
    height: '384px',
    animation: 'spin 2s linear infinite',
  },
};

// Add this to your global CSS or create a separate CSS file
const styleSheet = `
  @keyframes spin {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  }
`;

// Inject the animation styles
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = styleSheet;
  document.head.appendChild(style);
}

export default Loading;