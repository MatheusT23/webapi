const express = require('express');
const { Client, LocalAuth } = require('whatsapp-web.js');
const fileUpload = require('express-fileupload');
const FormData = require('form-data');
const axios = require('axios');
const http = require('http');
const path = require('path');
const socketIO = require('socket.io');
const fs = require('fs');

const app = express();
const server = http.createServer(app);
const io = socketIO(server);
const port = 3000;
const webhookUrl = 'http://127.0.0.1:5000/evolution-webhook';

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(fileUpload({ debug: true }));
app.use("/", express.static(__dirname + "/"));

app.get('/', (req, res) => {
  res.sendFile('index.html', { root: __dirname });
});

const client = new Client({
  authStrategy: new LocalAuth({ clientId: 'bot-zdg' }),
  puppeteer: { headless: true, args: [
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
    const message = 'QR RECEIVED: ' + qr;
    console.log(message);
    io.emit('log', message);
    io.emit('qr', qr);
});

client.on('ready', () => {
    const message = 'Dispositivo pronto';
    console.log(message);
    io.emit('log', message);
});

client.on('authenticated', () => {
    const message = 'Autenticado';
    console.log(message);
    io.emit('log', message);
});

client.on('auth_failure', function() {
    const message = 'Falha na autenticação';
    console.error(message);
    io.emit('log', message);
});

client.on('change_state', state => {
    const message = 'Status de conexão: ' + state;
    console.log(message);
    io.emit('log', message);
});

client.on('disconnected', (reason) => {
    const message = 'Cliente desconectado: ' + reason;
    console.log(message);
    io.emit('log', message);
    client.initialize();
});

client.on('message', async message => {
    if (message.body !== '') {
        const logMessage = 'Message received: ' + message.body;
        console.log(logMessage);
        io.emit('log', logMessage);

        // Enviando o webhook usando Axios
        axios.post(webhookUrl, {
            mensagem: message.body,
            remetente: message.from
        })
        .then(function (response) {
            const webhookMessage = 'Webhook enviado com sucesso!';
            console.log(webhookMessage);
            io.emit('log', webhookMessage);
        })
        .catch(function (error) {
            const errorMessage = 'Erro ao enviar o webhook: ' + error;
            console.error(errorMessage);
            io.emit('log', errorMessage);
        });
    }
});

io.on('connection', (socket) => {
    console.log('Client connected');

    socket.on('requestPairingCode', async (phoneNumber) => {
        if (!pairingCodeRequested) {
            try {
                const pairingCode = await client.requestPairingCode(phoneNumber);
                const message = 'Pairing code enabled, code: ' + pairingCode;
                console.log(message);
                pairingCodeRequested = true;
                socket.emit('pairingCode', pairingCode);
                io.emit('log', message);
            } catch (error) {
                const errorMessage = 'Erro ao solicitar o código de pareamento: ' + error;
                console.error(errorMessage);
                io.emit('log', errorMessage);
            }
        }
    });


    socket.on('disconnectClient', () => {
        client.logout().then(() => {
            const message = 'Cliente desconectado manualmente';
            console.log(message);
            io.emit('log', message);
        }).catch(error => {
            const errorMessage = 'Erro ao desconectar o cliente: ' + error;
            console.error(errorMessage);
            io.emit('log', errorMessage);
        });
    });
});


server.listen(port, function() {
    const message = 'App running on *: ' + port;
    console.log(message);
    io.emit('log', message);
});
