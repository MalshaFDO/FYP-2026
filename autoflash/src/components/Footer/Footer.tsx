import styles from "./Footer.module.css";

const Footer = () => {
  return (
    <footer className={styles.footer}>
      <p>© {new Date().getFullYear()} AutoFlash. All rights reserved.</p>
    </footer>
  );
};

export default Footer;
