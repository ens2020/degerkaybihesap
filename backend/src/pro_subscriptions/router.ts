import { Router } from 'express';
import {
  createProfessionalCase,
  getSubscriptionStatus,
  listProfessionalPetitions,
  loginProfessional,
  registerProfessional,
  subscribeProfessional
} from './service.js';

export const proRouter = Router();

proRouter.post('/register', (req, res, next) => {
  try {
    const result = registerProfessional(req.body.email, req.body.password);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

proRouter.post('/login', (req, res, next) => {
  try {
    const result = loginProfessional(req.body.email, req.body.password);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

proRouter.post('/subscriptions', async (req, res, next) => {
  try {
    const { token, planId } = req.body;
    const result = await subscribeProfessional(token, planId ?? 'default');
    res.json(result);
  } catch (error) {
    next(error);
  }
});

proRouter.get('/subscriptions/status', (req, res, next) => {
  try {
    const token = String(req.query.token ?? '');
    const result = getSubscriptionStatus(token);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

proRouter.post('/cases', async (req, res, next) => {
  try {
    const { token, citizenName, email, licensePlate, accidentDate, description } = req.body;
    const result = await createProfessionalCase(token, {
      citizenName,
      email,
      licensePlate,
      accidentDate,
      description
    });
    res.json({
      petitionId: result.petitionId,
      petitionEmail: result.petitionEmail,
      petitionUrl: `/citizen/accidents/${result.requestId}/petition`
    });
  } catch (error) {
    next(error);
  }
});

proRouter.get('/petitions', (req, res, next) => {
  try {
    const token = String(req.query.token ?? '');
    const petitions = listProfessionalPetitions(token);
    res.json({ petitions });
  } catch (error) {
    next(error);
  }
});
