import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ExternalLink, ChevronDown, ChevronUp } from 'lucide-react';
import { mockPosts } from './mockData';

const PostCard = ({ post }) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      style={{
        backgroundColor: 'var(--panel-bg)',
        border: '1px solid var(--border-color)',
        borderRadius: '8px',
        padding: '1.25rem',
        marginBottom: '1rem'
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
        <h3 style={{ fontSize: '1.125rem', color: '#fff', margin: 0 }}>{post.title}</h3>
        <span className="text-xs text-muted monospace" style={{ whiteSpace: 'nowrap', marginLeft: '1rem' }}>
          {new Date(post.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </span>
      </div>
      
      <p style={{ fontSize: '0.9375rem', marginBottom: '1rem' }}>{post.text}</p>
      
      <div 
        onClick={() => setExpanded(!expanded)}
        style={{
          display: 'flex', alignItems: 'center', gap: '0.5rem', 
          cursor: 'pointer', color: 'var(--accent-green)', 
          fontSize: '0.875rem', fontWeight: 600,
          marginBottom: expanded ? '1rem' : '0'
        }}
      >
        {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        {expanded ? 'Hide Rationale' : 'View Rationale'}
      </div>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            style={{ overflow: 'hidden' }}
          >
            <div style={{ 
              backgroundColor: 'var(--bg-color)', 
              padding: '1rem', 
              borderRadius: '6px',
              border: '1px solid var(--border-color)',
              display: 'flex', flexDirection: 'column', gap: '1rem'
            }}>
              <div>
                <h4 className="text-xs text-muted monospace" style={{ textTransform: 'uppercase', marginBottom: '0.25rem' }}>Why Selected</h4>
                <p className="text-sm">{post.rationale.whySelected}</p>
              </div>
              <div>
                <h4 className="text-xs text-muted monospace" style={{ textTransform: 'uppercase', marginBottom: '0.25rem' }}>Why Now</h4>
                <p className="text-sm">{post.rationale.whyNow}</p>
              </div>
              <div>
                <h4 className="text-xs text-muted monospace" style={{ textTransform: 'uppercase', marginBottom: '0.25rem' }}>Sources</h4>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  {post.sources.map((url, i) => (
                    <a key={i} href={url} target="_blank" rel="noopener noreferrer" 
                       style={{ 
                         display: 'inline-flex', alignItems: 'center', gap: '0.25rem',
                         fontSize: '0.75rem', color: 'var(--text-main)', 
                         textDecoration: 'none', backgroundColor: 'var(--panel-bg)',
                         padding: '0.25rem 0.5rem', borderRadius: '4px',
                         border: '1px solid var(--border-color)'
                       }}>
                      <ExternalLink size={12} />
                      {new URL(url).hostname}
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default function CenterPanel() {
  return (
    <div className="panel center-panel">
      <div style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <h2 style={{ fontSize: '1.25rem' }}>Live Feed</h2>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--accent-green)' }} />
          <span className="text-xs text-muted monospace">Polling active</span>
        </div>
      </div>
      
      <div style={{ flex: 1 }}>
        {mockPosts.map(post => (
          <PostCard key={post.id} post={post} />
        ))}
      </div>
    </div>
  );
}
