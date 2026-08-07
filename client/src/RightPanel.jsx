import React from 'react';
import { Check, X, Search, FileText } from 'lucide-react';
import { mockTimeline } from './mockData';

const TimelineItem = ({ item }) => {
  const getIcon = () => {
    switch (item.type) {
      case 'discovered': return <Search size={14} className="text-muted" />;
      case 'rejected': return <X size={14} color="#ef4444" />;
      case 'published': return <Check size={14} color="#10b981" />;
      default: return <FileText size={14} className="text-muted" />;
    }
  };

  const getBorderColor = () => {
    if (item.type === 'rejected') return '#ef4444';
    if (item.type === 'published') return '#10b981';
    return 'var(--border-color)';
  };

  return (
    <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', position: 'relative' }}>
      {/* Vertical line connector */}
      <div style={{ 
        position: 'absolute', left: '11px', top: '24px', bottom: '-24px', 
        width: '2px', backgroundColor: 'var(--border-color)', zIndex: 0 
      }} />
      
      <div style={{ 
        width: '24px', height: '24px', borderRadius: '50%', 
        backgroundColor: 'var(--panel-bg)', border: `2px solid ${getBorderColor()}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        zIndex: 1, flexShrink: 0
      }}>
        {getIcon()}
      </div>
      
      <div style={{ flex: 1, paddingTop: '2px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
          <span className="text-xs text-muted monospace" style={{ textTransform: 'uppercase' }}>{item.type}</span>
          <span className="text-xs text-muted monospace">{item.time}</span>
        </div>
        
        <p style={{ 
          fontSize: '0.875rem', 
          color: item.type === 'rejected' ? 'var(--text-muted)' : 'var(--text-main)',
          textDecoration: item.type === 'rejected' ? 'line-through' : 'none',
          marginBottom: '0.25rem'
        }}>
          {item.topic}
        </p>
        
        {item.reason && (
          <p className="text-xs" style={{ color: '#ef4444', fontStyle: 'italic' }}>
            {item.reason}
          </p>
        )}
      </div>
    </div>
  );
};

export default function RightPanel() {
  return (
    <div className="panel right-panel">
      <h2 style={{ fontSize: '1.125rem', marginBottom: '1.5rem' }}>Reasoning Timeline</h2>
      
      <div style={{ flex: 1 }}>
        {mockTimeline.map((item, index) => (
          <TimelineItem key={item.id} item={item} />
        ))}
      </div>
    </div>
  );
}
