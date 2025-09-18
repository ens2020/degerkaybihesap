import fs from 'node:fs';
import path from 'node:path';
import { logger } from '../common/logger.js';
import { emailService } from '../notifications/emailService.js';
import { paymentProvider } from '../payments/index.js';
import { generatePetition } from './pdfTemplate.js';
import type { AccidentInput, CitizenRequest } from './types.js';

const citizenRequests = new Map<string, CitizenRequest>();

function validateAccident(input: AccidentInput) {
  if (!input.citizenName || !input.email) {
    throw new Error('Vatandaş bilgileri zorunludur');
  }
  if (!/^[A-Z0-9]{2,}-?[A-Z0-9]{2,}$/.test(input.licensePlate.replace(/\s+/g, '').toUpperCase())) {
    throw new Error('Geçersiz plaka formatı');
  }
  if (Number.isNaN(Date.parse(input.accidentDate))) {
    throw new Error('Geçersiz kaza tarihi');
  }
}

export function createCitizenRequest(input: AccidentInput, createdBy: 'citizen' | 'professional' = 'citizen'): CitizenRequest {
  validateAccident(input);
  const id = `cit_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
  const request: CitizenRequest = { ...input, id, status: 'awaiting_payment', createdBy };
  citizenRequests.set(id, request);
  logger.info('citizen.request.created', { id, email: input.email });
  return request;
}

export function parseDocument(buffer: Buffer): Partial<AccidentInput> {
  const text = buffer.toString('utf-8');
  const plate = text.match(/Plaka\s*:?\s*([A-Z0-9-]+)/i)?.[1];
  const date = text.match(/Tarih\s*:?\s*([0-9]{4}-[0-9]{2}-[0-9]{2})/i)?.[1];
  const name = text.match(/Ad[ıi]\s*:?\s*([A-Za-zÇÖŞÜĞİçöşüğış\s]+)/i)?.[1];
  if (!plate || !date) {
    throw new Error('Dokümandan plaka veya tarih bulunamadı');
  }
  return {
    citizenName: name?.trim(),
    licensePlate: plate.trim(),
    accidentDate: date.trim()
  };
}

export async function attachDocument(id: string, buffer: Buffer) {
  const request = citizenRequests.get(id);
  if (!request) {
    throw new Error('Talep bulunamadı');
  }
  const parsed = parseDocument(buffer);
  const updated: CitizenRequest = {
    ...request,
    citizenName: parsed.citizenName ?? request.citizenName,
    licensePlate: parsed.licensePlate ?? request.licensePlate,
    accidentDate: parsed.accidentDate ?? request.accidentDate,
    documentText: buffer.toString('utf-8')
  };
  validateAccident(updated);
  citizenRequests.set(id, updated);
  logger.info('citizen.request.document_attached', { id });
  return updated;
}

export async function completePayment(id: string, amount: number) {
  const request = citizenRequests.get(id);
  if (!request) {
    throw new Error('Talep bulunamadı');
  }
  const charge = await paymentProvider.charge({
    amount,
    currency: 'TRY',
    source: 'test-token',
    metadata: { requestId: id }
  });
  if (charge.status !== 'succeeded') {
    request.status = 'awaiting_payment';
    citizenRequests.set(id, request);
    throw new Error('Ödeme başarısız');
  }

  const petitionPath = await generatePetition(request);
  request.status = 'paid';
  request.petitionId = `petition_${Date.now()}`;
  request.petitionPath = petitionPath;
  citizenRequests.set(id, request);

  await emailService.send({
    to: request.email,
    subject: 'Değer Kaybı Başvurunuz',
    body: 'Ödemeniz alınmıştır. Dilekçeniz hazırdır.'
  });

  logger.info('citizen.request.payment_completed', { id });

  return {
    requestId: id,
    petitionId: request.petitionId,
    petitionEmail: request.email,
    petitionPath
  };
}

export function listCitizenRequests() {
  return Array.from(citizenRequests.values());
}

export function getPetitionPath(id: string) {
  const request = citizenRequests.get(id);
  if (!request || !request.petitionPath) {
    throw new Error('Dilekçe bulunamadı');
  }
  return request.petitionPath;
}

export function resetCitizenRequests() {
  citizenRequests.clear();
  const generatedDir = path.join(process.cwd(), 'generated');
  if (fs.existsSync(generatedDir)) {
    fs.rmSync(generatedDir, { recursive: true, force: true });
  }
}
