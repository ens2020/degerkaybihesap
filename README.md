# Değer Kaybı Başvuru Platformu

Bu monorepo vatandaşların kaza kaynaklı değer kaybı başvurularını yönetebileceği ve profesyonellerin çoklu dilekçe hazırlayabileceği uçtan uca bir çözüm sunar.

## Dizim Yapısı

- `backend/`: Express tabanlı REST API
- `frontend/`: Next.js tabanlı istemci arayüzü

## Başlangıç

Aşağıdaki komutlar bağımlılıkları kurar ve servisleri başlatır:

```bash
cd backend
npm install
npm run dev
```

Ayrı bir terminalde:

```bash
cd frontend
npm install
npm run dev
```

Varsayılan olarak backend `http://localhost:4000` üzerinde çalışır. Frontend bileşenleri `NEXT_PUBLIC_BACKEND_URL` ortam değişkeni ile farklı API adresine yönlendirilebilir.

## Testler

Backend birim ve entegrasyon testleri:

```bash
cd backend
npm test
```

Frontend için Next.js yerleşik lint komutu:

```bash
cd frontend
npm run lint
```
