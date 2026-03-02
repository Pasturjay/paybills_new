import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from './config/swagger';
import { configureSecurity } from './middleware/security.middleware';

const app: Application = express();

// CORS Configuration
const allowedOrigins = (process.env.ALLOWED_ORIGINS || '')
    .split(',')
    .map(o => o.trim())
    .filter(Boolean);

// Always allow localhost in development
if (process.env.NODE_ENV !== 'production') {
    allowedOrigins.push('http://localhost:3000', 'http://127.0.0.1:3000');
}

app.use(cors({
    origin: (origin, callback) => {
        // Allow requests with no origin (like mobile apps or curl)
        if (!origin) return callback(null, true);
        if (allowedOrigins.length === 0 || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error(`CORS policy: origin ${origin} is not allowed`));
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Security Middleware (Helmet + Rate Limiter)
configureSecurity(app);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request Logger
app.use((req: Request, res: Response, next: NextFunction) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
});

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
app.use((err: Error & { status?: number; code?: string }, req: Request, res: Response, next: NextFunction) => {
    const status = err.status || 500;
    if (status >= 500) {
        console.error(`[ERROR] ${req.method} ${req.path} — ${err.message}`);
        console.error(err.stack);
    }
    res.status(status).json({
        error: status >= 500 ? 'Internal Server Error' : err.message,
        code: err.code || (status >= 500 ? 'INTERNAL_SERVER_ERROR' : 'ERROR'),
        path: req.path,
        timestamp: new Date().toISOString(),
    });
});

export default app;
