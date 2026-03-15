import { useCallback } from 'react'
import * as d3 from 'd3'

/**
 * Distributes nodes into radial sectors based on their package hierarchy
 * before the force simulation starts.
 *
 * Internal nodes are grouped by topPackage into angular sectors proportional
 * to their count. Within each sector nodes are further grouped by packagePath
 * and spread radially by depth. External nodes form a ring at the outermost
 * radius.
 *
 * The computed positions are stored as treeX / treeY and used later as soft
 * x / y force attractors so the simulation preserves tree structure while
 * still resolving overlaps and link tensions.
 */
function computeTreePositions(nodes, width, height) {
  const cx     = width  / 2
  const cy     = height / 2
  const minDim = Math.min(width, height)

  const internal = nodes.filter(n => n.group !== 2)
  const external = nodes.filter(n => n.group === 2)

  // ── Internal nodes: radial sector layout ──────────────────────────────────
  // Expanded rings so there is natural breathing room before the simulation
  // even applies. outerR pushed to 0.52 so inter-node angles are wider.
  const innerR = minDim * 0.14
  const outerR = minDim * 0.52

  const byTopPkg = new Map()
  for (const n of internal) {
    const key = n.topPackage || '__root__'
    if (!byTopPkg.has(key)) byTopPkg.set(key, [])
    byTopPkg.get(key).push(n)
  }

  const pkgEntries    = [...byTopPkg.entries()].sort((a, b) => b[1].length - a[1].length)
  const totalInternal = Math.max(internal.length, 1)
  let   sectorStart   = -Math.PI / 2

  for (const [, pkgNodes] of pkgEntries) {
    const sectorAngle = (2 * Math.PI * pkgNodes.length) / totalInternal

    const byPkgPath = new Map()
    for (const n of pkgNodes) {
      const key = n.packagePath || ''
      if (!byPkgPath.has(key)) byPkgPath.set(key, [])
      byPkgPath.get(key).push(n)
    }

    const pathEntries = [...byPkgPath.entries()].sort()
    let   subStart    = sectorStart

    for (const [, pathNodes] of pathEntries) {
      const subAngle = (sectorAngle * pathNodes.length) / pkgNodes.length

      pathNodes.forEach((n, i) => {
        const step  = subAngle / (pathNodes.length + 1)
        const angle = subStart + step * (i + 1)

        const depthRatio = Math.min((n.depth - 1) / 5, 1)
        const r          = innerR + (outerR - innerR) * depthRatio

        n.treeX = cx + r * Math.cos(angle)
        n.treeY = cy + r * Math.sin(angle)
        n.x     = n.treeX + (Math.random() - 0.5) * 20
        n.y     = n.treeY + (Math.random() - 0.5) * 20
      })

      subStart += subAngle
    }

    sectorStart += sectorAngle
  }

  // ── External nodes: outer ring ────────────────────────────────────────────
  const extR = minDim * 0.60
  external.forEach((n, i) => {
    const angle = -Math.PI / 2 + (2 * Math.PI * i) / Math.max(external.length, 1)
    n.treeX = cx + extR * Math.cos(angle)
    n.treeY = cy + extR * Math.sin(angle)
    n.x     = n.treeX + (Math.random() - 0.5) * 10
    n.y     = n.treeY + (Math.random() - 0.5) * 10
  })
}

export const useGraphPhysics = () => {
  const createSimulation = useCallback((nodes, links, width, height) => {
    computeTreePositions(nodes, width, height)

    return d3.forceSimulation(nodes)
      .force('link',
        d3.forceLink(links)
          .id(d => d.id)
          // Distances scaled to node radii so separation stays proportional.
          // Minimum effective distance keeps nodes at least 3 radii apart.
          .distance(link => {
            const s    = link.source
            const t    = link.target
            if (typeof s !== 'object' || typeof t !== 'object') return 180
            const maxR = Math.max(s.radius || 14, t.radius || 14)
            // intra-sub-package
            if (s.packagePath && s.packagePath === t.packagePath) return maxR * 8
            // intra-top-package
            if (s.topPackage  && s.topPackage  === t.topPackage)  return maxR * 13
            // cross-package / external
            return maxR * 18
          })
          .strength(0.45),
      )
      // Strong enough repulsion to maintain the 3-radius minimum gap.
      .force('charge', d3.forceManyBody().strength(d => d.group === 2 ? -300 : -500))
      // Collision radius = 4 × node radius, guaranteeing surfaces stay at
      // least 3 radii apart (2r center-to-surface + 2r other side = 4r total).
      .force('collision', d3.forceCollide().radius(d => (d.radius || 14) * 4).strength(1))
      // Soft attractors toward tree positions keep cluster structure intact.
      .force('x', d3.forceX(d => d.treeX ?? width  / 2).strength(0.18))
      .force('y', d3.forceY(d => d.treeY ?? height / 2).strength(0.18))
      .alphaDecay(0.022)
      .velocityDecay(0.48)
  }, [])

  const createDragHandler = useCallback((simulation) => {
    return d3.drag()
      .on('start', (event, d) => {
        if (!event.active) simulation.alphaTarget(0.3).restart()
        d.fx = d.x
        d.fy = d.y
      })
      .on('drag', (event, d) => {
        d.fx = event.x
        d.fy = event.y
      })
      .on('end', (event, d) => {
        if (!event.active) simulation.alphaTarget(0)
        d.fx = null
        d.fy = null
      })
  }, [])

  return { createSimulation, createDragHandler }
}
