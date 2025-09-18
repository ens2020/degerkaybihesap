import request from 'supertest';
import { app } from '../src/app.js';
import { clearLogs } from '../src/common/logger.js';
import { emailService } from '../src/notifications/emailService.js';
import { resetCitizenRequests } from '../src/citizen_requests/service.js';
import { resetProfessionalData } from '../src/pro_subscriptions/service.js';

describe('Integration flow', () => {
  beforeEach(() => {
    clearLogs();
    emailService.clear();
    resetCitizenRequests();
    resetProfessionalData();
  });

  it('handles citizen flow end-to-end', async () => {
    const createResponse = await request(app)
      .post('/citizen/accidents')
      .send({
        citizenName: 'Kemal Öz',
        email: 'kemal@example.com',
        licensePlate: '35GHI789',
        accidentDate: '2024-01-05'
      });
    expect(createResponse.status).toBe(200);
    const id = createResponse.body.id as string;

    const documentResponse = await request(app)
      .post(`/citizen/accidents/${id}/document`)
      .attach('document', Buffer.from('Plaka: 35GHI789\nTarih: 2024-01-05'), 'kazatutulugu.txt');
    expect(documentResponse.status).toBe(200);

    const payResponse = await request(app)
      .post(`/citizen/accidents/${id}/pay`)
      .send({ amount: 1200 });
    expect(payResponse.status).toBe(200);
    expect(payResponse.body.petitionUrl).toContain(id);

    const petition = await request(app).get(`/citizen/accidents/${id}/petition`);
    expect(petition.status).toBe(200);
    expect(petition.headers['content-type']).toBe('application/pdf');
  });
});
