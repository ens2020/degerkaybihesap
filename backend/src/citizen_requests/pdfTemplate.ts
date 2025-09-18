import PDFDocument from 'pdfkit';
import fs from 'node:fs';
import path from 'node:path';
import { PetitionPayload } from './types.js';

export async function generatePetition(payload: PetitionPayload): Promise<string> {
  const doc = new PDFDocument();
  const filePath = path.join(process.cwd(), 'generated', `petition_${Date.now()}.pdf`);
  await fs.promises.mkdir(path.dirname(filePath), { recursive: true });
  const stream = fs.createWriteStream(filePath);
  doc.pipe(stream);

  doc.fontSize(16).text('Değer Kaybı Başvuru Dilekçesi', { align: 'center' });
  doc.moveDown();
  doc.fontSize(12).text(`Sayın Yetkili,`, { align: 'left' });
  doc.moveDown();
  doc.text(
    `${payload.citizenName} adına ${payload.accidentDate} tarihinde gerçekleşen trafik kazasına ilişkin ` +
      `${payload.licensePlate} plakalı araç için değer kaybı talebimizi bilgilerinize sunarız.`
  );
  if (payload.description) {
    doc.moveDown();
    doc.text(`Kaza Detayı: ${payload.description}`);
  }
  doc.moveDown();
  doc.text('İlgili evraklar ekte sunulmuştur. Gereğini arz ederiz.');
  doc.moveDown();
  doc.text(`İletişim: ${payload.email}`);

  doc.end();

  await new Promise<void>((resolve, reject) => {
    stream.on('finish', () => resolve());
    stream.on('error', reject);
  });

  return filePath;
}
