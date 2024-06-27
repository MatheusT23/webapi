from flask import Flask, request, jsonify
import os
app = Flask(__name__)
contato = []
msg = []
conversas = []
@app.route('/evolution-webhook', methods=['POST'])
def webhook():
    req_data = request.get_json()

    # Extraindo os dados recebidos do webhook 
    mensagem = req_data.get('mensagem')
    remetente = req_data.get('remetente')
    audio = req_data.get('audio')

    # Aqui você pode processar os dados recebidos como desejar
    # Carregue o modelo Whisper    
    # Por exemplo, imprimir no console
    print(f'Mensagem recebida: {mensagem} | Remetente: {remetente} | Audio: {audio}')
    # Enviar uma resposta de sucesso ao webhook
    return jsonify({'status': 'success', 'message': 'Webhook recebido com sucesso'}), 200

if __name__ == '__main__':
    app.run(debug=True)