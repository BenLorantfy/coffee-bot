import express from 'express';
import bodyParser from 'body-parser';

const app = express();
app.use(bodyParser.json());

app.get('*', (req, res) => {
  console.log('GET request');
  res.send('Hello World GET!');
});
app.post('*', (req, res) => {
  console.log('POST REQUEST', req.body);
  res.send('Hello World POST!');
});

app.listen(3000, () => console.log('Example app listening on port 3000!'));
