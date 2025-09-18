import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ProfessionalCaseForm } from '../../components/ProfessionalCaseForm';

const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL ?? 'http://localhost:4000';

type Petition = {
  id: string;
  citizenName: string;
  licensePlate: string;
  accidentDate: string;
  petitionUrl: string;
};

export default function ProfessionalDashboard() {
  const [token, setToken] = useState<string | null>(null);
  const [status, setStatus] = useState<'inactive' | 'active' | 'unknown'>('unknown');
  const [petitions, setPetitions] = useState<Petition[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = window.localStorage.getItem('proToken');
      if (saved) {
        setToken(saved);
      }
    }
  }, []);

  useEffect(() => {
    if (token) {
      refreshStatus(token);
      refreshPetitions(token);
    }
  }, [token]);

  const refreshStatus = async (authToken: string) => {
    try {
      const response = await fetch(`${backendUrl}/pro/subscriptions/status?token=${authToken}`);
      const json = await response.json();
      if (!response.ok) {
        throw new Error(json.error ?? 'Durum alınamadı');
      }
      setStatus(json.status ?? 'inactive');
    } catch (err) {
      setStatus('inactive');
      setError(err instanceof Error ? err.message : 'Durum alınamadı');
    }
  };

  const refreshPetitions = async (authToken: string) => {
    try {
      const response = await fetch(`${backendUrl}/pro/petitions?token=${authToken}`);
      const json = await response.json();
      if (!response.ok) {
        throw new Error(json.error ?? 'Dilekçeler alınamadı');
      }
      setPetitions(json.petitions ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Dilekçeler alınamadı');
    }
  };

  const subscribe = async () => {
    if (!token) {
      setError('Önce giriş yapın.');
      return;
    }
    setError(null);
    setMessage(null);
    try {
      const response = await fetch(`${backendUrl}/pro/subscriptions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, planId: 'pro-plan' })
      });
      const json = await response.json();
      if (!response.ok) {
        throw new Error(json.error ?? 'Abonelik başarısız');
      }
      setMessage('Abonelik aktifleştirildi.');
      refreshStatus(token);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Abonelik başarısız');
    }
  };

  const handleCreated = () => {
    if (token) {
      refreshPetitions(token);
      setMessage('Dilekçe başarıyla oluşturuldu.');
    }
  };

  return (
    <main>
      <Link href="/pro">← Profesyonel Giriş</Link>
      <section>
        <h1>Profesyonel Panel</h1>
        <p>Abonelik durumunuza göre dilekçeleri yönetin.</p>
        <p>Abonelik durumu: {status === 'unknown' ? 'yükleniyor...' : status}</p>
        <button onClick={subscribe} disabled={status === 'active'}>
          {status === 'active' ? 'Abonelik Aktif' : 'Aboneliği Başlat'}
        </button>
      </section>

      <ProfessionalCaseForm token={token} onCreated={handleCreated} />

      <section>
        <h2>Oluşturulan Dilekçeler</h2>
        {petitions.length === 0 ? (
          <p>Henüz dilekçe bulunmuyor.</p>
        ) : (
          <ul>
            {petitions.map((petition) => (
              <li key={petition.id} style={{ marginBottom: '0.75rem' }}>
                <strong>{petition.citizenName}</strong> - {petition.licensePlate} - {petition.accidentDate}{' '}
                <a href={`${backendUrl}${petition.petitionUrl}`} target="_blank" rel="noreferrer">
                  Dilekçeyi İndir
                </a>
              </li>
            ))}
          </ul>
        )}
      </section>

      {message && <p style={{ color: '#08660b' }}>{message}</p>}
      {error && <p style={{ color: '#c00' }}>{error}</p>}
    </main>
  );
}
