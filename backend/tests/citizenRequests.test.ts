import fs from 'node:fs';
import path from 'node:path';
import { clearLogs } from '../src/common/logger.js';
import { emailService } from '../src/notifications/emailService.js';
import {
  attachDocument,
  completePayment,
  createCitizenRequest,
  getPetitionPath,
  resetCitizenRequests
} from '../src/citizen_requests/service.js';

describe('Citizen requests', () => {
  beforeEach(() => {
    clearLogs();
    emailService.clear();
    resetCitizenRequests();
  });

  it('creates request and completes payment with generated petition', async () => {
    const request = createCitizenRequest({
      citizenName: 'Ali Veli',
      email: 'ali@example.com',
      licensePlate: '34ABC123',
      accidentDate: '2024-01-12',
      description: 'Arka tampon hasarı'
    });

    const documentBuffer = Buffer.from('Plaka: 34ABC123\nTarih: 2024-01-12\nAdı: Ali Veli');
    await attachDocument(request.id, documentBuffer);

    const result = await completePayment(request.id, 1500);
    expect(result.petitionId).toBeDefined();
    expect(result.petitionEmail).toBe('ali@example.com');

    const petitionPath = getPetitionPath(request.id);
    expect(fs.existsSync(petitionPath)).toBe(true);
    const stats = fs.statSync(petitionPath);
    expect(stats.size).toBeGreaterThan(100);
  });

  it('throws on invalid plate from document', async () => {
    const request = createCitizenRequest({
      citizenName: 'Test',
      email: 'test@example.com',
      licensePlate: '34AAA111',
      accidentDate: '2023-11-01'
    });
    const invalidDoc = Buffer.from('Plaka: XX\nTarih: 2023-11-01');
    await expect(attachDocument(request.id, invalidDoc)).rejects.toThrow('Geçersiz plaka formatı');
  });
});
