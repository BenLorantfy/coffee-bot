import express from 'express';
import bodyParser from 'body-parser';
import fs from 'fs';

const app = express();
app.use(bodyParser.json());

app.get('/auth', (req, res) => {
  const html = fs.readFileSync(`${__dirname}/../static/auth.html`);
  res.header('Content-Type', 'text/html');
  res.send(html);
});

app.post('*', (req, res) => {
  console.log('POST REQUEST', req.body);
  res.send('Hello World POST!');
});

app.listen(3000, () => console.log('Example app listening on port 3000!'));
