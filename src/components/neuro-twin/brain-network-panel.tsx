'use client';

import { useNeuroStore } from '@/lib/neuro-store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Network, RefreshCw } from 'lucide-react';
import { motion } from 'framer-motion';
import { useState, useEffect, useCallback, useRef } from 'react';

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.08 } } };
const item = { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0 } };

interface NetworkNode {
  id: string; label: string; group: string; centrality: number; degradation: number;
}
interface NetworkEdge {
  source: string; target: string; strength: number; change: number;
}

const groupColors: Record<string, string> = {
  medial_temporal: '#ef4444',
  default_mode: '#f97316',
  lateral_temporal: '#eab308',
  ventral_visual: '#22c55e',
  frontal: '#14b8a6',
  visual: '#6366f1',
};

const groupLabels: Record<string, string> = {
  medial_temporal: 'Medial Temporal',
  default_mode: 'Default Mode Network',
  lateral_temporal: 'Lateral Temporal',
  ventral_visual: 'Ventral Visual',
  frontal: 'Frontal',
  visual: 'Visual',
};

export default function BrainNetworkPanel() {
  const { selectedPatient } = useNeuroStore();
  const [nodes, setNodes] = useState<NetworkNode[]>([]);
  const [edges, setEdges] = useState<NetworkEdge[]>([]);
  const [loading, setLoading] = useState(false);
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const [svgSize, setSvgSize] = useState({ w: 700, h: 500 });

  const fetchNetwork = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/neuro', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'brain-network', patientId: selectedPatient?.id }),
      });
      const d = await res.json();
      setNodes(d.nodes);
      setEdges(d.edges);
    } finally {
      setLoading(false);
    }
  }, [selectedPatient?.id]);

  useEffect(() => { fetchNetwork(); }, [fetchNetwork]);

  useEffect(() => {
    const updateSize = () => {
      if (svgRef.current) {
        const rect = svgRef.current.parentElement?.getBoundingClientRect();
        if (rect) setSvgSize({ w: rect.width, h: Math.max(rect.height, 400) });
      }
    };
    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  // Simple force-directed layout positions
  const nodePositions = nodes.reduce<Record<string, { x: number; y: number }>>((acc, node, i) => {
    const group = node.group;
    const groupNodes = nodes.filter(n => n.group === group);
    const idx = groupNodes.indexOf(node);
    const cx = { medial_temporal: 0.3, default_mode: 0.55, lateral_temporal: 0.7, ventral_visual: 0.45, frontal: 0.15, visual: 0.8 }[group] ?? 0.5;
    const cy = { medial_temporal: 0.45, default_mode: 0.25, lateral_temporal: 0.6, ventral_visual: 0.75, frontal: 0.2, visual: 0.7 }[group] ?? 0.5;
    const angle = (idx / Math.max(groupNodes.length, 1)) * Math.PI * 2;
    const r = 0.08 + (idx * 0.03);
    acc[node.id] = {
      x: (cx + Math.cos(angle) * r) * svgSize.w,
      y: (cy + Math.sin(angle) * r) * svgSize.h,
    };
    return acc;
  }, {});

  const connectedEdges = hoveredNode
    ? edges.filter(e => e.source === hoveredNode || e.target === hoveredNode)
    : edges;

  const connectedNodeIds = hoveredNode
    ? new Set([
        hoveredNode,
        ...edges.filter(e => e.source === hoveredNode || e.target === hoveredNode).flatMap(e => [e.source, e.target]),
      ])
    : new Set(nodes.map(n => n.id));

  if (!selectedPatient) return null;

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-4">
      <motion.div variants={item} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Brain Network Graph</h2>
          <p className="text-sm text-muted-foreground mt-1">
            GNN-based connectivity analysis · {selectedPatient.name}
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={fetchNetwork} disabled={loading}
          className="border-neuro/30 text-neuro hover:bg-neuro/10">
          <RefreshCw className={`w-3.5 h-3.5 mr-2 ${loading ? 'animate-spin' : ''}`} /> Refresh
        </Button>
      </motion.div>

      {/* Legend */}
      <motion.div variants={item}>
        <Card className="bg-card border-border">
          <CardContent className="p-3">
            <div className="flex flex-wrap gap-3">
              {Object.entries(groupLabels).map(([key, label]) => (
                <div key={key} className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: groupColors[key] }} />
                  <span className="text-[10px] text-muted-foreground">{label}</span>
                </div>
              ))}
              <div className="flex items-center gap-1.5 ml-4">
                <div className="w-6 h-0.5 bg-muted-foreground/30" />
                <span className="text-[10px] text-muted-foreground">Connection</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-6 h-0.5 bg-risk-high/60" style={{ borderTop: '2px dashed #ef4444' }} />
                <span className="text-[10px] text-muted-foreground">Degraded</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Graph */}
      <motion.div variants={item}>
        <Card className="bg-card border-border">
          <CardContent className="p-0 relative" style={{ height: 500 }}>
            <svg ref={svgRef} width="100%" height="100%" viewBox={`0 0 ${svgSize.w} ${svgSize.h}`}>
              {/* Edges */}
              {connectedEdges.map((edge, i) => {
                const from = nodePositions[edge.source];
                const to = nodePositions[edge.target];
                if (!from || !to) return null;
                const isDegraded = Math.abs(edge.change) > 0.3;
                return (
                  <line
                    key={`edge-${i}`}
                    x1={from.x} y1={from.y}
                    x2={to.x} y2={to.y}
                    stroke={isDegraded ? 'rgba(239,68,68,0.4)' : 'rgba(20,184,166,0.2)'}
                    strokeWidth={hoveredNode ? 2 : 1.5}
                    strokeDasharray={isDegraded ? '4 3' : 'none'}
                    opacity={hoveredNode ? 1 : 0.6}
                  />
                );
              })}
              {/* Nodes */}
              {nodes
                .filter(n => connectedNodeIds.has(n.id))
                .map((node) => {
                  const pos = nodePositions[node.id];
                  if (!pos) return null;
                  const r = 8 + node.centrality * 18;
                  const color = groupColors[node.group] ?? '#14b8a6';
                  const isHovered = hoveredNode === node.id;
                  return (
                    <g key={node.id} onMouseEnter={() => setHoveredNode(node.id)} onMouseLeave={() => setHoveredNode(null)}>
                      <circle
                        cx={pos.x} cy={pos.y} r={r}
                        fill={color} opacity={isHovered ? 0.9 : 0.6}
                        stroke={isHovered ? '#fff' : color}
                        strokeWidth={isHovered ? 2 : 1}
                        className="cursor-pointer transition-all duration-200"
                      />
                      {/* Degradation ring */}
                      {node.degradation > 0.2 && (
                        <circle
                          cx={pos.x} cy={pos.y} r={r + 4}
                          fill="none" stroke="#ef4444" strokeWidth={1}
                          strokeDasharray="3 2" opacity={0.5}
                        />
                      )}
                      <text
                        x={pos.x} y={pos.y + 4}
                        textAnchor="middle" fill="#fff" fontSize={9} fontWeight="600"
                        className="pointer-events-none select-none"
                      >
                        {node.label.length > 12 ? node.label.slice(0, 11) + '.' : node.label}
                      </text>
                    </g>
                  );
                })}
            </svg>

            {/* Hovered node info */}
            {hoveredNode && (
              <div className="absolute top-3 right-3 w-48 bg-background/95 backdrop-blur border border-border rounded-lg p-3 space-y-2">
                {(() => {
                  const n = nodes.find(nd => nd.id === hoveredNode);
                  if (!n) return null;
                  return (
                    <>
                      <p className="text-xs font-semibold">{n.label}</p>
                      <div className="space-y-1 text-[10px]">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Centrality</span>
                          <span>{(n.centrality * 100).toFixed(0)}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Degradation</span>
                          <span className={n.degradation > 0.5 ? 'text-risk-high' : n.degradation > 0.3 ? 'text-risk-mid' : 'text-risk-low'}>
                            {(n.degradation * 100).toFixed(0)}%
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Network</span>
                          <span>{groupLabels[n.group]}</span>
                        </div>
                      </div>
                      <div className="space-y-0.5">
                        <p className="text-[10px] text-muted-foreground">Connections:</p>
                        {edges
                          .filter(e => e.source === n.id || e.target === n.id)
                          .map((e, i) => {
                            const otherId = e.source === n.id ? e.target : e.source;
                            const other = nodes.find(nd => nd.id === otherId);
                            return (
                              <p key={i} className="text-[10px]">
                                → {other?.label}{' '}
                                <span className={e.change < -0.3 ? 'text-risk-high' : ''}>
                                  ({e.change > 0 ? '+' : ''}{(e.change * 100).toFixed(0)}%)
                                </span>
                              </p>
                            );
                          })}
                      </div>
                    </>
                  );
                })()}
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Network Stats */}
      <motion.div variants={item}>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'Total Nodes', val: nodes.length, icon: Network },
            { label: 'Total Edges', val: edges.length, icon: Network },
            {
              label: 'Most Degraded',
              val: nodes.reduce((a, b) => a.degradation > b.degradation ? a : b)?.label.split(' ')[0] ?? 'N/A',
              icon: Network,
            },
            {
              label: 'Avg. Centrality',
              val: `${((nodes.reduce((s, n) => s + n.centrality, 0) / nodes.length) * 100).toFixed(1)}%`,
              icon: Network,
            },
          ].map((stat, i) => (
            <Card key={i} className="bg-card border-border">
              <CardContent className="p-3 text-center">
                <stat.icon className="w-4 h-4 text-neuro mx-auto mb-1" />
                <p className="text-lg font-bold">{stat.val}</p>
                <p className="text-[10px] text-muted-foreground">{stat.label}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}