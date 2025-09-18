import crypto from 'node:crypto';
import { logger } from '../common/logger.js';
import { emailService } from '../notifications/emailService.js';
import { paymentProvider } from '../payments/index.js';
import {
  createCitizenRequest,
  completePayment,
  listCitizenRequests
} from '../citizen_requests/service.js';

interface ProfessionalUser {
  id: string;
  email: string;
  passwordHash: string;
  subscriptionStatus: 'inactive' | 'active';
  subscriptionId?: string;
}

interface Session {
  token: string;
  userId: string;
}

const users = new Map<string, ProfessionalUser>();
const sessions = new Map<string, Session>();

function hashPassword(password: string) {
  return crypto.createHash('sha256').update(password).digest('hex');
}

export function registerProfessional(email: string, password: string) {
  if (users.has(email)) {
    throw new Error('Kullanıcı mevcut');
  }
  const user: ProfessionalUser = {
    id: `pro_${Date.now()}`,
    email,
    passwordHash: hashPassword(password),
    subscriptionStatus: 'inactive'
  };
  users.set(email, user);
  logger.info('pro.user.registered', { email });
  return { id: user.id, email: user.email };
}

export function loginProfessional(email: string, password: string) {
  const user = users.get(email);
  if (!user || user.passwordHash !== hashPassword(password)) {
    throw new Error('Geçersiz giriş');
  }
  const token = crypto.randomBytes(16).toString('hex');
  sessions.set(token, { token, userId: user.id });
  logger.info('pro.user.login', { email });
  return { token, user: { id: user.id, email: user.email, subscriptionStatus: user.subscriptionStatus } };
}

export async function subscribeProfessional(token: string, planId: string) {
  const user = getUserByToken(token);
  const result = await paymentProvider.createSubscription({ customerEmail: user.email, planId });
  user.subscriptionStatus = result.status === 'active' ? 'active' : 'inactive';
  user.subscriptionId = result.id;
  users.set(user.email, user);
  await emailService.send({
    to: user.email,
    subject: 'Abonelik Başladı',
    body: 'Profesyonel aboneliğiniz aktifleştirilmiştir.'
  });
  logger.info('pro.subscription.activated', { email: user.email, subscriptionId: result.id });
  return { subscriptionId: result.id, status: user.subscriptionStatus };
}

function getUserByToken(token: string): ProfessionalUser {
  const session = sessions.get(token);
  if (!session) {
    throw new Error('Oturum bulunamadı');
  }
  const user = Array.from(users.values()).find((u) => u.id === session.userId);
  if (!user) {
    throw new Error('Kullanıcı bulunamadı');
  }
  return user;
}

export function getSubscriptionStatus(token: string) {
  const user = getUserByToken(token);
  return { status: user.subscriptionStatus, subscriptionId: user.subscriptionId };
}

export async function createProfessionalCase(token: string, payload: {
  citizenName: string;
  email: string;
  licensePlate: string;
  accidentDate: string;
  description?: string;
}) {
  const user = getUserByToken(token);
  if (user.subscriptionStatus !== 'active') {
    throw new Error('Aktif abonelik gereklidir');
  }
  const request = createCitizenRequest(payload, 'professional');
  const result = await completePayment(request.id, 1);
  logger.info('pro.case.created', { user: user.email, requestId: request.id });
  return result;
}

export function listProfessionalPetitions(token: string) {
  getUserByToken(token);
  return listCitizenRequests()
    .filter((request) => request.status === 'paid' && request.petitionPath && request.createdBy === 'professional')
    .map((request) => ({
      id: request.id,
      citizenName: request.citizenName,
      licensePlate: request.licensePlate,
      accidentDate: request.accidentDate,
      petitionUrl: `/citizen/accidents/${request.id}/petition`
    }));
}

export function resetProfessionalData() {
  users.clear();
  sessions.clear();
}
