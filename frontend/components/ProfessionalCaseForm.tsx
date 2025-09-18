import { FormEvent, useState } from 'react';

const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL ?? 'http://localhost:4000';

type Props = {
  token: string | null;
  onCreated: () => void;
};

export function ProfessionalCaseForm({ token, onCreated }: Props) {
  const [citizenName, setCitizenName] = useState('');
  const [email, setEmail] = useState('');
  const [licensePlate, setLicensePlate] = useState('');
  const [accidentDate, setAccidentDate] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!token) {
      setError('Önce giriş yapın ve aboneliği etkinleştirin.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${backendUrl}/pro/cases`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token,
          citizenName,
          email,
          licensePlate,
          accidentDate,
          description
        })
      });
      const json = await response.json();
      if (!response.ok) {
        throw new Error(json.error ?? 'Dilekçe oluşturulamadı');
      }
      onCreated();
      setCitizenName('');
      setEmail('');
      setLicensePlate('');
      setAccidentDate('');
      setDescription('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Bilinmeyen hata');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section>
      <h2>Profesyonel Dilekçe Oluşturma</h2>
      <form onSubmit={submit}>
        <input
          required
          placeholder="Vatandaş Adı"
          value={citizenName}
          onChange={(event) => setCitizenName(event.target.value)}
        />
        <input
          required
          type="email"
          placeholder="Vatandaş E-posta"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
        />
        <input
          required
          placeholder="Plaka"
          value={licensePlate}
          onChange={(event) => setLicensePlate(event.target.value)}
        />
        <input
          required
          type="date"
          value={accidentDate}
          onChange={(event) => setAccidentDate(event.target.value)}
        />
        <textarea
          placeholder="Kaza Açıklaması"
          value={description}
          onChange={(event) => setDescription(event.target.value)}
        />
        <button type="submit" disabled={loading}>
          {loading ? 'Kaydediliyor...' : 'Dilekçe Oluştur'}
        </button>
      </form>
      {error && <p style={{ color: '#c00' }}>{error}</p>}
    </section>
  );
}
