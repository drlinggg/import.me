import { useEffect, useRef, useState, useCallback, forwardRef, useImperativeHandle } from 'react'
import * as d3 from 'd3'
import { useGraphData } from '../../hooks/useGraphData'
import { useGraphPhysics } from '../../hooks/useGraphPhysics'
import { useGraphColors } from '../../hooks/useGraphColors'
import { useGraphZoom } from '../../hooks/useGraphZoom'
import { useGraphLayout } from '../../hooks/useGraphLayout'
import { useGraphInitialization } from '../../hooks/useGraphInitialization'
import { exportToPNG, redirectToGitHub } from '../../utils/exportUtils'
import './Graph.css'


const Graph = forwardRef((props, ref) => {
  const svgRef = useRef()
  const containerRef = useRef()
  const simulationRef = useRef()
  
  const [graphData, setGraphData] = useState({ nodes: [], links: [] })

  const { getGraphData } = useGraphData()
  const { createSimulation, createDragHandler } = useGraphPhysics()
  const { colors, getNodeColor } = useGraphColors()
  const { createZoom } = useGraphZoom()
  const { initializeGraph } = useGraphInitialization()

  // Функция для загрузки графа
  const loadGraph = useCallback((repoUrl) => {
    const data = getGraphData(repoUrl)
    setGraphData(data)
  }, [getGraphData])

  // Экспортируем функции через ref
  useImperativeHandle(ref, () => ({
    loadGraph
  }))

  useEffect(() => {
    // Загружаем тестовые данные при монтировании
    loadGraph('drlinggg/import.me')
  }, [loadGraph])

  useEffect(() => {
    if (!svgRef.current || !containerRef.current || graphData.nodes.length === 0) return

    const width = containerRef.current.clientWidth
    const height = containerRef.current.clientHeight

    const svg = d3.select(svgRef.current)
      .attr('width', width)
      .attr('height', height)

    // Создаем симуляцию
    simulationRef.current = createSimulation(graphData.nodes, graphData.links, width, height)

    // Инициализируем граф
    const { link, node, text } = initializeGraph(
      svg, graphData, colors, simulationRef.current, createDragHandler, createZoom
    )

    // Анимация
    simulationRef.current.on('tick', () => {
      link
        .attr('x1', d => d.source.x)
        .attr('y1', d => d.source.y)
        .attr('x2', d => d.target.x)
        .attr('y2', d => d.target.y)

      node
        .attr('cx', d => d.x)
        .attr('cy', d => d.y)

      text
        .attr('x', d => d.x)
        .attr('y', d => d.y)
    })

    // Ресайз
    const handleResize = () => {
      const newWidth = containerRef.current.clientWidth
      const newHeight = containerRef.current.clientHeight
      svg.attr('width', newWidth).attr('height', newHeight)
      simulationRef.current.force('center', d3.forceCenter(newWidth / 2, newHeight / 2))
      simulationRef.current.alpha(0.3).restart()
    }

    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
      if (simulationRef.current) {
        simulationRef.current.stop()
      }
    }
  }, [graphData, colors, createSimulation, createDragHandler, createZoom, initializeGraph])

  const handleSavePNG = () => {
    exportToPNG(svgRef.current)
  }

  const handleStarMe = () => {
    redirectToGitHub()
  }

  return (
    <div className="visualization">
      <div className="graph-container" ref={containerRef}>
        <svg ref={svgRef} id="dependency-graph"></svg>
      </div>
      <div className="controls-overlay">
        <button className="control-button" onClick={handleSavePNG}>
          Save as PNG
        </button>
        <button className="control-button" onClick={handleStarMe}>
          Star me
        </button>
      </div>
    </div>
  )
})

export default Graph
