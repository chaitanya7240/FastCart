// src/ClarifaiScan.js
import React, { useState } from 'react';
import Clarifai from 'clarifai';

const app = new Clarifai.App({
  apiKey: '53c0ff029e4841578fa5ce3e5f03f08e'
});

const ClarifaiScan = ({ onResult }) => {
  const [imageUrl, setImageUrl] = useState('');
  const [result, setResult] = useState(null);

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();

    reader.onloadend = async () => {
      const base64 = reader.result.replace(/^data:image\/(png|jpg|jpeg);base64,/, '');
      try {
        const response = await app.models.predict(
          Clarifai.GENERAL_MODEL,
          { base64 }
        );

        const concepts = response.outputs[0].data.concepts;
        setResult(concepts[0].name); // Top match
        onResult(concepts[0].name);
      } catch (err) {
        console.error(err);
        alert('Failed to analyze image.');
      }
    };

    if (file) reader.readAsDataURL(file);
  };

  return (
    <div style={{ margin: '10px 0' }}>
      <input type="file" accept="image/*" onChange={handleFileChange} />
      {result && <p>🔍 Detected: <strong>{result}</strong></p>}
    </div>
  );
};

export default ClarifaiScan;
