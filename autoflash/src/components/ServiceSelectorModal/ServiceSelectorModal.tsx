'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FaTimes, FaCar, FaTint, FaOilCan } from 'react-icons/fa';
import { useLanguage } from "@/components/providers/LanguageProvider";
import styles from './ServiceSelectorModal.module.css';

interface Props {
  onClose: () => void;
}

export default function ServiceSelectorModal({ onClose }: Props) {
  const router = useRouter();
  const { language } = useLanguage();
  const t =
    language === "si"
      ? {
          title: "ඔබගේ සේවාව තෝරන්න",
          fullService: "සම්පූර්ණ සේවාව",
          bodyWash: "බොඩි වොෂ්",
          oilChange: "ඔයිල් චේන්ජ්",
        }
      : {
          title: "Select Your Service",
          fullService: "Full Service",
          bodyWash: "Body Wash",
          oilChange: "Oil Change",
        };

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

        <h2 className={styles.title}>{t.title}</h2>

        <div className={styles.grid}>
          <div className={styles.card} onClick={() => handleSelect('/booking/full-service')}>
            <FaCar className={styles.icon} />
            <h3>{t.fullService}</h3>
          </div>

          <div className={styles.card} onClick={() => handleSelect('/booking/bodywash')}>
            <FaTint className={styles.icon} />
            <h3>{t.bodyWash}</h3>
          </div>

          <div className={styles.card} onClick={() => handleSelect('/booking/full-service')}>
            <FaOilCan className={styles.icon} />
            <h3>{t.oilChange}</h3>
          </div>
        </div>
      </div>
    </div>
  );
}
