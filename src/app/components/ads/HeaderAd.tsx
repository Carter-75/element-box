import styles from './HeaderAd.module.css';

const HeaderAd = () => {
  return (
    <div className={styles.headerAd}>
      <h2>Ad Space</h2>
      <p>This is a header ad. Your ad content goes here.</p>
      {/* Google AdSense code can be placed here */}
    </div>
  );
};

export default HeaderAd; 