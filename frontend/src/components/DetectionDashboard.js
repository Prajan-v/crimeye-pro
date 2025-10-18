import React, { useEffect, useState } from 'react';
import API from '../api';
import { Activity, TrendingUp } from 'lucide-react';

export default function DetectionDashboard() {
    const [detections, setDetections] = useState([]);
    const [stats, setStats] = useState({
        total: 0,
        high_threat: 0,
        incidents_created: 0
    });

    useEffect(() => {
        fetchDetections();
        const interval = setInterval(fetchDetections, 10000);
        return () => clearInterval(interval);
    }, []);

    const fetchDetections = async () => {
        try {
            const response = await API.get('/detections');
            const data = response.data;
            setDetections(data);
            
            setStats({
                total: data.length,
                high_threat: data.filter(d => ['HIGH', 'CRITICAL'].includes(d.threat_level)).length,
                incidents_created: data.filter(d => d.incident_created).length
            });
        } catch (error) {
            console.error('Error fetching detections:', error);
        }
    };

    return (
        <>
            <div className="card">
                <h2><Activity size={24} /> Detection Statistics</h2>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px', marginTop: '15px' }}>
                    <div style={{ background: '#2a2a2a', padding: '15px', borderRadius: '5px', textAlign: 'center' }}>
                        <p style={{ margin: 0, color: '#999', fontSize: '12px' }}>TOTAL DETECTIONS</p>
                        <h3 style={{ margin: '10px 0 0 0', fontSize: '28px', color: '#4caf50' }}>{stats.total}</h3>
cat > app/llm_deduce.py << 'EOF'
from fastapi import APIRouter, UploadFile, File, Form, Depends
from sqlalchemy.orm import Session
from anthropic import Anthropic
from .database import get_db
from .models import Detection, Incident
import os, io
import PIL.Image
from datetime import datetime

router = APIRouter()

def extract_threat_level(txt):
    if "CRITICAL" in txt.upper(): return "CRITICAL"
    if "HIGH" in txt.upper(): return "HIGH"
    if "MEDIUM" in txt.upper(): return "MEDIUM"
    if "LOW" in txt.upper(): return "LOW"
    return "UNKNOWN"

@router.post("/deduce")
async def llm_deduce(
    file: UploadFile = File(...),
    camera_id: str = Form(...),
    db: Session = Depends(get_db),
):
    image_bytes = await file.read()
    img = PIL.Image.open(io.BytesIO(image_bytes))
    img_path = f"static/detections/{camera_id}_{int(datetime.utcnow().timestamp())}.jpg"
    img.save(img_path)

    prompt = (
      f"You are a crime analyst AI. Review this photo from camera {camera_id}. "
      "State threat level (CRITICAL/HIGH/MEDIUM/LOW), give detailed reasoning, suggest incident if needed."
    )
    client = Anthropic(api_key=os.getenv("ANTHROPIC_API_KEY"))
    resp = client.completions.create(
        prompt=prompt,
        max_tokens_to_sample=1000,
        temperature=0.2
    )
    result = resp.completion
    threat = extract_threat_level(result)

    detection = Detection(
      camera_id=camera_id,
      description=result[:100],
      reasoning=result,
      threat_level=threat,
      image_path=img_path,
      detection_timestamp=datetime.utcnow()
    )
    db.add(detection)
    db.commit()
    db.refresh(detection)

    incident_id = None
    if threat in ("HIGH", "CRITICAL"):
        incident = Incident(
          camera_id=camera_id,
          detection_id=detection.id,
          details=result,
          created_at=datetime.utcnow()
        )
        db.add(incident)
        db.commit()
        db.refresh(incident)
        detection.incident_id = incident.id
        db.commit()
        incident_id = incident.id

    return {
      "result": result,
      "threat_level": threat,
      "incident_id": incident_id
    }
