require('dotenv').config();
const path = require('path');
const express = require('express');
const compression = require('compression');
const bodyParser = require('body-parser');
const http = require('http');
const { Server } = require('socket.io');
const ioHandler = require('./io.js');
const router = require('./router.js');
const cors = require('cors');

const port = process.env.PORT || process.env.NODE_PORT || 3000;

const app = express();
app.disable('x-powered-by');
app.use(compression());

app.use(cors({
  origin: 'https://pixijs.download',
}));

app.use('/assets', express.static(path.resolve(`${__dirname}/../hosted/`)));

app.use(bodyParser.json());

router(app);

const server = http.createServer(app);
const io = new Server(server);
ioHandler.registerIo(io);

server.listen(port, (err) => {
  if (err) {
    throw err;
  }
  console.log(`Listening on port ${port}`);
});