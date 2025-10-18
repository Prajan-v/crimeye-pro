// frontend/src/components/LLMDetectionTest.js
import React, { useState } from 'react';

export default function LLMDetectionTest() {
  const [imagePreview, setImagePreview] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  function handleImageChange(e) {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => setImagePreview(reader.result);
    reader.readAsDataURL(file);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!imagePreview) return;
    setLoading(true);
    setResult(null);
    const base64String = imagePreview.split(',')[1];
    const resp = await fetch('/api/deduce', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        image: base64String,
        camera_id: "CAM01"
      })
    });
    const data = await resp.json();
    setResult(data);
    setLoading(false);
  }

  return (
    <div style={{
      background: "#222", color: "#fff", padding: 24, borderRadius: 10, maxWidth: 500, margin: 'auto'
    }}>
      <form onSubmit={handleSubmit}>
        <input type="file" accept="image/*" onChange={handleImageChange} />
        <button type="submit" style={{ marginLeft: 10, padding: "6px 20px" }}>
          Analyze
        </button>
      </form>
      {imagePreview && (
        <img src={imagePreview} alt="preview" style={{ width: 220, margin: "20px 0", borderRadius: 8 }} />
      )}
      {loading && <p>Detecting with LLM...</p>}
      {result && (
        <div style={{
          background: "#333", padding: 20, borderRadius: 10, marginTop: 20
        }}>
          <strong>Threat Level:</strong> {result.threat_level}<br />
          <strong>Reasoning:</strong> <span style={{ color: "#d4af37" }}>{result.reasoning}</span><br />
          <small>{result.timestamp}</small>
        </div>
      )}
    </div>
  );
}
