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

  // We will handle zoomToFit onEngineStop instead of immediately

  return (
    <div className="w-full h-full rounded-xl overflow-hidden bg-black/40 border border-[#00FF41]/20 relative">
      <div className="absolute top-3 left-3 z-10 bg-black/80 border border-[#00FF41]/30 p-3.5 rounded-lg text-xs font-mono backdrop-blur-md shadow-2xl pointer-events-none">
        <h3 className="text-[#00FF41] mb-2.5 font-bold uppercase tracking-widest border-b border-[#00FF41]/20 pb-1.5 flex items-center gap-2">
          <span>🧠</span> Live Knowledge Graph
        </h3>
        <ul className="space-y-2 text-white/80">
          <li className="flex items-center gap-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#10b981] inline-block shadow-[0_0_8px_#10b981]"></span>
            <span>Verified Threat Signals</span>
          </li>
          <li className="flex items-center gap-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#6366f1] inline-block shadow-[0_0_8px_#6366f1]"></span>
            <span>Extracted Entities (Systems/Actors)</span>
          </li>
        </ul>
        <div className="mt-3.5 text-[9.5px] text-[#00FF41]/70 border-t border-white/10 pt-2.5 leading-relaxed max-w-[200px]">
          Ada autonomously extracts entities from live RSS feeds and maps their relationships dynamically.
        </div>
      </div>
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
        onEngineStop={() => {
          if (graphRef.current) {
            graphRef.current.zoomToFit(400);
          }
        }}
      />
    </div>
  );
}
