import { useState } from 'react';
import { api } from '../api';

type Props = {
  currentText: string;
  onPick: (text: string) => void;
};

export default function SuggestButton({ currentText, onPick }: Props) {
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<string[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const run = async () => {
    setLoading(true); setError(null);
    try {
      const res = await api.aiSuggest(currentText || 'help me write a todo');
      setSuggestions(res.suggestions);
    } catch (e: any) {
      setError(e.message || 'Suggestion failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'inline-block', position: 'relative' }}>
      <button type="button" onClick={run} disabled={loading} style={{ marginLeft: 8 }}>
        {loading ? 'Thinking…' : 'Generate task suggestion'}
      </button>

      {!!error && <div style={{ color: 'crimson', fontSize: 12 }}>{error}</div>}

      {suggestions && (
        <div style={{
          position: 'absolute', top: '110%', left: 0, zIndex: 10,
          background: '#fff', border: '1px solid #ddd', borderRadius: 6, padding: 8, width: 280,
          boxShadow: '0 4px 12px rgba(0,0,0,.08)'
        }}>
          <div style={{ fontWeight: 600, marginBottom: 6 }}>Suggestions</div>
          <ul style={{ margin: 0, paddingLeft: 18 }}>
            {suggestions.map((s, i) => (
              <li key={i} style={{ marginBottom: 6, cursor: 'pointer' }}
                  onClick={() => onPick(s)}>
                {s}
              </li>
            ))}
          </ul>
          <div style={{ textAlign: 'right', marginTop: 6 }}>
            <button type="button" onClick={() => setSuggestions(null)}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
}