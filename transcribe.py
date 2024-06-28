from flask import Flask, request, jsonify
import base64
import os
import whisper
import requests
app = Flask(__name__)

# Carregar o modelo Whisper fora da função de roteamento para otimizar o desempenho
model = whisper.load_model("base")

@app.route('/evolution-webhook', methods=['POST'])
def webhook():
    data = request.get_json()

    if 'audio' in data and 'mimetype' in data:
        audio_base64 = data['audio']
        mimetype = data['mimetype']
        remetente = data['remetente']

        # Decodifica o áudio base64
        audio_bytes = base64.b64decode(audio_base64)

        # Define o caminho e o nome do arquivo WAV a ser salvo
        filename = f"audio/audio_received.wav"

        # Cria o diretório se ele não existir
        os.makedirs(os.path.dirname(filename), exist_ok=True)

        # Salva o arquivo WAV no diretório especificado
        with open(filename, 'wb') as f:
            f.write(audio_bytes)

        # Configurações do transcribe
        options = {
            "language": "pt",  # Defina o idioma conforme necessário
            "task": "transcribe",
            "temperature": 0.5,
            "best_of": 7,
            "beam_size": 3,
            "patience": 2.0
        }
        # Transcrever o áudio
        result = model.transcribe(filename, **options)

        # Obter o texto transcrito
        transcribed_text = result['text']
        print(transcribed_text)
         # Enviar a transcrição de volta ao remetente via WhatsApp
        whatsapp_response = send_whatsapp_message(remetente, transcribed_text)
        # Retorna a resposta com o texto transcrito
        return jsonify({
            'message': 'Áudio recebido e salvo com sucesso.',
            'transcription': transcribed_text
        }), 200
        
    return jsonify({'error': 'Dados incompletos ou inválidos.'}), 400

def send_whatsapp_message(to, message):
    url = 'http://127.0.0.1:3000/send-message'
    payload = {
        'to': to,
        'message': message
    }
    headers = {
        'Content-Type': 'application/json'
    }
    response = requests.post(url, json=payload, headers=headers)
    return response
if __name__ == '__main__':
    app.run(debug=True, port=5050)