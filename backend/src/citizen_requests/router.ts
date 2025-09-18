import { Router } from 'express';
import multer from 'multer';
import {
  attachDocument,
  completePayment,
  createCitizenRequest,
  getPetitionPath
} from './service.js';

const upload = multer();

export const citizenRouter = Router();

citizenRouter.post('/accidents', upload.single('document'), async (req, res, next) => {
  try {
    if (req.file) {
      const parsed = attachDocument(
        createCitizenRequest({
          citizenName: req.body.citizenName ?? 'Bilinmiyor',
          email: req.body.email ?? 'unknown@example.com',
          licensePlate: req.body.licensePlate ?? '00AA000',
          accidentDate: req.body.accidentDate ?? new Date().toISOString().slice(0, 10)
        }).id,
        req.file.buffer
      );
      const request = await parsed;
      res.json({ id: request.id, status: request.status, data: request });
      return;
    }

    const request = createCitizenRequest(req.body);
    res.json({ id: request.id, status: request.status });
  } catch (error) {
    next(error);
  }
});

citizenRouter.post('/accidents/:id/document', upload.single('document'), async (req, res, next) => {
  try {
    if (!req.file) {
      throw new Error('Doküman bulunamadı');
    }
    const updated = await attachDocument(req.params.id, req.file.buffer);
    res.json({ id: updated.id, status: updated.status, data: updated });
  } catch (error) {
    next(error);
  }
});

citizenRouter.post('/accidents/:id/pay', async (req, res, next) => {
  try {
    const result = await completePayment(req.params.id, Number(req.body.amount ?? 0));
    res.json({
      status: 'paid',
      petitionEmail: result.petitionEmail,
      petitionId: result.petitionId,
      petitionUrl: `/citizen/accidents/${req.params.id}/petition`
    });
  } catch (error) {
    next(error);
  }
});

citizenRouter.get('/accidents/:id/petition', async (req, res, next) => {
  try {
    const path = getPetitionPath(req.params.id);
    res.sendFile(path);
  } catch (error) {
    next(error);
  }
});
