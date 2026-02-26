import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from './config/swagger';
import { configureSecurity } from './middleware/security.middleware';

const app: Application = express();

// Middlewares
configureSecurity(app); // Helmet + Rate Limiter
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Swagger Documentation
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Root Route
app.get('/', (req: Request, res: Response) => {
    res.status(200).json({ message: 'Welcome to PayBills Backend API' });
});

// Health Check Route
app.get('/api/health', (req: Request, res: Response) => {
    res.status(200).json({ status: 'UP', message: 'Server is healthy' });
});

import apiRoutes from './routes/api.routes';

// Routes
// Routes
app.use('/api', apiRoutes);

import billsRoutes from './routes/bills.routes';
app.use('/api/bills', billsRoutes);

// Webhook Route (Root level to match Didit configuration: https://paybills.ng/webhook)
import { KYCController } from './controllers/kyc.controller';
const kycController = new KYCController();
app.post('/webhook', kycController.handleWebhook);

// Initialize Services (Cron Jobs)
import { ReconciliationService } from './services/reconciliation.service';
if (process.env.NODE_ENV !== 'test') {
    new ReconciliationService();
}

// Global Error Handler
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Internal Server Error' });
});

export default app;
