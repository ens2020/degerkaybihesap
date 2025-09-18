import Link from 'next/link';

export default function HomePage() {
  return (
    <main>
      <section>
        <h1>Değer Kaybı Hizmetleri</h1>
        <p>Vatandaş ve profesyoneller için uçtan uca değer kaybı başvuru platformu.</p>
        <nav style={{ display: 'flex', gap: '1rem' }}>
          <Link href="/citizen">Vatandaş Paneli</Link>
          <Link href="/pro">Profesyonel Giriş</Link>
        </nav>
      </section>
    </main>
  );
}
