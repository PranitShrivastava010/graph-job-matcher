import React, { useEffect, useRef, useState } from 'react';
import { ZoomIn, ZoomOut, RotateCcw, Filter, Sparkles, Layers } from 'lucide-react';

export default function InteractiveGraphCanvas({ graphData }) {
  const canvasRef = useRef(null);
  const [selectedNode, setSelectedNode] = useState(null);
  const [filterType, setFilterType] = useState('ALL');
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const nodesRef = useRef([]);
  const edgesRef = useRef([]);
  const animationFrameRef = useRef(null);

  // Initialize node positions with force layout
  useEffect(() => {
    if (!graphData || !graphData.nodes) return;

    const canvas = canvasRef.current;
    const width = canvas ? canvas.width : 800;
    const height = canvas ? canvas.height : 500;

    const initialNodes = graphData.nodes.map((n, i) => {
      const angle = (i / graphData.nodes.length) * 2 * Math.PI;
      const radius = 120 + Math.random() * 120;
      return {
        ...n,
        x: width / 2 + Math.cos(angle) * radius,
        y: height / 2 + Math.sin(angle) * radius,
        vx: 0,
        vy: 0,
        radius: n.type === 'Job' ? 18 : n.type === 'Skill' ? 14 : n.type === 'User' ? 20 : 16
      };
    });

    const initialEdges = (graphData.edges || []).map(e => ({
      ...e,
      sourceNode: initialNodes.find(n => n.id === e.source),
      targetNode: initialNodes.find(n => n.id === e.target)
    })).filter(e => e.sourceNode && e.targetNode);

    nodesRef.current = initialNodes;
    edgesRef.current = initialEdges;

    // Run simple spring simulation
    const simulate = () => {
      const nodes = nodesRef.current;
      const edges = edgesRef.current;

      // Spring forces for edges
      for (const edge of edges) {
        const dx = edge.targetNode.x - edge.sourceNode.x;
        const dy = edge.targetNode.y - edge.sourceNode.y;
        const dist = Math.sqrt(dx * dx + dy * dy) || 1;
        const targetDist = 90;
        const force = (dist - targetDist) * 0.02;

        const fx = (dx / dist) * force;
        const fy = (dy / dist) * force;

        edge.sourceNode.vx += fx;
        edge.sourceNode.vy += fy;
        edge.targetNode.vx -= fx;
        edge.targetNode.vy -= fy;
      }

      // Repulsion between all nodes
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[j].x - nodes[i].x;
          const dy = nodes[j].y - nodes[i].y;
          const distSq = dx * dx + dy * dy || 1;
          if (distSq < 25000) {
            const force = 300 / distSq;
            const dist = Math.sqrt(distSq);
            const fx = (dx / dist) * force;
            const fy = (dy / dist) * force;

            nodes[i].vx -= fx;
            nodes[i].vy -= fy;
            nodes[j].vx += fx;
            nodes[j].vy += fy;
          }
        }
      }

      // Center gravity & apply velocity
      for (const node of nodes) {
        const cdx = width / 2 - node.x;
        const cdy = height / 2 - node.y;
        node.vx += cdx * 0.002;
        node.vy += cdy * 0.002;

        node.vx *= 0.85; // damping
        node.vy *= 0.85;

        node.x += node.vx;
        node.y += node.vy;
      }

      draw();
      animationFrameRef.current = requestAnimationFrame(simulate);
    };

    simulate();

    return () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    };
  }, [graphData]);

  const getNodeColor = (type) => {
    switch (type) {
      case 'Job': return '#3b82f6'; // Blue
      case 'Skill': return '#10b981'; // Emerald
      case 'User': return '#8b5cf6'; // Purple
      case 'Company': return '#f59e0b'; // Amber
      default: return '#64748b';
    }
  };

  const draw = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;

    ctx.clearRect(0, 0, width, height);
    ctx.save();

    // Pan & zoom transform
    ctx.translate(offset.x + width / 2, offset.y + height / 2);
    ctx.scale(zoom, zoom);
    ctx.translate(-width / 2, -height / 2);

    // Draw edges
    for (const edge of edgesRef.current) {
      if (filterType !== 'ALL' && edge.sourceNode.type !== filterType && edge.targetNode.type !== filterType) {
        continue;
      }

      const isConnectedToSelected = selectedNode && 
        (edge.sourceNode.id === selectedNode.id || edge.targetNode.id === selectedNode.id);

      ctx.beginPath();
      ctx.moveTo(edge.sourceNode.x, edge.sourceNode.y);
      ctx.lineTo(edge.targetNode.x, edge.targetNode.y);
      ctx.strokeStyle = isConnectedToSelected ? '#38bdf8' : '#334155';
      ctx.lineWidth = isConnectedToSelected ? 2 : 1;
      ctx.stroke();

      // Label on edge if selected
      if (isConnectedToSelected) {
        const midX = (edge.sourceNode.x + edge.targetNode.x) / 2;
        const midY = (edge.sourceNode.y + edge.targetNode.y) / 2;
        ctx.fillStyle = '#94a3b8';
        ctx.font = '10px JetBrains Mono, monospace';
        ctx.fillText(edge.type, midX + 4, midY - 4);
      }
    }

    // Draw nodes
    for (const node of nodesRef.current) {
      if (filterType !== 'ALL' && node.type !== filterType) continue;

      const isSelected = selectedNode && selectedNode.id === node.id;
      const color = getNodeColor(node.type);

      // Node circle
      ctx.beginPath();
      ctx.arc(node.x, node.y, node.radius, 0, 2 * Math.PI);
      ctx.fillStyle = isSelected ? '#ffffff' : color;
      ctx.shadowColor = color;
      ctx.shadowBlur = isSelected ? 20 : 8;
      ctx.fill();

      // Border
      ctx.strokeStyle = isSelected ? '#38bdf8' : '#0f172a';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Label text
      ctx.shadowBlur = 0;
      ctx.fillStyle = '#e2e8f0';
      ctx.font = isSelected ? 'bold 12px Plus Jakarta Sans, sans-serif' : '11px Plus Jakarta Sans, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(node.label || node.id, node.x, node.y + node.radius + 14);
    }

    ctx.restore();
  };

  const handleCanvasClick = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const mouseX = (e.clientX - rect.left - offset.x - canvas.width / 2) / zoom + canvas.width / 2;
    const mouseY = (e.clientY - rect.top - offset.y - canvas.height / 2) / zoom + canvas.height / 2;

    let clicked = null;
    for (const node of nodesRef.current) {
      const dx = node.x - mouseX;
      const dy = node.y - mouseY;
      if (Math.sqrt(dx * dx + dy * dy) <= node.radius + 5) {
        clicked = node;
        break;
      }
    }
    setSelectedNode(clicked);
  };

  const handleMouseDown = (e) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - offset.x, y: e.clientY - offset.y });
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    setOffset({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y
    });
  };

  const handleMouseUp = () => setIsDragging(false);

  return (
    <div className="relative bg-slate-950 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl">
      {/* Top Toolbar */}
      <div className="absolute top-4 left-4 right-4 z-10 flex flex-wrap items-center justify-between gap-3 pointer-events-none">
        <div className="flex items-center space-x-2 bg-slate-900/90 backdrop-blur-md border border-slate-800 p-1.5 rounded-xl pointer-events-auto">
          <span className="text-xs font-semibold text-slate-400 px-2 flex items-center space-x-1">
            <Filter className="w-3 h-3 text-blue-400" />
            <span>Filter:</span>
          </span>
          {['ALL', 'Job', 'Skill', 'User', 'Company'].map(type => (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
                filterType === type
                  ? 'bg-blue-600 text-white font-semibold shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              {type}
            </button>
          ))}
        </div>

        <div className="flex items-center space-x-1 bg-slate-900/90 backdrop-blur-md border border-slate-800 p-1 rounded-xl pointer-events-auto">
          <button
            onClick={() => setZoom(z => Math.min(z + 0.2, 2.5))}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
            title="Zoom in"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            onClick={() => setZoom(z => Math.max(z - 0.2, 0.4))}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
            title="Zoom out"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <button
            onClick={() => { setZoom(1); setOffset({ x: 0, y: 0 }); }}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
            title="Reset view"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* HTML5 Canvas */}
      <canvas
        ref={canvasRef}
        width={1000}
        height={580}
        onClick={handleCanvasClick}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        className="w-full h-[580px] cursor-grab active:cursor-grabbing graph-grid-bg"
      />

      {/* Node Inspector Drawer */}
      {selectedNode && (
        <div className="absolute bottom-4 left-4 max-w-sm bg-slate-900/95 backdrop-blur-md border border-blue-500/40 rounded-2xl p-4 shadow-2xl z-10 animate-in fade-in slide-in-from-bottom-2">
          <div className="flex items-center justify-between mb-2">
            <span
              className="text-[10px] font-mono uppercase font-bold px-2 py-0.5 rounded"
              style={{ backgroundColor: `${getNodeColor(selectedNode.type)}20`, color: getNodeColor(selectedNode.type) }}
            >
              {selectedNode.type} Node
            </span>
            <button
              onClick={() => setSelectedNode(null)}
              className="text-xs text-slate-500 hover:text-slate-300"
            >
              ✕
            </button>
          </div>
          <h4 className="text-base font-bold text-white mb-1">{selectedNode.label}</h4>
          {selectedNode.properties?.description && (
            <p className="text-xs text-slate-400 mb-2 leading-relaxed">{selectedNode.properties.description}</p>
          )}
          <div className="text-[11px] font-mono text-slate-400 space-y-1 bg-slate-950 p-2.5 rounded-xl border border-slate-800">
            {Object.entries(selectedNode.properties || {}).filter(([k]) => k !== 'description' && k !== 'passwordHash').map(([k, v]) => (
              <div key={k} className="flex justify-between">
                <span className="text-slate-500">{k}:</span>
                <span className="text-slate-300 font-semibold truncate ml-2">{String(v)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Bottom Graph Legend */}
      <div className="absolute bottom-4 right-4 flex items-center space-x-3 bg-slate-900/90 backdrop-blur-md border border-slate-800 px-3 py-2 rounded-xl text-xs text-slate-400 pointer-events-none">
        <div className="flex items-center space-x-1.5"><span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span><span>Job</span></div>
        <div className="flex items-center space-x-1.5"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span><span>Skill</span></div>
        <div className="flex items-center space-x-1.5"><span className="w-2.5 h-2.5 rounded-full bg-purple-500"></span><span>Candidate</span></div>
        <div className="flex items-center space-x-1.5"><span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span><span>Company</span></div>
      </div>
    </div>
  );
}
