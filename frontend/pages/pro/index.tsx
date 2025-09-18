import { FormEvent, useEffect, useState } from 'react';
import Link from 'next/link';

const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL ?? 'http://localhost:4000';

export default function ProfessionalAuthPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = window.localStorage.getItem('proToken');
      if (saved) {
        setToken(saved);
      }
    }
  }, []);

  const register = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setMessage(null);
    try {
      const response = await fetch(`${backendUrl}/pro/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const json = await response.json();
      if (!response.ok) {
        throw new Error(json.error ?? 'Kayıt başarısız');
      }
      setMessage('Kayıt başarılı. Şimdi giriş yapabilirsiniz.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Bilinmeyen hata');
    }
  };

  const login = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setMessage(null);
    try {
      const response = await fetch(`${backendUrl}/pro/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const json = await response.json();
      if (!response.ok) {
        throw new Error(json.error ?? 'Giriş başarısız');
      }
      if (typeof window !== 'undefined') {
        window.localStorage.setItem('proToken', json.token);
      }
      setToken(json.token);
      setMessage('Giriş başarılı. Aboneliğinizi kontrol edin.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Bilinmeyen hata');
    }
  };

  return (
    <main>
      <Link href="/">← Ana Sayfa</Link>
      <section>
        <h2>Profesyonel Kayıt</h2>
        <form onSubmit={register}>
          <input
            required
            type="email"
            placeholder="E-posta"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
          <input
            required
            type="password"
            placeholder="Şifre"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
          <button type="submit">Kayıt Ol</button>
        </form>
      </section>

      <section>
        <h2>Profesyonel Giriş</h2>
        <form onSubmit={login}>
          <input
            required
            type="email"
            placeholder="E-posta"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
          <input
            required
            type="password"
            placeholder="Şifre"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
          <button type="submit">Giriş Yap</button>
        </form>
      </section>

      {message && <p style={{ color: '#08660b' }}>{message}</p>}
      {error && <p style={{ color: '#c00' }}>{error}</p>}

      {token && (
        <section>
          <p>Dashboard erişimi için devam edin.</p>
          <Link href="/pro/dashboard">Profesyonel Panel</Link>
        </section>
      )}
    </main>
  );
}
