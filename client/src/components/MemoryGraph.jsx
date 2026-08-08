import { useState, useEffect, useRef } from 'react';
import ForceGraph2D from 'react-force-graph-2d';

export default function MemoryGraph({ posts }) {
  const [graphData, setGraphData] = useState({ nodes: [], links: [] });
  const graphRef = useRef();

  useEffect(() => {
    if (!posts || posts.length === 0) return;

    const nodes = [];
    const links = [];
    const entitySet = new Set();

    posts.forEach(post => {
      // Add post node
      nodes.push({
        id: post.id,
        name: post.topic.slice(0, 30) + '...',
        val: 5,
        color: '#10b981', // emerald-500
        type: 'post'
      });

      // Links for continuesFrom
      if (post.threadedToId) {
        links.push({
          source: post.id,
          target: post.threadedToId,
          color: '#34d399'
        });
      }

      // Add entity nodes and link to post
      if (post.structuredEntities) {
        const entities = Array.isArray(post.structuredEntities) 
          ? post.structuredEntities 
          : Object.values(post.structuredEntities);
          
        entities.forEach(entity => {
          if (entity && typeof entity === 'string') {
            if (!entitySet.has(entity)) {
              entitySet.add(entity);
              nodes.push({
                id: entity,
                name: entity,
                val: 3,
                color: '#6366f1', // indigo-500
                type: 'entity'
              });
            }
            links.push({
              source: post.id,
              target: entity,
              color: '#4f46e5'
            });
          }
        });
      }
    });

    setGraphData({ nodes, links });
  }, [posts]);

  useEffect(() => {
    if (graphRef.current) {
      // Auto-zoom to fit nodes
      graphRef.current.zoomToFit(400);
    }
  }, [graphData]);

  return (
    <div className="w-full h-full rounded-xl overflow-hidden bg-black/40 border border-[#00FF41]/20">
      <ForceGraph2D
        ref={graphRef}
        graphData={graphData}
        width={400} // Will be responsive in parent
        height={300}
        nodeLabel="name"
        nodeColor={node => node.color}
        linkColor={link => link.color}
        nodeRelSize={4}
        linkWidth={1}
        linkDirectionalParticles={2}
        linkDirectionalParticleSpeed={0.01}
        backgroundColor="rgba(0,0,0,0)"
      />
    </div>
  );
}
