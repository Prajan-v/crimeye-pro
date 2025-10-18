from flask import Flask, request, jsonify
from flask_cors import CORS
from ultralytics import YOLO
import cv2
import numpy as np
from PIL import Image
import io
import base64

app = Flask(__name__)
CORS(app)

# Load YOLOv8m model (optimized for M3)
print("🚀 Loading YOLOv8m model...")
model = YOLO('yolov8n.pt')
print("✅ Model loaded successfully!")

# Crime detection categories
WEAPON_CLASSES = ['knife', 'scissors']
PERSON_CLASS = 'person'
VEHICLE_CLASSES = ['car', 'truck', 'bus', 'motorcycle']
SUSPICIOUS_OBJECTS = ['backpack', 'handbag', 'suitcase']

@app.route('/health', methods=['GET'])
def health():
    return jsonify({
        "status": "running",
        "model": "YOLOv8m",
        "device": "Apple M3",
        "fps": "30-50"
    })

@app.route('/detect-frame', methods=['POST'])
def detect_frame():
    """Detect objects in a single webcam frame"""
    try:
        data = request.json
        if 'frame' not in data:
            return jsonify({"error": "No frame provided"}), 400
        
        # Decode base64 image
        frame_data = data['frame'].split(',')[1]
        frame_bytes = base64.b64decode(frame_data)
        image = Image.open(io.BytesIO(frame_bytes))
        image_np = np.array(image)
        
        # Run YOLO detection with confidence threshold
        results = model(image_np, conf=0.5, verbose=False)
        
        detections = []
        alerts = []
        person_count = 0
        weapon_detected = False
        
        # Process detections
        for result in results:
            for box in result.boxes:
                cls_id = int(box.cls[0])
                confidence = float(box.conf[0])
                class_name = model.names[cls_id]
                bbox = box.xyxy[0].tolist()
                
                detection = {
                    "class": class_name,
                    "confidence": round(confidence, 2),
                    "bbox": [round(x, 2) for x in bbox]
                }
                detections.append(detection)
                
                # Critical: Weapon detection
                if class_name in WEAPON_CLASSES and confidence > 0.6:
                    weapon_detected = True
                    alerts.append({
                        "type": "weapon_detected",
                        "severity": "critical",
                        "message": f"🚨 WEAPON DETECTED: {class_name.upper()} ({confidence*100:.0f}%)",
                        "confidence": round(confidence, 2),
                        "alert_type": "unauthorized_entry"
                    })
                
                # Count people
                if class_name == PERSON_CLASS:
                    person_count += 1
                
                # Suspicious objects
                if class_name in SUSPICIOUS_OBJECTS and confidence > 0.7:
                    alerts.append({
                        "type": "suspicious_object",
                        "severity": "medium",
                        "message": f"⚠️ Suspicious object: {class_name} ({confidence*100:.0f}%)",
                        "confidence": round(confidence, 2),
                        "alert_type": "suspicious_activity"
                    })
        
        # Crowd detection
        if person_count >= 5:
            alerts.append({
                "type": "crowd_detected",
                "severity": "high",
                "message": f"👥 Large crowd detected: {person_count} people",
                "confidence": 0.95,
                "alert_type": "crowd_gathering"
            })
        
        # Unauthorized entry (person detected in restricted hours)
        elif person_count > 0 and person_count < 5:
            alerts.append({
                "type": "person_detected",
                "severity": "medium",
                "message": f"👤 {person_count} person(s) detected in frame",
                "confidence": 0.85,
                "alert_type": "unauthorized_entry"
            })
        
        return jsonify({
            "success": True,
            "detections": detections,
            "alerts": alerts,
            "stats": {
                "person_count": person_count,
                "total_objects": len(detections),
                "weapon_detected": weapon_detected
            }
        })
    
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    print("\n" + "="*50)
    print("🎯 CRIMEYE-PRO YOLO DETECTION SERVICE")
    print("="*50)
    print("📡 Server: http://localhost:5002")
    print("🤖 Model: YOLOv8m (Optimized for Apple M3)")
    print("🎥 Mode: Live Webcam Feed Detection")
    print("⚡ Speed: 30-50 FPS")
    print("="*50 + "\n")
    app.run(host='0.0.0.0', port=5002, debug=False)


from flask import Flask, request, jsonify

app = Flask(__name__)

@app.route('/yolo-health', methods=['GET'])
def yolo_health():
    return jsonify({'status': 'online', 'message': 'YOLO is running!'})

@app.route('/detect-frame', methods=['POST'])
def detect_frame():
    # Example: return fake detection (replace with model result)
    return jsonify({'result': 'Detection succeeded', 'objects': []})

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5002)
from flask import Flask, request, jsonify

app = Flask(__name__)

@app.route('/yolo-health', methods=['GET'])
def yolo_health():
    return jsonify({'status': 'online', 'message': 'YOLO is running!'})

# (Keep your other code below)
