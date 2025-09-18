import Link from 'next/link';
import { CitizenForm } from '../components/CitizenForm';

export default function CitizenPage() {
  return (
    <main>
      <Link href="/">← Ana Sayfa</Link>
      <CitizenForm />
    </main>
  );
}
