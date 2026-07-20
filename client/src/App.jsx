import { useState } from 'react';
import './App.css';
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

function App() {
  const [complaint, setComplaint] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleAnalyze = async () => {
    if (!complaint.trim()) return;
    setLoading(true);
    setError('');
    setResult(null);

    try {
      const res = await fetch(`${API_URL}/api/analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ complaint }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setResult(data);
    } catch (err) {
      setError('Something went wrong. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <h1>Support Ticket Classifier</h1>
      <p>Paste a customer complaint below and let AI analyze it.</p>

      <textarea
        rows="5"
        placeholder="e.g. My payment got deducted twice..."
        value={complaint}
        onChange={(e) => setComplaint(e.target.value)}
      />

      <button onClick={handleAnalyze} disabled={loading}>
        {loading ? 'Analyzing...' : 'Analyze'}
      </button>

      {error && <p className="error">{error}</p>}

      {result && (
        <div className="result-card">
          <p><strong>Priority:</strong> {result.priority}</p>
          <p><strong>Category:</strong> {result.category}</p>
          <p><strong>Suggested Reply:</strong> {result.suggested_reply}</p>
        </div>
      )}
    </div>
  );
}

export default App;
