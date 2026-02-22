'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import styles from './ServiceSelectorModal.module.css';
import { FaTimes, FaCar, FaTint, FaOilCan, FaSprayCan } from 'react-icons/fa';

interface Props {
  onClose: () => void;
}

export default function ServiceSelectorModal({ onClose }: Props) {
  const router = useRouter();

  const handleSelect = (path: string) => {
    onClose();
    router.push(path);
  };

  // Prevent background scroll
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, []);

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div
        className={styles.modal}
        onClick={(e) => e.stopPropagation()} // prevent close when clicking inside
      >
        <button className={styles.closeBtn} onClick={onClose}>
          <FaTimes />
        </button>

        <h2 className={styles.title}>Select Your Service</h2>

        <div className={styles.grid}>
          <div className={styles.card} onClick={() => handleSelect('/booking/full-service')}>
            <FaCar className={styles.icon}/>
            <h3>Full Service</h3>
          </div>

          <div className={styles.card} onClick={() => handleSelect('/booking/bodywash')}>
            <FaTint className={styles.icon}/>
            <h3>Body Wash</h3>
          </div>

          <div className={styles.card} onClick={() => handleSelect('/booking/oil-change')}>
            <FaOilCan className={styles.icon}/>
            <h3>Oil Change</h3>
          </div>

          <div className={styles.card} onClick={() => handleSelect('/booking/interior-cut&polish')}>
            <FaSprayCan className={styles.icon}/>
            <h3>Interior / Cut & Polish</h3>
          </div>
        </div>
      </div>
    </div>
  );
}
