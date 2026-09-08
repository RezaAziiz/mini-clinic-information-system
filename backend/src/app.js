import express from 'express';
import cors from 'cors';
import helmet from 'helmet';

const app = express();

app.use(cors());
app.use(helmet());
app.use(express.json());

app.get('/health', (req, res) => {
    res.json({
        success: true,
        message: 'Clinic API is running',
        data: null
    });
});

export default app;