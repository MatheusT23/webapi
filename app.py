from flask import Flask, request, jsonify
import os
import base64
app = Flask(__name__)
contato = []
msg = []
conversas = []
@app.route('/evolution-webhook', methods=['POST'])
def webhook():
    req_data = request.get_json()

    if 'remetente' in req_data: 
        # Extraindo os dados recebidos do webhook 
        mensagem = req_data.get('mensagem')
        remetente = req_data.get('remetente')
        audio = req_data.get('audio')

        # Aqui você pode processar os dados recebidos como desejar
        # Por exemplo, imprimir no console
        print(f'Mensagem recebida: {mensagem} | Remetente: {remetente} | Audio: {audio}')
        # Enviar uma resposta de sucesso ao webhook
        return jsonify({'status': 'success', 'message': 'Webhook recebido com sucesso'}),200
    
    if 'audio' in req_data:
        audio_base64 = audio
            
        #Decodifica o áudio base64
        audio_bytes = base64.b64decode(audio_base64)

        # Define o caminho e o nome do arquivo WAV a ser salvo
        filename = f"audio/audio_received.wav"

        # Salva o arquivo WAV no diretório especificado
        with open(filename, 'wb') as f:
            f.write(audio_bytes)
if __name__ == '__main__':
    app.run(debug=True)