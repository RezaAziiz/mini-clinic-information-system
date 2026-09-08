import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import swaggerUi from 'swagger-ui-express';
import swaggerSpec from './config/swagger.js';

const app = express();

app.use(cors());
app.use(helmet());
app.use(express.json());

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.get('/health', (req, res) => {
    res.json({
        success: true,
        message: 'Clinic API is running',
        data: null
    });
});

export default app;