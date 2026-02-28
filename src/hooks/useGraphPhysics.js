import { useCallback } from 'react'
import * as d3 from 'd3'

export const useGraphPhysics = () => {
  const createSimulation = useCallback((nodes, links, width, height) => {
    // Инициализируем позиции
    nodes.forEach(node => {
      if (!node.x || !node.y) {
        node.x = width / 2 + (Math.random() - 0.5) * 200
        node.y = height / 2 + (Math.random() - 0.5) * 200
      }
    })

    return d3.forceSimulation(nodes)
      .force('link', d3.forceLink(links).id(d => d.id).distance(120))
      .force('charge', d3.forceManyBody().strength(-400))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('collision', d3.forceCollide().radius(35))
      .alphaDecay(0.02)
      .velocityDecay(0.4)
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
