'use client';

import { useNeuroStore } from '@/lib/neuro-store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Network, RefreshCw } from 'lucide-react';
import { motion } from 'framer-motion';
import { useState, useEffect, useCallback, useRef, useMemo } from 'react';

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

// Fixed layout: pre-computed positions in a unit square [0,1] x [0,1]
// Nodes are spread out by network group with good spacing
const GROUP_LAYOUT: Record<string, { cx: number; cy: number }> = {
  medial_temporal:  { cx: 0.32, cy: 0.58 },
  default_mode:    { cx: 0.55, cy: 0.25 },
  lateral_temporal: { cx: 0.72, cy: 0.55 },
  ventral_visual:  { cx: 0.52, cy: 0.78 },
  frontal:         { cx: 0.18, cy: 0.22 },
  visual:          { cx: 0.82, cy: 0.22 },
};

function computeNodePositions(nodes: NetworkNode[]): Record<string, { x: number; y: number }> {
  const positions: Record<string, { x: number; y: number }> = {};

  // Group nodes by group
  const grouped: Record<string, NetworkNode[]> = {};
  for (const n of nodes) {
    if (!grouped[n.group]) grouped[n.group] = [];
    grouped[n.group].push(n);
  }

  for (const [group, groupNodes] of Object.entries(grouped)) {
    const layout = GROUP_LAYOUT[group] ?? { cx: 0.5, cy: 0.5 };
    const count = groupNodes.length;
    const spreadRadius = Math.max(0.08, 0.04 * count); // larger groups get more space

    groupNodes.forEach((node, idx) => {
      const angle = (idx / count) * Math.PI * 2 - Math.PI / 2; // start from top
      // Alternate radius slightly so nodes don't sit on a perfect circle
      const r = spreadRadius * (0.7 + (idx % 2) * 0.4);
      positions[node.id] = {
        x: layout.cx + Math.cos(angle) * r,
        y: layout.cy + Math.sin(angle) * r,
      };
    });
  }

  return positions;
}

const PADDING = 40; // px padding inside SVG for labels

export default function BrainNetworkPanel() {
  const { selectedPatient } = useNeuroStore();
  const [nodes, setNodes] = useState<NetworkNode[]>([]);
  const [edges, setEdges] = useState<NetworkEdge[]>([]);
  const [loading, setLoading] = useState(false);
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [dims, setDims] = useState({ w: 800, h: 520 });

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

  // Measure container size — re-measures on resize AND when panel becomes visible
  useEffect(() => {
    const measure = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        if (rect.width > 0 && rect.height > 0) {
          setDims({ w: rect.width, h: rect.height });
        }
      }
    };

    // Immediate measurement
    measure();

    // Also measure after a short delay to catch late layout
    const t = setTimeout(measure, 100);

    const observer = new ResizeObserver(measure);
    if (containerRef.current) observer.observe(containerRef.current);

    return () => {
      clearTimeout(t);
      observer.disconnect();
    };
  }, []);

  // Compute node positions in normalized [0,1] space
  const nodePositionsNorm = useMemo(() => computeNodePositions(nodes), [nodes]);

  // Scale normalized positions to pixel space with padding
  const nodePositions = useMemo(() => {
    const plotW = dims.w - PADDING * 2;
    const plotH = dims.h - PADDING * 2;
    const result: Record<string, { x: number; y: number }> = {};
    for (const [id, pos] of Object.entries(nodePositionsNorm)) {
      result[id] = {
        x: PADDING + pos.x * plotW,
        y: PADDING + pos.y * plotH,
      };
    }
    return result;
  }, [nodePositionsNorm, dims]);

  const connectedEdges = hoveredNode
    ? edges.filter(e => e.source === hoveredNode || e.target === hoveredNode)
    : edges;

  const connectedNodeIds = useMemo(() => {
    if (!hoveredNode) return new Set(nodes.map(n => n.id));
    const ids = new Set<string>();
    ids.add(hoveredNode);
    for (const e of edges) {
      if (e.source === hoveredNode || e.target === hoveredNode) {
        ids.add(e.source);
        ids.add(e.target);
      }
    }
    return ids;
  }, [hoveredNode, edges, nodes]);

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
                <div className="w-6 h-0.5 bg-neuro/40" />
                <span className="text-[10px] text-muted-foreground">Healthy Connection</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-6 h-0.5 border-t-2 border-dashed border-risk-high" />
                <span className="text-[10px] text-muted-foreground">Degraded</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Graph */}
      <motion.div variants={item}>
        <Card className="bg-card border-border">
          <CardContent className="p-0 relative" style={{ height: 520 }} ref={containerRef}>
            {nodes.length > 0 && (
              <svg
                width="100%"
                height="100%"
                viewBox={`0 0 ${dims.w} ${dims.h}`}
                preserveAspectRatio="xMidYMid meet"
                className="overflow-visible"
              >
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
                      stroke={isDegraded ? 'rgba(239,68,68,0.5)' : 'rgba(20,184,166,0.25)'}
                      strokeWidth={hoveredNode ? 2.5 : 1.5}
                      strokeDasharray={isDegraded ? '5 3' : 'none'}
                      opacity={hoveredNode ? 1 : 0.7}
                      style={{ transition: 'all 0.2s ease' }}
                    />
                  );
                })}

                {/* Nodes */}
                {nodes
                  .filter(n => connectedNodeIds.has(n.id))
                  .map((node) => {
                    const pos = nodePositions[node.id];
                    if (!pos) return null;
                    const r = 10 + node.centrality * 16;
                    const color = groupColors[node.group] ?? '#14b8a6';
                    const isHovered = hoveredNode === node.id;
                    const isDimmed = hoveredNode && !isHovered && !edges.some(
                      e => (e.source === hoveredNode && e.target === node.id) ||
                           (e.target === hoveredNode && e.source === node.id)
                    );
                    const label = node.label.length > 14 ? node.label.slice(0, 13) + '..' : node.label;

                    return (
                      <g
                        key={node.id}
                        onMouseEnter={() => setHoveredNode(node.id)}
                        onMouseLeave={() => setHoveredNode(null)}
                        style={{ cursor: 'pointer' }}
                      >
                        {/* Outer glow on hover */}
                        {isHovered && (
                          <circle
                            cx={pos.x} cy={pos.y} r={r + 6}
                            fill="none" stroke={color} strokeWidth={1.5} opacity={0.4}
                          />
                        )}
                        {/* Degradation ring */}
                        {node.degradation > 0.2 && (
                          <circle
                            cx={pos.x} cy={pos.y} r={r + 4}
                            fill="none" stroke="#ef4444" strokeWidth={1.2}
                            strokeDasharray="3 2" opacity={isDimmed ? 0.2 : 0.6}
                          />
                        )}
                        {/* Main node */}
                        <circle
                          cx={pos.x} cy={pos.y} r={r}
                          fill={color}
                          opacity={isDimmed ? 0.15 : isHovered ? 0.95 : 0.55}
                          stroke={isHovered ? '#ffffff' : color}
                          strokeWidth={isHovered ? 2.5 : 1}
                          style={{ transition: 'all 0.2s ease' }}
                        />
                        {/* Label — placed below the node */}
                        <text
                          x={pos.x}
                          y={pos.y + r + 13}
                          textAnchor="middle"
                          fill="oklch(0.8 0 0)"
                          fontSize={10}
                          fontWeight="500"
                          style={{ pointerEvents: 'none', userSelect: 'none', opacity: isDimmed ? 0.2 : 0.9 }}
                        >
                          {label}
                        </text>
                      </g>
                    );
                  })}
              </svg>
            )}

            {/* Loading state */}
            {nodes.length === 0 && loading && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-sm text-muted-foreground animate-pulse">Loading brain network...</div>
              </div>
            )}

            {/* Hovered node info tooltip */}
            {hoveredNode && (() => {
              const n = nodes.find(nd => nd.id === hoveredNode);
              if (!n) return null;
              const pos = nodePositions[hoveredNode];
              const connectedCount = edges.filter(e => e.source === n.id || e.target === n.id).length;
              const avgChange = edges
                .filter(e => e.source === n.id || e.target === n.id)
                .reduce((s, e) => s + e.change, 0) / connectedCount;
              return (
                <div
                  className="absolute top-3 right-3 w-52 bg-background/95 backdrop-blur-sm border border-border rounded-lg p-3 space-y-2 z-10"
                >
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: groupColors[n.group] }} />
                    <p className="text-xs font-semibold">{n.label}</p>
                  </div>
                  <div className="space-y-1.5 text-[10px]">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Centrality</span>
                      <span className="font-medium">{(n.centrality * 100).toFixed(0)}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Degradation</span>
                      <span className={`font-medium ${n.degradation > 0.5 ? 'text-risk-high' : n.degradation > 0.3 ? 'text-risk-mid' : 'text-risk-low'}`}>
                        {(n.degradation * 100).toFixed(0)}%
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Connections</span>
                      <span className="font-medium">{connectedCount}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Avg. Change</span>
                      <span className={`font-medium ${avgChange < -0.3 ? 'text-risk-high' : ''}`}>
                        {avgChange > 0 ? '+' : ''}{(avgChange * 100).toFixed(0)}%
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Network</span>
                      <span className="font-medium">{groupLabels[n.group]}</span>
                    </div>
                  </div>
                  <div className="border-t border-border pt-1.5 space-y-0.5 max-h-24 overflow-y-auto">
                    {edges
                      .filter(e => e.source === n.id || e.target === n.id)
                      .map((e, i) => {
                        const otherId = e.source === n.id ? e.target : e.source;
                        const other = nodes.find(nd => nd.id === otherId);
                        return (
                          <div key={i} className="flex items-center justify-between text-[10px]">
                            <span className="truncate mr-2">{other?.label}</span>
                            <span className={`font-mono flex-shrink-0 ${e.change < -0.3 ? 'text-risk-high' : 'text-muted-foreground'}`}>
                              {e.change > 0 ? '+' : ''}{(e.change * 100).toFixed(0)}%
                            </span>
                          </div>
                        );
                      })}
                  </div>
                </div>
              );
            })()}
          </CardContent>
        </Card>
      </motion.div>

      {/* Network Stats */}
      <motion.div variants={item}>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'Total Nodes', val: nodes.length, sub: 'Brain regions' },
            { label: 'Total Edges', val: edges.length, sub: 'Neural connections' },
            {
              label: 'Most Degraded',
              val: nodes.length > 0
                ? (nodes.reduce((a, b) => a.degradation > b.degradation ? a : b)?.label.split(' ')[0] ?? 'N/A')
                : 'N/A',
              sub: nodes.length > 0
                ? `${((nodes.reduce((a, b) => a.degradation > b.degradation ? a : b)?.degradation ?? 0) * 100).toFixed(0)}% degraded`
                : '',
            },
            {
              label: 'Avg. Centrality',
              val: nodes.length > 0
                ? `${((nodes.reduce((s, n) => s + n.centrality, 0) / nodes.length) * 100).toFixed(1)}%`
                : 'N/A',
              sub: 'Network importance',
            },
          ].map((stat, i) => (
            <Card key={i} className="bg-card border-border">
              <CardContent className="p-3 text-center">
                <Network className="w-4 h-4 text-neuro mx-auto mb-1" />
                <p className="text-lg font-bold">{stat.val}</p>
                <p className="text-[10px] text-muted-foreground">{stat.label}</p>
                {stat.sub && <p className="text-[9px] text-muted-foreground/60">{stat.sub}</p>}
              </CardContent>
            </Card>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}