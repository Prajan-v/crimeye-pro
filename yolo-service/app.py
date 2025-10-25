from flask import Flask, request, jsonify
from flask_cors import CORS
from ultralytics import YOLO
import numpy as np
from PIL import Image
import io
import base64

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "http://localhost:5001"}})
print("🚀 Loading YOLOv8n model...")
model = YOLO('yolov8n.pt') # Use 'n' (nano) for the fastest live-feed performance
print("✅ Model loaded successfully!")
WEAPON_CLASSES = ['knife', 'scissors']
PERSON_CLASS = 'person'
SUSPICIOUS_OBJECTS = ['backpack', 'handbag', 'suitcase']

@app.route('/yolo-health', methods=['GET'])
def yolo_health():
    """Health check endpoint for the YOLO service."""
    return jsonify({'status': 'online', 'message': 'YOLO Service is healthy'}), 200

@app.route('/detect-frame', methods=['POST'])
def detect_frame():
    """Detect objects in a single webcam frame"""
    try:
        data = request.json
        if 'frame' not in data:
            return jsonify({"error": "No frame provided"}), 400
        
        frame_data = data['frame'].split(',')[1]
        frame_bytes = base64.b64decode(frame_data)
        image = Image.open(io.BytesIO(frame_bytes))
        image_np = np.array(image)
        
        results = model(image_np, conf=0.4, verbose=False) # 0.4 confidence
        
        detections = []
        alerts = []
        person_count = 0
        trigger_llm = False # This is the key
        
        for result in results:
            for box in result.boxes:
                cls_id = int(box.cls[0])
                class_name = model.names[cls_id]
                
                if class_name in WEAPON_CLASSES:
                    trigger_llm = True
                    alerts.append(f"CRITICAL: Weapon ({class_name})")
                
                elif class_name in SUSPICIOUS_OBJECTS:
                    trigger_llm = True
                    alerts.append(f"MEDIUM: Suspicious Object ({class_name})")
                
                elif class_name == PERSON_CLASS:
                    trigger_llm = True
                    person_count += 1
        
        if person_count > 0 and not alerts:
            alerts.append(f"INFO: Person ({person_count})")

        return jsonify({
            "success": True,
            "trigger_llm": trigger_llm,
            "yolo_alerts": alerts,
            "person_count": person_count
        })
    
    except Exception as e:
        print(f"[ERROR] {e}")
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    print("\n" + "="*50)
    print("🎯 CRIMEYE-PRO YOLO DETECTION SERVICE (Fixed)")
    print("="*50)
    print("📡 Server: http://localhost:5002")
    print("�� Model: YOLOv8n")
    print("✅ Routes: /yolo-health, /detect-frame")
    print("="*50 + "\n")
    app.run(host='0.0.0.0', port=5002, debug=False)

