'use client';

import { useRouter } from 'next/navigation';
import styles from './ServiceSelectorModal.module.css';
import { FaTimes, FaCar, FaTint, FaOilCan } from 'react-icons/fa';
import { useEffect, useState } from 'react';

interface Props {
  onClose: () => void;
}

export default function ServiceSelectorModal({ onClose }: Props) {
  const router = useRouter();

 const handleSelect = (route: string) => {
  const token = localStorage.getItem("token");

  if (!token) {
    setSelectedRoute(route);
    setShowAuthChoice(true);
  } else {
    onClose();
    router.push(route);
  }
};

  const [showAuthChoice, setShowAuthChoice] = useState(false);
  const [selectedRoute, setSelectedRoute] = useState("");

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
          </div>
          {showAuthChoice && (
  <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50">
    <div className="bg-white text-black p-6 rounded w-80 text-center">
      <h2 className="text-lg mb-4">Continue</h2>

      <button
        className="bg-blue-500 text-white px-4 py-2 w-full mb-3"
        onClick={() => {
  localStorage.setItem("redirectAfterLogin", selectedRoute);
  onClose(); // 🔥 important
  router.push("/login");
}}
      >
        Login
      </button>

      <button
        className="bg-gray-300 px-4 py-2 w-full"
        onClick={() => {
          onClose();
          router.push(selectedRoute);
        }}
      >
        Continue as Guest
      </button>
    </div>
  </div>
)}
        </div>
    </div>
  );
}
