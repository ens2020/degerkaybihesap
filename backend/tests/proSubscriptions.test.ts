import { emailService } from '../src/notifications/emailService.js';
import { resetCitizenRequests } from '../src/citizen_requests/service.js';
import {
  createProfessionalCase,
  getSubscriptionStatus,
  loginProfessional,
  registerProfessional,
  resetProfessionalData,
  subscribeProfessional
} from '../src/pro_subscriptions/service.js';

describe('Professional subscriptions', () => {
  beforeEach(() => {
    resetProfessionalData();
    resetCitizenRequests();
    emailService.clear();
  });

  it('registers, logs in, subscribes and creates case', async () => {
    registerProfessional('avukat@example.com', 'secret123');
    const login = loginProfessional('avukat@example.com', 'secret123');
    await subscribeProfessional(login.token, 'pro-plan');
    const status = getSubscriptionStatus(login.token);
    expect(status.status).toBe('active');

    const result = await createProfessionalCase(login.token, {
      citizenName: 'Ayşe Yılmaz',
      email: 'ayse@example.com',
      licensePlate: '06DEF456',
      accidentDate: '2024-02-02',
      description: 'Boya hasarı'
    });

    expect(result.petitionId).toBeDefined();
    expect(result.requestId).toBeDefined();
  });

  it('prevents case creation without subscription', async () => {
    registerProfessional('takipci@example.com', '123456');
    const login = loginProfessional('takipci@example.com', '123456');
    await expect(
      createProfessionalCase(login.token, {
        citizenName: 'Test',
        email: 'test@example.com',
        licensePlate: '34AAA555',
        accidentDate: '2024-03-01'
      })
    ).rejects.toThrow('Aktif abonelik gereklidir');
  });
});
