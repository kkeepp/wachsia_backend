import express, { json } from 'express';
import router from './routes/users.js';

const app = express();

app.use(json());

app.use('/api/users', router);


app.get('/', (req, res) => {
  res.send('API is running...');
});

const PORT = 8091;
app.listen(PORT, () => {
  console.log(`Server is purring on port ${PORT}`);
});