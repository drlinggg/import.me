import { useEffect, useRef, useState, useCallback, forwardRef, useImperativeHandle } from 'react'
import * as d3 from 'd3'
import { useGraphData } from '../../hooks/useGraphData'
import { useGraphPhysics } from '../../hooks/useGraphPhysics'
import { useGraphColors } from '../../hooks/useGraphColors'
import { useGraphInitialization } from '../../hooks/useGraphInitialization'
import { exportToPNG, redirectToGitHub } from '../../utils/exportUtils'
import './Graph.css'

const Graph = forwardRef((props, ref) => {
  const svgRef = useRef()
  const containerRef = useRef()
  const simulationRef = useRef()
  
  const [graphData, setGraphData] = useState({ nodes: [], links: [] })
  const [searchQuery, setSearchQuery] = useState('')
  const [highlightedNode, setHighlightedNode] = useState(null)
  const [nodeCount, setNodeCount] = useState(0)
  const [linkCount, setLinkCount] = useState(0)
  const [transform, setTransform] = useState({ x: 0, y: 0, scale: 1 })
  const [containerSize, setContainerSize] = useState({ width: 800, height: 600 })

  const { getGraphData } = useGraphData()
  const { createSimulation, createDragHandler } = useGraphPhysics()
  const { colors, getNodeColor } = useGraphColors()
  const { initializeGraph } = useGraphInitialization()

  // Обновляем размер контейнера
  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        const { width, height } = containerRef.current.getBoundingClientRect()
        setContainerSize({ width, height })
      }
    }

    updateSize()
    window.addEventListener('resize', updateSize)
    
    return () => {
      window.removeEventListener('resize', updateSize)
    }
  }, [])

  // Функция для загрузки графа
  const loadGraph = useCallback((repoUrl) => {
    const data = getGraphData(repoUrl)
    setGraphData(data)
    setNodeCount(data.nodes.length)
    setLinkCount(data.links.length)
    setSearchQuery('')
    setHighlightedNode(null)
  }, [getGraphData])

  // Функция поиска узлов
  const searchNode = useCallback((query) => {
    setSearchQuery(query)
    if (query && graphData.nodes.length > 0) {
      const svg = d3.select(svgRef.current)
      svg.selectAll('.node')
        .classed('found', d => 
          d.id.toLowerCase().includes(query.toLowerCase()) || 
          (d.label && d.label.toLowerCase().includes(query.toLowerCase()))
        )
    } else {
      const svg = d3.select(svgRef.current)
      svg.selectAll('.node').classed('found', false)
    }
  }, [graphData.nodes])

  // Экспортируем функции через ref
  useImperativeHandle(ref, () => ({
    loadGraph,
    searchNode
  }))

  useEffect(() => {
    // Загружаем тестовые данные при монтировании
    loadGraph('drlinggg/import.me')
  }, [loadGraph])

  useEffect(() => {
    if (!svgRef.current || !containerRef.current || graphData.nodes.length === 0) return

    const { width, height } = containerSize

    const svg = d3.select(svgRef.current)
      .attr('width', width)
      .attr('height', height)

    // Очищаем предыдущий граф
    svg.selectAll('*').remove()

    // Создаем группу для зума
    const g = svg.append('g')

    // Создаем симуляцию
    simulationRef.current = createSimulation(graphData.nodes, graphData.links, width, height)

    // Создаем зум функцию
    const zoom = d3.zoom()
      .scaleExtent([0.1, 4])
      .on('zoom', (event) => {
        g.attr('transform', event.transform)
        setTransform({
          x: event.transform.x,
          y: event.transform.y,
          scale: event.transform.k
        })
      })

    // Применяем зум к SVG
    svg.call(zoom)

    // Инициализируем граф
    const { link, node, text } = initializeGraph(
      g, graphData, colors, simulationRef.current, createDragHandler
    )

    // Добавляем обработчики наведения для подсветки
    node
      .on('mouseenter', function(event, d) {
        setHighlightedNode(d.id)
        
        // Подсвечиваем узел
        d3.select(this)
          .classed('highlighted', true)
          .attr('r', (d.radius || 18) * 1.3)
        
        // Подсвечиваем связанные связи
        link
          .classed('highlighted', l => l.source.id === d.id || l.target.id === d.id)
          .attr('stroke-width', l => (l.source.id === d.id || l.target.id === d.id) ? 3 : 1)
      })
      .on('mouseleave', function(event, d) {
        setHighlightedNode(null)
        
        // Убираем подсветку узла
        d3.select(this)
          .classed('highlighted', false)
          .attr('r', d.radius || 18)
        
        // Убираем подсветку связей
        link
          .classed('highlighted', false)
          .attr('stroke-width', 1)
      })

    // Добавляем поисковую подсветку
    if (searchQuery) {
      node.classed('found', d => 
        d.id.toLowerCase().includes(searchQuery.toLowerCase()) || 
        (d.label && d.label.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    }

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
      if (!containerRef.current) return
      
      const newWidth = containerRef.current.clientWidth
      const newHeight = containerRef.current.clientHeight
      
      svg.attr('width', newWidth).attr('height', newHeight)
      simulationRef.current.force('center', d3.forceCenter(newWidth / 2, newHeight / 2))
      simulationRef.current.alpha(0.3).restart()
      
      setContainerSize({ width: newWidth, height: newHeight })
    }

    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
      if (simulationRef.current) {
        simulationRef.current.stop()
      }
    }
  }, [graphData, colors, createSimulation, createDragHandler, initializeGraph, searchQuery, containerSize])

  const handleSavePNG = () => {
    exportToPNG(svgRef.current)
  }

  const handleStarMe = () => {
    redirectToGitHub()
  }

  // Обработчик изменения поиска
  const handleSearchChange = (e) => {
    const query = e.target.value
    setSearchQuery(query)
    searchNode(query)
  }

  return (
    <div className="visualization" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
      {/* Панель управления - компактная и по центру */}
      <div className="graph-controls-overlay">
        <div className="graph-controls-panel">
          {/* Счетчики */}
          <div className="graph-stats">
            <div className="stat-item">
              <span className="stat-label">Nodes: </span>
              <span className="stat-value node-count">{nodeCount}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Links: </span>
              <span className="stat-value link-count">{linkCount}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Scale: </span>
              <span className="stat-value scale">{transform.scale.toFixed(1)}x</span>
            </div>
          </div>
  
          {/* Поиск */}
          <div className="graph-search">
            <input
              type="text"
              placeholder="Search nodes..."
              value={searchQuery}
              onChange={handleSearchChange}
              className="search-input"
            />
            {searchQuery && (
              <button 
                onClick={() => {
                  setSearchQuery('')
                  searchNode('')
                }}
                className="clear-search-btn"
              >
                ✕
              </button>
            )}
          </div>
        </div>
      </div>
  
      {/* Контейнер графа */}
      <div 
        className="graph-container" 
        ref={containerRef}
        style={{ 
          flex: 1, 
          position: 'relative',
          minHeight: '500px',
          overflow: 'hidden'
        }}
      >
        <svg 
          ref={svgRef} 
          id="dependency-graph"
          style={{
            width: '100%',
            height: '100%',
            display: 'block'
          }}
        ></svg>
        
        {/* Легенда - теперь в правом верхнем углу */}
        <div className="graph-legend">
          <div className="legend-item">
            <div className="legend-color node-normal"></div>
            <span>Normal node</span>
          </div>
          <div className="legend-item">
            <div className="legend-color node-highlighted"></div>
            <span>Highlighted</span>
          </div>
          <div className="legend-item">
            <div className="legend-color node-found"></div>
            <span>Found in search</span>
          </div>
        </div>
        
        {/* Информационная панель при подсветке */}
        {highlightedNode !== null && (
          <div className="highlight-info-panel">
            Highlighted node: <strong>{highlightedNode}</strong>
          </div>
        )}
      </div>
      
      {/* Кнопки экспорта */}
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
