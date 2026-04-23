'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FaTimes, FaCar, FaTint, FaOilCan } from 'react-icons/fa';
import styles from './ServiceSelectorModal.module.css';

interface Props {
  onClose: () => void;
}

export default function ServiceSelectorModal({ onClose }: Props) {
  const router = useRouter();

  const handleSelect = (route: string) => {
    const token = localStorage.getItem('token');

    if (!token) {
      localStorage.setItem('redirectAfterLogin', route);
      onClose();
      router.push('/login');
      return;
    }

    onClose();
    router.push(route);
  };

  useEffect(() => {
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = 'auto';
    };
  }, []);

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <button className={styles.closeBtn} onClick={onClose}>
          <FaTimes />
        </button>

        <h2 className={styles.title}>Select Your Service</h2>

        <div className={styles.grid}>
          <div className={styles.card} onClick={() => handleSelect('/booking/full-service')}>
            <FaCar className={styles.icon} />
            <h3>Full Service</h3>
          </div>

          <div className={styles.card} onClick={() => handleSelect('/booking/bodywash')}>
            <FaTint className={styles.icon} />
            <h3>Body Wash</h3>
          </div>

          <div className={styles.card} onClick={() => handleSelect('/booking/oil-change')}>
            <FaOilCan className={styles.icon} />
            <h3>Oil Change</h3>
          </div>
        </div>
      </div>
    </div>
  );
}
