import { useCallback } from 'react'
import { apiFetch } from '../utils/api'

/**
 * Collapses package (__init__) nodes out of the graph while preserving the
 * connections they represent.
 *
 * If module A imports from a package's __init__ (A → pkg) and that __init__
 * itself imports from module B (pkg → B), we emit a direct A → B edge.
 * Edges that only touch the __init__ (no outgoing side) are dropped — they
 * represented "this module uses the package namespace" which has no renderable
 * target without the package node.
 */
function collapsePackageNodes(rawNodes, rawEdges) {
  const packageIds = new Set(
    rawNodes.filter(n => n.type === 'package').map(n => n.id),
  )

  if (packageIds.size === 0) {
    return { nodes: rawNodes, edges: rawEdges }
  }

  // For each package node track who imports INTO it and who it imports FROM.
  const pkgSources  = new Map()   // pkgId → Set<sourceId>
  const pkgTargets  = new Map()   // pkgId → Set<targetId>

  for (const e of rawEdges) {
    if (packageIds.has(e.target)) {
      if (!pkgSources.has(e.target)) pkgSources.set(e.target, new Set())
      pkgSources.get(e.target).add(e.source)
    }
    if (packageIds.has(e.source)) {
      if (!pkgTargets.has(e.source)) pkgTargets.set(e.source, new Set())
      pkgTargets.get(e.source).add(e.target)
    }
  }

  const edgeSet = new Set()
  const edges   = []

  const addEdge = (src, tgt) => {
    if (src === tgt) return
    if (packageIds.has(src) || packageIds.has(tgt)) return
    const key = `${src}->${tgt}`
    if (edgeSet.has(key)) return
    edgeSet.add(key)
    edges.push({ source: src, target: tgt })
  }

  for (const e of rawEdges) {
    if (!packageIds.has(e.source) && !packageIds.has(e.target)) {
      addEdge(e.source, e.target)
      continue
    }

    // A → pkg: bridge through to whatever pkg re-exports
    if (packageIds.has(e.target)) {
      const targets = pkgTargets.get(e.target)
      if (targets) {
        for (const tgt of targets) addEdge(e.source, tgt)
      }
    }
  }

  const nodes = rawNodes.filter(n => !packageIds.has(n.id))
  return { nodes, edges }
}

export const useGraphData = () => {
  const getGraphData = useCallback(async (repoUrl) => {
    const encoded = encodeURIComponent(repoUrl)
    const data    = await apiFetch(`/api/repos/graph?url=${encoded}`)
    const graph   = data?.graph

    if (!graph?.nodes) return { nodes: [], links: [] }

    const { nodes: collapsedNodes, edges: collapsedEdges } =
      collapsePackageNodes(graph.nodes, graph.edges)

    const nodes = collapsedNodes.map(n => {
      const isExternal = n.type === 'external'
      const parts      = (n.name || '').split('.')

      return {
        id:          n.id,
        label:       n.name,           // full dotted path — used for display and search
        group:       isExternal ? 2 : 1,
        radius:      isExternal ? 10 : 14,
        depth:       isExternal ? 1 : parts.length,
        packagePath: isExternal ? '' : parts.slice(0, -1).join('.'),
        topPackage:  parts[0] || '',
      }
    })

    const links = collapsedEdges.map(e => ({
      source: e.source,
      target: e.target,
    }))

    return { nodes, links }
  }, [])

  return { getGraphData }
}
