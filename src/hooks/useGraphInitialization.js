import { useCallback } from 'react'
import * as d3 from 'd3'

export const useGraphInitialization = () => {
  const initializeGraph = useCallback((svg, graphData, colors, simulation, createDragHandler, createZoom) => {
    // Очищаем предыдущий граф
    svg.selectAll("*").remove()

    // Стрелки для направленного графа
    svg.append('defs').selectAll('marker')
      .data(['arrow'])
      .enter().append('marker')
      .attr('id', d => d)
      .attr('viewBox', '0 -5 10 10')
      .attr('refX', 25)
      .attr('refY', 0)
      .attr('markerWidth', 6)
      .attr('markerHeight', 6)
      .attr('orient', 'auto')
      .append('path')
      .attr('d', 'M0,-5L10,0L0,5')
      .attr('fill', colors.arrows)

    // Рисуем связи
    const link = svg.append('g')
      .selectAll('line')
      .data(graphData.links)
      .enter().append('line')
      .attr('stroke', colors.links)
      .attr('stroke-width', 2)
      .attr('marker-end', 'url(#arrow)')

    // Рисуем узлы
    const node = svg.append('g')
      .selectAll('circle')
      .data(graphData.nodes)
      .enter().append('circle')
      .attr('r', 18)
      .attr('fill', d => colors.nodes[d.group === 1 ? 'internal' : 'external'])
      .attr('stroke', '#FFF')
      .attr('stroke-width', 2)
      .style('cursor', 'pointer')
      .call(createDragHandler(simulation))

    // Подписи узлов
    const text = svg.append('g')
      .selectAll('text')
      .data(graphData.nodes)
      .enter().append('text')
      .text(d => d.id)
      .attr('font-size', '11px')
      .attr('fill', colors.text)
      .attr('text-anchor', 'middle')
      .attr('dy', -22)
      .attr('font-weight', '600')
      .style('pointer-events', 'none')

    // Настройка зума
    const zoom = createZoom()
    zoom.on('zoom', (event) => {
      svg.selectAll('g').attr('transform', event.transform)
    })
    svg.call(zoom)

    return { link, node, text }
  }, [])

  return { initializeGraph }
}
