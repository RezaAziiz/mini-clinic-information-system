import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import swaggerUi from 'swagger-ui-express';
import swaggerSpec from './config/swagger.js';
import { responseFormatter } from './middlewares/response.middleware.js';
import errorHandler from './middlewares/error.middleware.js';
import authRoutes from './modules/auth/auth.route.js';
import patientRoutes from './modules/patients/patient.route.js';

const app = express();

app.use(cors());
app.use(helmet());
app.use(express.json());

// Inject standardized success response formatter
app.use(responseFormatter);

if (process.env.NODE_ENV !== 'production') {
    app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
}

app.get('/health', (req, res) => {
    return res.success(null, 'Clinic API is running');
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/patients', patientRoutes);

// Global error handler
app.use(errorHandler);

export default app;
