import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 82;

app.use(express.static(path.join(__dirname, '../public')));

app.listen(PORT, () => {
    console.log(`Monitor server is running on port ${PORT}`);
});