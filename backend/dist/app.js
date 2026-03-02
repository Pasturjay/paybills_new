"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const swagger_ui_express_1 = __importDefault(require("swagger-ui-express"));
const swagger_1 = require("./config/swagger");
const security_middleware_1 = require("./middleware/security.middleware");
const app = (0, express_1.default)();
// CORS Configuration
const allowedOrigins = (process.env.ALLOWED_ORIGINS || '')
    .split(',')
    .map(o => o.trim())
    .filter(Boolean);
// Always allow localhost in development
if (process.env.NODE_ENV !== 'production') {
    allowedOrigins.push('http://localhost:3000', 'http://127.0.0.1:3000');
}
app.use((0, cors_1.default)({
    origin: (origin, callback) => {
        // Allow requests with no origin (like mobile apps or curl)
        if (!origin)
            return callback(null, true);
        if (allowedOrigins.length === 0 || allowedOrigins.includes(origin)) {
            callback(null, true);
        }
        else {
            callback(new Error(`CORS policy: origin ${origin} is not allowed`));
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
}));
// Security Middleware (Helmet + Rate Limiter)
(0, security_middleware_1.configureSecurity)(app);
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
// Request Logger
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
});
// Swagger Documentation
app.use('/api/docs', swagger_ui_express_1.default.serve, swagger_ui_express_1.default.setup(swagger_1.swaggerSpec));
// Root Route
app.get('/', (req, res) => {
    res.status(200).json({ message: 'Welcome to PayBills Backend API' });
});
// Health Check Route
app.get('/api/health', (req, res) => {
    res.status(200).json({ status: 'UP', message: 'Server is healthy' });
});
const api_routes_1 = __importDefault(require("./routes/api.routes"));
// Routes
// Routes
app.use('/api', api_routes_1.default);
const bills_routes_1 = __importDefault(require("./routes/bills.routes"));
app.use('/api/bills', bills_routes_1.default);
// Webhook Route (Root level to match Didit configuration: https://paybills.ng/webhook)
const kyc_controller_1 = require("./controllers/kyc.controller");
const kycController = new kyc_controller_1.KYCController();
app.post('/webhook', kycController.handleWebhook);
// Initialize Services (Cron Jobs)
const reconciliation_service_1 = require("./services/reconciliation.service");
if (process.env.NODE_ENV !== 'test') {
    new reconciliation_service_1.ReconciliationService();
}
// Global Error Handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Internal Server Error' });
});
exports.default = app;
