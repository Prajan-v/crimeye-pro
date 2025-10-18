from flask import Flask, request, jsonify
from flask_cors import CORS
from ultralytics import YOLO
import cv2
import numpy as np
from PIL import Image
import io
import base64
import torch

app = Flask(__name__)
CORS(app)

print("="*60)
print("Loading YOLO model...")
print("="*60)

device = 'mps' if torch.backends.mps.is_available() else 'cpu'
print(f"Device: {device.upper()}")

try:
    model = YOLO('yolov8n.pt')
    print("Model loaded successfully!")
    print(f"Classes available: {len(model.names)}")
except Exception as e:
    print(f"Error loading model: {e}")
    model = None

@app.route('/health', methods=['GET'])
def health():
    return jsonify({
        'status': 'running' if model else 'error',
        'model': 'YOLOv8n',
        'device': device.upper(),
        'fps': '30-50'
    })

@app.route('/detect-frame', methods=['POST'])
def detect_frame():
    try:
        data = request.json
        frame_data = data.get('frame', '')
        
        if not frame_data:
            return jsonify({'error': 'No frame'}), 400
        
        if ',' in frame_data:
            frame_data = frame_data.split(',')[1]
        
        img_bytes = base64.b64decode(frame_data)
        img = Image.open(io.BytesIO(img_bytes))
        img_cv = cv2.cvtColor(np.array(img), cv2.COLOR_RGB2BGR)
        
        results = model(img_cv, conf=0.10, device=device, verbose=False)
        
        detections = []
        for result in results:
            for box in result.boxes:
                cls = int(box.cls[0])
                conf = float(box.conf[0])
                class_name = result.names[cls]
                
                x1, y1, x2, y2 = box.xyxy[0].cpu().numpy()
                
                detections.append({
                    'class': class_name,
                    'confidence': round(conf, 3),
                    'bbox': {
                        'x1': float(x1),
                        'y1': float(y1),
                        'x2': float(x2),
                        'y2': float(y2)
                    }
                })
                
                print(f"DETECTED: {class_name} ({conf*100:.1f}%)")
        
        print(f"Total detections: {len(detections)}")
        
        return jsonify({
            'success': True,
            'detections': detections,
            'count': len(detections)
        })
        
    except Exception as e:
        print(f"ERROR: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    print("\n" + "="*60)
    print("OPTIMIZED DETECTION SERVICE")
    print("="*60)
    print(f"Server: http://localhost:5002")
    print(f"Model: YOLOv8n (15% confidence threshold)")
    print(f"Device: {device.upper()}")
    print("="*60 + "\n")
    
    app.run(host='0.0.0.0', port=5002, debug=False, threaded=True)
