"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useAdminLanguage } from "@/components/providers/AdminLanguageProvider";
import ThemeToggleButton from "@/components/ThemeToggleButton/ThemeToggleButton";
import styles from "./login.module.css";

const copy = {
  en: {
    kicker: "Admin Portal",
    title: "Keep the operation moving from one clean control room.",
    description:
      "Sign in to manage bookings, customers, vehicles, services, and record books across the AutoFlash admin workspace.",
    metrics: [
      {
        title: "Bookings",
        copy: "Track new, in-progress, and completed work in one place.",
      },
      {
        title: "Customers",
        copy: "Review customer details quickly while handling requests.",
      },
      {
        title: "Record Books",
        copy: "Open service history and digital records without context switching.",
      },
    ],
    formKicker: "Secure sign in",
    formTitle: "Autoflash Admin",
    formCopy: "Use your team email and password to continue.",
    email: "Email",
    emailPlaceholder: "admin@autoflash.com",
    password: "Password",
    passwordPlaceholder: "Enter your password",
    error: "Invalid email or password.",
    loading: "Authenticating...",
    submit: "Login",
  },
  si: {
    kicker: "පරිපාලක ද්වාරය",
    title: "එකම පාලන කාමරයකින් දෛනික වැඩ ප්‍රවාහය ඉක්මනින් පවත්වා ගන්න.",
    description:
      "AutoFlash පරිපාලන පද්ධතියෙන් වෙන්කිරීම්, ගනුදෙනුකරුවන්, වාහන, සේවා සහ වාර්තා පොත් කළමනාකරණය කිරීමට පිවිසෙන්න.",
    metrics: [
      {
        title: "වෙන්කිරීම්",
        copy: "නව, ක්‍රියාත්මක වන සහ සම්පූර්ණ වූ කාර්යයන් එක තැනකින් නිරීක්ෂණය කරන්න.",
      },
      {
        title: "ගනුදෙනුකරුවන්",
        copy: "ඉල්ලීම් හැසිරවීමේදී ගනුදෙනුකරු තොරතුරු ඉක්මනින් බලන්න.",
      },
      {
        title: "වාර්තා පොත්",
        copy: "සන්දර්භය මාරු නොකර සේවා ඉතිහාසය සහ ඩිජිටල් වාර්තා විවෘත කරන්න.",
      },
    ],
    formKicker: "ආරක්ෂිත පිවිසුම",
    formTitle: "Autoflash Admin",
    formCopy: "ඉදිරියට යාම සඳහා ඔබගේ කණ්ඩායම් ඊමේල් ලිපිනය සහ මුරපදය භාවිත කරන්න.",
    email: "ඊමේල්",
    emailPlaceholder: "admin@autoflash.com",
    password: "මුරපදය",
    passwordPlaceholder: "ඔබගේ මුරපදය ඇතුළත් කරන්න",
    error: "ඊමේල් ලිපිනය හෝ මුරපදය වැරදියි.",
    loading: "සත්‍යාපනය වෙමින්...",
    submit: "පිවිසෙන්න",
  },
} as const;

export default function LoginPage() {
  const router = useRouter();
  const { language } = useAdminLanguage();
  const t = copy[language];

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      await signInWithEmailAndPassword(auth, email.trim(), password);
      router.push("/");
      router.refresh();
    } catch {
      setError(t.error);
      setLoading(false);
    }
  };

  return (
    <main className={styles.page}>
      <section className={styles.hero}>
        <div className={styles.brandPanel}>
          <div className={styles.topBar}>
            <p className={styles.kicker}>{t.kicker}</p>
            <ThemeToggleButton />
          </div>
          <h1>{t.title}</h1>
          <p className={styles.description}>
            {t.description}
          </p>

          <div className={styles.metrics}>
            {t.metrics.map((metric) => (
              <div key={metric.title}>
                <strong>{metric.title}</strong>
                <span>{metric.copy}</span>
              </div>
            ))}
          </div>
        </div>

        <form className={styles.formCard} onSubmit={handleLogin}>
          <div className={styles.formHeader}>
            <p>{t.formKicker}</p>
            <h2>{t.formTitle}</h2>
            <span>{t.formCopy}</span>
          </div>

          <label className={styles.field}>
            <span>{t.email}</span>
            <input
              type="email"
              placeholder={t.emailPlaceholder}
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
              disabled={loading}
            />
          </label>

          <label className={styles.field}>
            <span>{t.password}</span>
            <input
              type="password"
              placeholder={t.passwordPlaceholder}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
              disabled={loading}
            />
          </label>

          {error ? <p className={styles.error}>{error}</p> : null}

          <button type="submit" disabled={loading} className={styles.submitButton}>
            {loading ? t.loading : t.submit}
          </button>
        </form>
      </section>
    </main>
  );
}
