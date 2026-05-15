'use client';

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { FaShoppingCart, FaUserCircle } from "react-icons/fa";
import { useLanguage } from "@/components/providers/LanguageProvider";
import { CART_EVENT, getCartItems } from "@/lib/cart";
import styles from "./Header.module.css";
import ServiceSelectorModal from "@/components/ServiceSelectorModal/ServiceSelectorModal";

const copy = {
  en: {
    navLinks: [
      { href: "/", label: "Home" },
      { href: "/services", label: "Services" },
      { href: "/about", label: "About" },
      { href: "/contact", label: "Contact" },
    ],
    bookNow: "Book Now",
    cart: "Cart",
    profile: "Profile",
    goHome: "Go to AutoFlash home",
    openMenu: "Open navigation menu",
    closeMenu: "Close navigation menu",
    english: "English",
    sinhala: "සිංහල",
  },
  si: {
    navLinks: [
      { href: "/", label: "මුල් පිටුව" },
      { href: "/services", label: "සේවා" },
      { href: "/about", label: "අප ගැන" },
      { href: "/contact", label: "සම්බන්ධ වන්න" },
    ],
    bookNow: "දැන් වෙන්කරන්න",
    cart: "කරත්තය",
    profile: "පැතිකඩ",
    goHome: "AutoFlash මුල් පිටුවට යන්න",
    openMenu: "සංචාලන මෙනුව විවෘත කරන්න",
    closeMenu: "සංචාලන මෙනුව වසන්න",
    english: "English",
    sinhala: "සිංහල",
  },
} as const;

const getAuthToken = () =>
  window.localStorage.getItem("token") ||
  window.localStorage.getItem("authToken") ||
  window.localStorage.getItem("accessToken");

const Header = () => {
  const router = useRouter();
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [profileImage, setProfileImage] = useState("");
  const [cartCount, setCartCount] = useState(0);
  const { language, setLanguage } = useLanguage();
  const t = copy[language];

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);

    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const closeNavigation = window.setTimeout(() => {
      setMenuOpen(false);
      setShowModal(false);
    }, 0);

    return () => window.clearTimeout(closeNavigation);
  }, [pathname]);

  useEffect(() => {
    let ignore = false;

    const fetchProfileImage = async () => {
      const token = getAuthToken();

      if (!token) {
        if (!ignore) setProfileImage("");
        return;
      }

      try {
        const res = await fetch("/api/profile/me", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) return;

        const data = await res.json();
        const nextProfileImage =
          typeof data?.user?.profileImage === "string" ? data.user.profileImage : "";

        if (!ignore) setProfileImage(nextProfileImage);
      } catch {
        if (!ignore) setProfileImage("");
      }
    };

    fetchProfileImage();

    return () => {
      ignore = true;
    };
  }, [pathname]);

  useEffect(() => {
    const syncCartCount = () => setCartCount(getCartItems().length);

    syncCartCount();
    window.addEventListener("storage", syncCartCount);
    window.addEventListener(CART_EVENT, syncCartCount);

    return () => {
      window.removeEventListener("storage", syncCartCount);
      window.removeEventListener(CART_EVENT, syncCartCount);
    };
  }, []);

  const openProfile = () => {
    const token = getAuthToken();

    if (!token) {
      window.localStorage.setItem("redirectAfterLogin", "/record");
      router.push("/login");
      return;
    }

    router.push("/record");
  };

  return (
    <>
      <header className={`${styles.header} ${scrolled ? styles.scrolled : ""}`}>
        <Link href="/" className={styles.logoWrapper} aria-label={t.goHome}>
          <Image src="/AFLOGO.png" alt="AutoFlash Logo" width={250} height={100} priority />
        </Link>

        <nav className={styles.nav} aria-label="Primary navigation">
          {t.navLinks.map((link) => (
            <Link key={link.href} href={link.href}>
              {link.label}
            </Link>
          ))}
        </nav>

        <div className={styles.headerActions}>
          <div className={styles.languageSwitch}>
            <button
              type="button"
              className={language === "en" ? styles.languageActive : ""}
              onClick={() => setLanguage("en")}
            >
              {t.english}
            </button>
            <button
              type="button"
              className={language === "si" ? styles.languageActive : ""}
              onClick={() => setLanguage("si")}
            >
              {t.sinhala}
            </button>
          </div>

          <button type="button" className={styles.bookingBtn} onClick={() => setShowModal(true)}>
            {t.bookNow}
          </button>

          <Link
            href="/cart"
            className={styles.cartLink}
            aria-label={t.cart}
            title={t.cart}
          >
            <FaShoppingCart />
            {cartCount > 0 && <span>{cartCount}</span>}
          </Link>

          <button
            type="button"
            className={styles.profileLink}
            aria-label={t.profile}
            title={t.profile}
            onClick={openProfile}
          >
            {profileImage ? (
              <Image
                src={profileImage}
                alt=""
                width={42}
                height={42}
                className={styles.profileImage}
                unoptimized
              />
            ) : (
              <FaUserCircle />
            )}
          </button>
        </div>

        <button
          type="button"
          className={`${styles.hamburger} ${menuOpen ? styles.open : ""}`}
          aria-label={menuOpen ? t.closeMenu : t.openMenu}
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen(!menuOpen)}
        >
          <span></span>
          <span></span>
          <span></span>
        </button>

        <div className={styles.mobileRightActions}>
          <button
            type="button"
            className={styles.profileLink}
            aria-label={t.profile}
            title={t.profile}
            onClick={openProfile}
          >
            {profileImage ? (
              <Image
                src={profileImage}
                alt=""
                width={35}
                height={35}
                className={styles.profileImage}
                unoptimized
              />
            ) : (
              <FaUserCircle />
            )}
          </button>

          <button
            type="button"
            className={styles.mobileHeaderLanguage}
            onClick={() => setLanguage(language === "en" ? "si" : "en")}
          >
            {language === "en" ? "SI" : "EN"}
          </button>
        </div>

        <div className={`${styles.mobileMenu} ${menuOpen ? styles.show : ""}`}>
          <div className={styles.mobileLanguageSwitch}>
            <button
              type="button"
              className={language === "en" ? styles.languageActive : ""}
              onClick={() => setLanguage("en")}
            >
              {t.english}
            </button>
            <button
              type="button"
              className={language === "si" ? styles.languageActive : ""}
              onClick={() => setLanguage("si")}
            >
              {t.sinhala}
            </button>
          </div>

          {t.navLinks.map((link) => (
            <Link key={link.href} href={link.href} onClick={() => setMenuOpen(false)}>
              {link.label}
            </Link>
          ))}

          <button
            type="button"
            className={styles.bookingBtn}
            onClick={() => {
              setMenuOpen(false);
              setShowModal(true);
            }}
          >
            {t.bookNow}
          </button>

          <Link href="/cart" onClick={() => setMenuOpen(false)}>
            <FaShoppingCart />
            {t.cart} {cartCount > 0 ? `(${cartCount})` : ""}
          </Link>

          <button
            type="button"
            className={styles.mobileProfileLink}
            onClick={() => {
              setMenuOpen(false);
              openProfile();
            }}
          >
            {profileImage ? (
              <Image
                src={profileImage}
                alt=""
                width={28}
                height={28}
                className={styles.mobileProfileImage}
                unoptimized
              />
            ) : (
              <FaUserCircle />
            )}
            {t.profile}
          </button>
        </div>
      </header>

      {showModal && <ServiceSelectorModal onClose={() => setShowModal(false)} />}
    </>
  );
};

export default Header;
