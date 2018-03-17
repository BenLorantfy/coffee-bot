import express from 'express';
import bodyParser from 'body-parser';

const app = express();
app.use(bodyParser);

app.get('/', (req, res) => res.send('Hello World GET!'));
app.post('/', (req, res) => {
  console.log(req.body);
  res.send('Hello World POST!');
});

app.listen(3000, () => console.log('Example app listening on port 3000!'));
