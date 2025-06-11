"use client";

import { useState, useEffect } from 'react';
import styles from './PopupAd.module.css';

const PopupAd = () => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(true);
    }, 1000); // Show after 1 second

    return () => clearTimeout(timer);
  }, []);

  if (!visible) {
    return null;
  }

  return (
    <div className={styles.popup}>
      <div className={styles.popupContent}>
        <button className={styles.closeButton} onClick={() => setVisible(false)}>
          &times;
        </button>
        <h2>Ad Space</h2>
        <p>This is a popup ad. Your ad content goes here.</p>
        {/* Google AdSense code can be placed here */}
      </div>
    </div>
  );
};

export default PopupAd; 