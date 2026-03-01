import { create } from 'zustand'
import { addEdge, applyEdgeChanges, applyNodeChanges } from '@xyflow/react'
import { INITIAL_TOPOLOGY, ROOM_ID } from '../data/servicePresets'
import { generateComposeFromGraph } from '../lib/exporters'

const palette = ['#4fe3ff', '#ff4fd8', '#ffb347', '#7c5dff', '#3ad29f']
const randomId = () =>
  typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).slice(2)

const baseExport = generateComposeFromGraph(INITIAL_TOPOLOGY.nodes, INITIAL_TOPOLOGY.edges)

const markEdgesForPath = (edges = [], path = [], flowId) => {
  if (!path?.length) return edges
  const highlighted = new Set()
  for (let i = 0; i < path.length - 1; i += 1) {
    highlighted.add(`${path[i]}::${path[i + 1]}`)
  }

  return edges.map((edge) => {
    const key = `${edge.source}::${edge.target}`
    if (highlighted.has(key)) {
      return {
        ...edge,
        animated: true,
        data: { ...edge.data, activeFlow: flowId },
      }
    }
    return {
      ...edge,
      data: { ...edge.data, activeFlow: null },
    }
  })
}

const resetEdgeHighlights = (edges = []) =>
  edges.map((edge) => ({
    ...edge,
    data: { ...edge.data, activeFlow: null },
  }))

export const useAetherStore = create((set, get) => ({
  user: {
    id: randomId(),
    name: `Architect-${Math.floor(Math.random() * 4096).toString(16)}`,
    color: palette[Math.floor(Math.random() * palette.length)],
  },
  roomId: ROOM_ID,
  nodes: INITIAL_TOPOLOGY.nodes,
  edges: INITIAL_TOPOLOGY.edges,
  overlays: { grid: true, minimap: false },
  presence: {},
  cursors: {},
  simulation: { active: false, flowId: null, path: [], trigger: null, latency: null },
  exportPreview: baseExport,
  exportMode: 'compose',
  setExportMode: (mode) => set({ exportMode: mode }),
  setNodes: (updater) =>
    set((state) => {
      const next = typeof updater === 'function' ? updater(state.nodes) : updater
      return {
        nodes: next,
        exportPreview: generateComposeFromGraph(next, state.edges),
      }
    }),
  setEdges: (updater) =>
    set((state) => {
      const next = typeof updater === 'function' ? updater(state.edges) : updater
      return {
        edges: next,
        exportPreview: generateComposeFromGraph(state.nodes, next),
      }
    }),
  onNodesChange: (changes) =>
    set((state) => {
      const nodes = applyNodeChanges(changes, state.nodes)
      return {
        nodes,
        exportPreview: generateComposeFromGraph(nodes, state.edges),
      }
    }),
  onEdgesChange: (changes) =>
    set((state) => {
      const edges = applyEdgeChanges(changes, state.edges)
      return {
        edges,
        exportPreview: generateComposeFromGraph(state.nodes, edges),
      }
    }),
  onConnect: (connection) =>
    set((state) => {
      const enriched = {
        ...connection,
        id: connection.id || `edge-${randomId()}`,
        type: 'pulseEdge',
        animated: true,
        data: connection.data || { label: 'link', throughput: 'pending' },
      }
      const edges = addEdge(enriched, state.edges)
      return {
        edges,
        exportPreview: generateComposeFromGraph(state.nodes, edges),
      }
    }),
  toggleOverlay: (key) =>
    set((state) => ({
      overlays: { ...state.overlays, [key]: !state.overlays[key] },
    })),
  hydrateDiagram: (snapshot = {}) =>
    set((state) => {
      const nextNodes = snapshot.nodes?.length ? snapshot.nodes : state.nodes
      const nextEdges = snapshot.edges?.length ? snapshot.edges : state.edges
      return {
        nodes: nextNodes,
        edges: nextEdges,
        exportPreview: generateComposeFromGraph(nextNodes, nextEdges),
      }
    }),
  setPresence: (presence) => set({ presence }),
  updateCursor: (cursor) =>
    set((state) => ({
      cursors: { ...state.cursors, [cursor.id]: cursor },
    })),
  removeCursor: (id) =>
    set((state) => {
      const next = { ...state.cursors }
      delete next[id]
      return { cursors: next }
    }),
  runSimulation: (payload = {}) =>
    set((state) => {
      const flowId = payload.flowId || payload.id || randomId()
      const edges = markEdgesForPath(state.edges, payload.path, flowId)
      return {
        edges,
        simulation: { active: true, ...payload, flowId },
      }
    }),
  stopSimulation: () =>
    set((state) => ({
      edges: resetEdgeHighlights(state.edges),
      simulation: { active: false, flowId: null, path: [], trigger: null, latency: null },
    })),
}))

export const selectDiagram = (state) => ({ nodes: state.nodes, edges: state.edges })
