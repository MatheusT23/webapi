const { Client, LocalAuth, MessageMedia } = require('whatsapp-web.js');
const webhookUrl = 'http://127.0.0.1:5000/evolution-webhook';
const fileUpload = require('express-fileupload');
const FormData = require('form-data');
const server = http.createServer(app);
const socketIO = require('socket.io');
const express = require('express');
const axios = require('axios');
const http = require('http');
const path = require('path');
const io = socketIO(server);
const fs = require('fs');
const app = express();
const port = 3000;

app.use(express.json());
app.use(express.urlencoded({
extended: true
}));
app.use(fileUpload({
debug: true
}));
app.use("/", express.static(__dirname + "/"))

app.get('/', (req, res) => {
  res.sendFile('index.html', {
    root: __dirname
  });
});

const client = new Client({
  authStrategy: new LocalAuth({ clientId: 'bot-zdg' }),
  puppeteer: { headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-accelerated-2d-canvas',
      '--no-first-run',
      '--no-zygote',
      '--single-process', // <- this one doesn't works in Windows
      '--disable-gpu'
    ] }
});
client.initialize();

let pairingCodeRequested = false;
client.on('qr', async (qr) => {
    console.log('QR RECEIVED', qr);

    // paiuting code example
    const pairingCodeEnabled = true;
    if (pairingCodeEnabled && !pairingCodeRequested) {
        const pairingCode = await client.requestPairingCode('5521995210939');
        console.log('Pairing code enabled, code: '+ pairingCode);
        pairingCodeRequested = true;
    }
});

client.on('ready', () => {
    
    console.log('Dispositivo pronto');
});

client.on('authenticated', () => {
   
    console.log('Autenticado');
});

client.on('auth_failure', function() {
  
    console.error(' Falha na autenticação');
});

client.on('change_state', state => {
  console.log(' Status de conexão: ', state );
});

client.on('disconnected', (reason) => {
  
  console.log(' Cliente desconectado', reason);
  client.initialize();
});

client.on('message', async message => {
  if (message.body !== '') {
    console.log(message.body);

  // Enviando o webhook usando Axios
  axios.post(webhookUrl, {
    mensagem: message.body,
    remetente: message.from
  })
  .then(function (response) {
      console.log('Webhook enviado com sucesso!');
  })
  .catch(function (error) {
    console.error('Erro ao enviar o webhook:', error);
  });
  }

//}
});

server.listen(port, function() {
    console.log('App running on *: ' + port);
});