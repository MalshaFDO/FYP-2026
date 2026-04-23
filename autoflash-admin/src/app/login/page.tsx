"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase";
import styles from "./login.module.css";

export default function LoginPage() {
  const router = useRouter();

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
      setError("Invalid email or password.");
      setLoading(false);
    }
  };

  return (
    <main className={styles.page}>
      <section className={styles.hero}>
        <div className={styles.brandPanel}>
          <p className={styles.kicker}>Admin Portal</p>
          <h1>Keep the operation moving from one clean control room.</h1>
          <p className={styles.description}>
            Sign in to manage bookings, customers, vehicles, services, and record
            books across the AutoFlash admin workspace.
          </p>

          <div className={styles.metrics}>
            <div>
              <strong>Bookings</strong>
              <span>Track new, in-progress, and completed work in one place.</span>
            </div>
            <div>
              <strong>Customers</strong>
              <span>Review customer details quickly while handling requests.</span>
            </div>
            <div>
              <strong>Record Books</strong>
              <span>Open service history and digital records without context switching.</span>
            </div>
          </div>
        </div>

        <form className={styles.formCard} onSubmit={handleLogin}>
          <div className={styles.formHeader}>
            <p>Secure sign in</p>
            <h2>Autoflash Admin</h2>
            <span>Use your team email and password to continue.</span>
          </div>

          <label className={styles.field}>
            <span>Email</span>
            <input
              type="email"
              placeholder="admin@autoflash.com"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
              disabled={loading}
            />
          </label>

          <label className={styles.field}>
            <span>Password</span>
            <input
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
              disabled={loading}
            />
          </label>

          {error ? <p className={styles.error}>{error}</p> : null}

          <button type="submit" disabled={loading} className={styles.submitButton}>
            {loading ? "Authenticating..." : "Login"}
          </button>
        </form>
      </section>
    </main>
  );
}
