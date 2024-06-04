const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;
const OpenAI  = require("openai");
const http = require('http');
const https = require('https');
const { Client } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
require("dotenv").config();


app.use(express.json()); // Para lidar com solicitações JSON

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const client = new Client({
  webVersionCache: {
    type: "remote",
    remotePath:
      "https://raw.githubusercontent.com/wppconnect-team/wa-version/main/html/2.2412.54.html",
  },
});

app.get("/chat", async (req, res) => {
  try {
    const response = await openai.chat.completions.create({
      model : "gpt-3.5-turbo-0613",
      messages: [{"role": "user", "content": req.query.query}],  
    });
    return res.status(200).json({
      success: true,
      data: response.choices[0].message.content
    });
  } catch (error){
    return res.status(400).json({
      success: false,
      error: error
    })
  }
});

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});


client.on('ready', () => {
  console.log('Client is ready!');
});

client.on('qr', qr => {
  qrcode.generate(qr, {small: true});
});

/*client.on('message', message => {
  if(!message.fromMe){  
    http.get(`http://localhost:3000/chat?query=${message.body}`, (resp) => {
        let data = '';

        resp.on('data', (chunk) => {
            data += chunk;
        });

        resp.on('end', () => {
            const mensagem = JSON.parse(data).data;
            console.log(mensagem);
            client.sendMessage(message.from, mensagem);
        });
    }).on('error', (err) => {
        console.error('Erro na requisição:', err.message);
    });
  }
});*/
client.on('message_create', message => {
	if (message.body === '!ping') {
		// send back "pong" to the chat the message was sent in
		client.sendMessage(message.from, 'pong');
	}
});

client.initialize();




    

    



