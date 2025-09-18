import { FormEvent, useState } from 'react';

const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL ?? 'http://localhost:4000';

type PetitionResult = {
  petitionUrl: string;
  petitionEmail: string;
};

export function CitizenForm() {
  const [citizenName, setCitizenName] = useState('');
  const [email, setEmail] = useState('');
  const [licensePlate, setLicensePlate] = useState('');
  const [accidentDate, setAccidentDate] = useState('');
  const [description, setDescription] = useState('');
  const [document, setDocument] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [petition, setPetition] = useState<PetitionResult | null>(null);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError(null);
    setPetition(null);

    try {
      let id: string;
      if (document) {
        const formData = new FormData();
        formData.append('citizenName', citizenName);
        formData.append('email', email);
        formData.append('licensePlate', licensePlate);
        formData.append('accidentDate', accidentDate);
        formData.append('description', description);
        formData.append('document', document);
        const createResponse = await fetch(`${backendUrl}/citizen/accidents`, {
          method: 'POST',
          body: formData
        });
        const createJson = await createResponse.json();
        if (!createResponse.ok) {
          throw new Error(createJson.error ?? 'Talep oluşturulamadı');
        }
        id = createJson.id;
      } else {
        const createResponse = await fetch(`${backendUrl}/citizen/accidents`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ citizenName, email, licensePlate, accidentDate, description })
        });
        const createJson = await createResponse.json();
        if (!createResponse.ok) {
          throw new Error(createJson.error ?? 'Talep oluşturulamadı');
        }
        id = createJson.id;
      }

      const payResponse = await fetch(`${backendUrl}/citizen/accidents/${id}/pay`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: 1500 })
      });
      const payJson = await payResponse.json();
      if (!payResponse.ok) {
        throw new Error(payJson.error ?? 'Ödeme başarısız');
      }

      setPetition({
        petitionUrl: `${backendUrl}${payJson.petitionUrl}`,
        petitionEmail: payJson.petitionEmail
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Bilinmeyen hata');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section>
      <h2>Vatandaş Başvurusu</h2>
      <form onSubmit={submit}>
        <input
          required
          placeholder="Ad Soyad"
          value={citizenName}
          onChange={(event) => setCitizenName(event.target.value)}
        />
        <input
          required
          type="email"
          placeholder="E-posta"
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
        <input type="file" accept=".pdf,.txt" onChange={(event) => setDocument(event.target.files?.[0] ?? null)} />
        <button type="submit" disabled={loading}>
          {loading ? 'İşleniyor...' : 'Başvuru Oluştur'}
        </button>
      </form>
      {error && <p style={{ color: '#c00' }}>{error}</p>}
      {petition && (
        <div>
          <p>Dilekçe e-posta adresinizle paylaşılmıştır: {petition.petitionEmail}</p>
          <a href={petition.petitionUrl} target="_blank" rel="noreferrer">
            Dilekçeyi İndir
          </a>
        </div>
      )}
    </section>
  );
}
