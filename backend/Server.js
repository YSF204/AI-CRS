import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import connectDB from './src/config/dbConnect.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const startServer = async () => {
    await connectDB();
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
};

startServer();
