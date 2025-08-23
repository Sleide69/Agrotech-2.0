from flask import Flask, request, jsonify
from flask_cors import CORS
from PIL import Image, UnidentifiedImageError
from ultralytics import YOLO
import os
app = Flask(__name__)
CORS(app)

# Ruta actualizada al modelo YOLO


BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH = os.path.join(BASE_DIR, 'train', 'weights', 'best.pt')
# Cargar el modelo YOLO
try:
    model = YOLO(MODEL_PATH)
    print("✅ Modelo cargado exitosamente.")
except Exception as e:
    model = None
    print(f"❌ Error al cargar el modelo: {e}. Verifica que la ruta sea correcta y que el archivo no esté corrupto.")

@app.route('/', methods=['GET'])
def home():
    return jsonify({'message': 'Servidor Flask funcionando correctamente'})

@app.route('/detect', methods=['POST'])
def detect():
    if not model:
        return jsonify({'error': 'El modelo no se cargó correctamente en el servidor. Contacta al administrador.'}), 500

    if 'image' not in request.files:
        return jsonify({'error': 'No se envió una imagen en la solicitud'}), 400

    try:
        image_file = request.files['image']
        img = Image.open(image_file.stream).convert('RGB')
    except UnidentifiedImageError:
        return jsonify({'error': 'El archivo enviado no es una imagen válida o está dañado'}), 400
    except Exception as e:
        return jsonify({'error': f'Error al abrir la imagen: {e}'}), 400

    try:
        results = model.predict(source=img, save=False, conf=0.25)
        detections = []
        for r in results:
            for box in r.boxes:
                class_id = int(box.cls)
                confidence = float(box.conf)
                detections.append({
                    "name": model.names[class_id],
                    "confidence": confidence
                })
        return jsonify(detections)
    except Exception as e:
        return jsonify({'error': f'Error al procesar la imagen con el modelo: {e}'}), 500

if __name__ == '__main__':
    app.run(host='127.0.0.1', port=5000)
