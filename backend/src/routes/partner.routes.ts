import { Router } from 'express';
import { PartnerController } from '../controllers/partner.controller';

const router = Router();

// Partner API Auth endpoint
router.post('/auth', PartnerController.authenticate);

export default router;
