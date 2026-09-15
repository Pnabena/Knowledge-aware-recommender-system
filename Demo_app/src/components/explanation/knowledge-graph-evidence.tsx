"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Background, Controls, Handle, MarkerType, Position, ReactFlow, type Edge, type Node, type NodeProps, type ReactFlowInstance } from "@xyflow/react";
import { Network, Tag, UserRound } from "lucide-react";
import { BusinessIcon } from "../business-icon";
import type { BusinessExplanation } from "@/types/explanation";

type EvidenceNodeData = { label: string; kind: "user" | "history" | "category" | "target"; detail: string; highlighted: boolean; selected: boolean; onSelect?: () => void };
type EvidenceNode = Node<EvidenceNodeData, "evidence">;

function GraphNode({ data }: NodeProps<EvidenceNode>) {
  const Icon = data.kind === "user" ? UserRound : Tag;
  const content = <>{data.kind === "history" || data.kind === "target" ? <BusinessIcon /> : <Icon size={15} aria-hidden="true" />}<span><small>{data.kind === "user" ? "Your activity" : data.kind === "history" ? "In your history" : data.kind === "target" ? "This place" : "Shared category"}</small><strong>{data.label}</strong></span></>;
  return <div className={`kg-node kg-node-${data.kind} ${data.highlighted ? "kg-highlighted" : ""}`}>
    <Handle type="target" position={Position.Top} />
    {data.kind === "history" ? <button type="button" className="nodrag nopan" onClick={data.onSelect} aria-pressed={data.selected} aria-label={`Highlight connections for ${data.label}`}>{content}</button> : <div tabIndex={0} aria-label={`${data.label}. ${data.detail}`}>{content}</div>}
    <span className="kg-node-tooltip" role="tooltip">{data.detail}</span>
    <Handle type="source" position={Position.Bottom} />
  </div>;
}
const nodeTypes = { evidence: GraphNode };

export function KnowledgeGraphEvidence({ explanation }: { explanation: BusinessExplanation }) {
  const [selected, setSelected] = useState<string | null>(null);
  const [compact, setCompact] = useState(false);
  const [instance, setInstance] = useState<ReactFlowInstance<EvidenceNode, Edge> | null>(null);
  const container = useRef<HTMLDivElement>(null);
  const history = explanation.historyEvidence;
  useEffect(() => {
    if (!container.current) return;
    const observer = new ResizeObserver(([entry]) => setCompact(entry.contentRect.width < 480));
    observer.observe(container.current);
    return () => observer.disconnect();
  }, []);
  useEffect(() => {
    const frame = requestAnimationFrame(() => instance?.fitView({ padding: .12, maxZoom: 1 }));
    return () => cancelAnimationFrame(frame);
  }, [instance, compact]);
  const { nodes, edges } = useMemo(() => {
    const businesses = history?.businesses.slice(0, 3) ?? [];
    const categories = history?.categories.filter((category) => category.historicalBusinessCount > 0).slice(0, 4) ?? [];
    const graphWidth = compact ? 320 : 610;
    const nodeWidth = compact ? 132 : 155;
    const center = (graphWidth - nodeWidth) / 2;
    const rowX = (index: number, total: number) => total === 1 ? center : index * (graphWidth - nodeWidth) / (total - 1);
    const chosen = businesses.find((business) => business.businessId === selected);
    const shared = chosen?.sharedCategories ?? [];
    const nodes: EvidenceNode[] = [
      { id: "user", type: "evidence", position: { x: center, y: 0 }, data: { label: "You", kind: "user", detail: "The current demo user's recorded activity", highlighted: Boolean(chosen), selected: false } },
      ...businesses.map((business, index): EvidenceNode => ({ id: business.businessId, type: "evidence", position: { x: rowX(index, businesses.length), y: 108 }, data: { label: business.name, kind: "history", detail: `${business.interactionLabel}. Shared: ${business.sharedCategories.join(", ")}.`, highlighted: selected === business.businessId, selected: selected === business.businessId, onSelect: () => setSelected((previous) => previous === business.businessId ? null : business.businessId) } })),
      ...categories.map((category, index): EvidenceNode => ({ id: `category-${index}`, type: "evidence", position: { x: rowX(index, categories.length), y: 230 }, data: { label: category.category, kind: "category", detail: `${category.historicalBusinessCount} businesses in your history share this category.`, highlighted: shared.includes(category.category), selected: false } })),
      { id: "target", type: "evidence", position: { x: center, y: 355 }, data: { label: explanation.business.name, kind: "target", detail: "The business being explained; this local graph shows relevant connections, not the model's exact reasoning path.", highlighted: Boolean(chosen), selected: false } },
    ];
    const edges: Edge[] = [];
    const edge = (source: string, target: string, highlighted: boolean, label?: string) => ({ id: `${source}-${target}`, source, target, type: "smoothstep", label, markerEnd: { type: MarkerType.ArrowClosed, width: 14, height: 14, color: highlighted ? "#458966" : "#c5d3c6" }, style: { stroke: highlighted ? "#458966" : "#c5d3c6", strokeWidth: highlighted ? 2.5 : 1.4, opacity: selected && !highlighted ? .35 : 1 }, labelStyle: { fill: "#717b6c", fontSize: 10 }, labelBgStyle: { fill: "#f9fbf7" }, labelBgPadding: [3, 3] as [number, number] });
    for (const business of businesses) {
      edges.push(edge("user", business.businessId, selected === business.businessId, "interacted"));
      categories.forEach((category, index) => { if (business.sharedCategories.includes(category.category)) edges.push(edge(business.businessId, `category-${index}`, selected === business.businessId)); });
    }
    categories.forEach((category, index) => edges.push(edge(`category-${index}`, "target", shared.includes(category.category))));
    // React Flow otherwise disables pointer events when dragging/selection are off.
    return { nodes: nodes.map((node) => ({ ...node, style: { pointerEvents: "all" as const } })), edges };
  }, [history, compact, selected, explanation.business.name]);
  return <div className="evidence-panel"><div className="evidence-intro"><span className="evidence-kicker">A few relevant connections</span><h3>Relevant knowledge-graph connections</h3><p>A local view of your activity, shared characteristics and this business.</p></div>
    {!history || history.businesses.length === 0 ? <div className="evidence-card">No local history connections are available.</div> : <>
      <div className="kg-legend"><span><i className="kg-legend-user" />You</span><span><i className="kg-legend-history" />History</span><span><i className="kg-legend-category" />Category</span><span><i className="kg-legend-target" />This place</span></div>
      <div className={`knowledge-graph ${compact ? "kg-compact" : ""}`} ref={container} aria-label="Interactive local knowledge graph"><ReactFlow<EvidenceNode, Edge> nodes={nodes} edges={edges} nodeTypes={nodeTypes} onInit={setInstance} fitView fitViewOptions={{ padding: .12, maxZoom: 1 }} minZoom={.45} maxZoom={1.8} nodesDraggable={false} nodesConnectable={false} elementsSelectable={false} nodesFocusable={false} edgesFocusable={false} zoomOnScroll={false} panOnScroll={false} preventScrolling={false}><Background gap={22} size={1} color="#e1e8dd" /><Controls showInteractive={false} /></ReactFlow></div>
      <div className="kg-interaction-note"><Network size={14} aria-hidden="true" /><p>Select a past place to highlight its shared connections. Use + / − to zoom, or drag to pan.</p>{selected && <button onClick={() => setSelected(null)}>Reset</button>}</div>
      <div className="kg-history-select" role="group" aria-label="Highlight a historical business">{history.businesses.slice(0, 3).map((business) => <button key={business.businessId} onClick={() => setSelected((previous) => previous === business.businessId ? null : business.businessId)} aria-pressed={selected === business.businessId}>{business.name}</button>)}</div>
      <section className="evidence-section"><h3>Target categories represented in your history</h3><dl className="kg-category-counts">{history.categories.map((category) => <div key={category.category}><dt>{category.category}</dt><dd><strong>{category.historicalBusinessCount}</strong> businesses</dd></div>)}</dl></section>
    </>}
    <p className="evidence-note">This graph shows a representative local subset of relevant knowledge-graph connections. Category counts refer to the wider history. These connections are not a proven causal path or the neural model’s exact reasoning path.</p>
  </div>;
}
