import { useCallback } from 'react'
import * as d3 from 'd3'

/**
 * Classifies a link as 'intra-sub', 'intra-top', or 'cross' by comparing the
 * packagePath / topPackage fields of source and target nodes.
 */
function linkClass(link, nodeById) {
  const s = nodeById.get(typeof link.source === 'object' ? link.source.id : link.source)
  const t = nodeById.get(typeof link.target === 'object' ? link.target.id : link.target)
  if (!s || !t) return 'cross'
  if (s.packagePath && t.packagePath && s.packagePath === t.packagePath) return 'intra-sub'
  if (s.topPackage  && t.topPackage  && s.topPackage  === t.topPackage)  return 'intra-top'
  return 'cross'
}

export const useGraphInitialization = () => {
  const initializeGraph = useCallback((g, graphData, colors, simulation, createDragHandler) => {
    // Fast lookup used for link classification at draw time.
    const nodeById = new Map(graphData.nodes.map(n => [n.id, n]))

    // ── Arrow markers — one per link class for distinct colours ─────────────
    const markerDefs = [
      { id: 'arrow-intra-sub', color: 'rgba(184,50,128,0.80)' },
      { id: 'arrow-intra-top', color: 'rgba(184,50,128,0.45)' },
      { id: 'arrow-cross',     color: 'rgba(140,100,220,0.30)' },
    ]

    const defs = g.append('defs')
    for (const m of markerDefs) {
      defs.append('marker')
        .attr('id', m.id)
        .attr('viewBox', '0 -4 8 8')
        .attr('refX', 22)
        .attr('refY', 0)
        .attr('markerWidth', 5)
        .attr('markerHeight', 5)
        .attr('orient', 'auto')
        .append('path')
        .attr('d', 'M0,-4L8,0L0,4')
        .attr('fill', m.color)
    }

    // ── Links ────────────────────────────────────────────────────────────────
    const link = g.append('g')
      .selectAll('line')
      .data(graphData.links)
      .enter().append('line')
      .attr('class', d => `link link-${linkClass(d, nodeById)}`)
      .attr('marker-end', d => `url(#arrow-${linkClass(d, nodeById)})`)

    // ── Nodes ────────────────────────────────────────────────────────────────
    const nodeColor = (d) => d.group === 2 ? colors.nodes.external : colors.nodes.internal

    const node = g.append('g')
      .selectAll('circle')
      .data(graphData.nodes)
      .enter().append('circle')
      .attr('class', d => `node ${d.group === 2 ? 'external' : 'internal'}`)
      .attr('r', d => d.radius || 14)
      .attr('fill', nodeColor)
      .attr('stroke', '#FFF')
      .attr('stroke-width', 1.5)
      .style('cursor', 'pointer')
      .call(createDragHandler(simulation))

    // ── Labels ───────────────────────────────────────────────────────────────
    // Full dotted path label (e.g. myapp.models.user).
    const text = g.append('g')
      .selectAll('text')
      .data(graphData.nodes)
      .enter().append('text')
      .attr('class', 'node-label')
      .text(d => d.label || d.id)
      .attr('font-size', '9px')
      .attr('font-weight', '500')
      .attr('fill', colors.text)
      .attr('text-anchor', 'middle')
      .attr('dy', d => -(d.radius || 14) - 4)
      .style('pointer-events', 'none')

    return { link, node, text }
  }, [])

  return { initializeGraph }
}
