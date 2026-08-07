import React from 'react';
import { Terminal, Activity, Fingerprint, Database } from 'lucide-react';
import { mockPersona } from './mockData';

export default function LeftPanel() {
  const getStatusColor = (status) => {
    switch(status) {
      case 'Researching': return '#3b82f6'; // blue
      case 'Evaluating': return '#f59e0b'; // amber
      case 'Publishing': return '#10b981'; // green
      default: return '#6b7280'; // gray
    }
  };

  return (
    <div className="panel left-panel">
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ 
          width: '48px', height: '48px', 
          background: 'linear-gradient(135deg, #238636, #161b22)', 
          borderRadius: '8px',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          marginBottom: '1rem',
          border: '1px solid var(--border-color)'
        }}>
          <Terminal size={24} color="#00ff41" />
        </div>
        <h2 style={{ fontSize: '1.5rem', marginBottom: '0.25rem' }}>{mockPersona.name}</h2>
        <p className="text-muted monospace text-sm">{mockPersona.domain}</p>
      </div>

      <div style={{ 
        padding: '1rem', 
        backgroundColor: 'var(--panel-bg)', 
        borderRadius: '8px',
        border: '1px solid var(--border-color)',
        marginBottom: '2rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
          <Activity size={16} />
          <h3 style={{ fontSize: '0.875rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Live Status</h3>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ 
            width: '12px', height: '12px', 
            borderRadius: '50%', 
            backgroundColor: getStatusColor(mockPersona.status),
            boxShadow: `0 0 10px ${getStatusColor(mockPersona.status)}`,
            animation: 'pulse 2s infinite'
          }} />
          <span className="monospace" style={{ color: getStatusColor(mockPersona.status) }}>
            {mockPersona.status}...
          </span>
        </div>
      </div>

      <div style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
          <Fingerprint size={16} className="text-muted" />
          <h3 className="text-sm text-muted" style={{ textTransform: 'uppercase' }}>Voice Fingerprint</h3>
        </div>
        <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {mockPersona.traits.map((trait, i) => (
            <li key={i} className="text-sm" style={{ 
              paddingLeft: '1rem', 
              borderLeft: '2px solid var(--accent-green)' 
            }}>
              {trait}
            </li>
          ))}
        </ul>
      </div>
      
      <div style={{ marginTop: 'auto', paddingTop: '1rem', borderTop: '1px solid var(--border-color)' }}>
         <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Database size={14} className="text-muted" />
          <span className="text-xs text-muted monospace">Breeth Memory: Connected</span>
         </div>
      </div>

      <style>{`
        @keyframes pulse {
          0% { transform: scale(0.95); opacity: 0.8; }
          50% { transform: scale(1.1); opacity: 1; }
          100% { transform: scale(0.95); opacity: 0.8; }
        }
      `}</style>
    </div>
  );
}
