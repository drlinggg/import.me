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
  // Keep a ref to the current search query so the D3 rebuild effect can
  // re-apply highlights without listing searchQuery as a dependency
  // (which would cause the entire graph to be torn down on every keystroke).
  const searchQueryRef = useRef('')

  const [graphData, setGraphData] = useState({ nodes: [], links: [] })
  const [searchQuery, setSearchQuery] = useState('')
  const [highlightedNode, setHighlightedNode] = useState(null)
  const [nodeCount, setNodeCount] = useState(0)
  const [linkCount, setLinkCount] = useState(0)
  const [transform, setTransform] = useState({ x: 0, y: 0, scale: 1 })
  const [containerSize, setContainerSize] = useState({ width: 800, height: 600 })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const { getGraphData } = useGraphData()
  const { createSimulation, createDragHandler } = useGraphPhysics()
  const { colors, getNodeColor } = useGraphColors()
  const { initializeGraph } = useGraphInitialization()

  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        const { width, height } = containerRef.current.getBoundingClientRect()
        setContainerSize({ width, height })
      }
    }
    updateSize()
    window.addEventListener('resize', updateSize)
    return () => window.removeEventListener('resize', updateSize)
  }, [])

  const loadGraph = useCallback(
    async (repoUrl) => {
      setLoading(true)
      setError(null)
      // Clear search state when loading a new repo.
      setSearchQuery('')
      searchQueryRef.current = ''
      setHighlightedNode(null)
      try {
        const data = await getGraphData(repoUrl)
        setGraphData(data)
        setNodeCount(data.nodes.length)
        setLinkCount(data.links.length)
      } catch (err) {
        setError(err.message || 'Failed to load graph')
        setGraphData({ nodes: [], links: [] })
        setNodeCount(0)
        setLinkCount(0)
      } finally {
        setLoading(false)
      }
    },
    [getGraphData],
  )

  // Applies / clears the 'found' CSS class on circle nodes without rebuilding
  // the graph.  Works both from the search input and the exposed imperative handle.
  const applySearch = useCallback((query) => {
    if (!svgRef.current) return
    d3.select(svgRef.current)
      .selectAll('circle.node')
      .classed('found', (d) =>
        query
          ? (d.label      && d.label.toLowerCase().includes(query.toLowerCase())) ||
            (d.shortLabel && d.shortLabel.toLowerCase().includes(query.toLowerCase()))
          : false,
      )
  }, [])

  const searchNode = useCallback(
    (query) => {
      setSearchQuery(query)
      searchQueryRef.current = query
      applySearch(query)
    },
    [applySearch],
  )

  useImperativeHandle(ref, () => ({ loadGraph, searchNode }))

  useEffect(() => {
    if (!svgRef.current || !containerRef.current || graphData.nodes.length === 0) return

    const { width, height } = containerSize
    const svg = d3.select(svgRef.current).attr('width', width).attr('height', height)
    svg.selectAll('*').remove()

    const g = svg.append('g')

    simulationRef.current = createSimulation(graphData.nodes, graphData.links, width, height)

    const zoom = d3
      .zoom()
      .scaleExtent([0.1, 4])
      .on('zoom', (event) => {
        g.attr('transform', event.transform)
        setTransform({ x: event.transform.x, y: event.transform.y, scale: event.transform.k })
      })

    svg.call(zoom)

    const { link, node, text } = initializeGraph(
      g,
      graphData,
      colors,
      simulationRef.current,
      createDragHandler,
    )

    node
      .on('mouseenter', function (event, d) {
        setHighlightedNode(d.label || d.id)
        d3.select(this).classed('highlighted', true).attr('r', (d.radius || 14) * 1.3)
        link.classed('highlighted', (l) => l.source.id === d.id || l.target.id === d.id)
      })
      .on('mouseleave', function (event, d) {
        setHighlightedNode(null)
        d3.select(this).classed('highlighted', false).attr('r', d.radius || 14)
        link.classed('highlighted', false)
      })

    // Re-apply any active search highlight after a graph rebuild (e.g. resize).
    if (searchQueryRef.current) {
      applySearch(searchQueryRef.current)
    }

    simulationRef.current.on('tick', () => {
      link
        .attr('x1', (d) => d.source.x)
        .attr('y1', (d) => d.source.y)
        .attr('x2', (d) => d.target.x)
        .attr('y2', (d) => d.target.y)
      node.attr('cx', (d) => d.x).attr('cy', (d) => d.y)
      text.attr('x', (d) => d.x).attr('y', (d) => d.y)
    })

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
      if (simulationRef.current) simulationRef.current.stop()
    }
  }, [graphData, colors, createSimulation, createDragHandler, initializeGraph, containerSize, applySearch])

  const handleSavePNG = () => exportToPNG(svgRef.current)
  const handleStarMe = () => redirectToGitHub()

  const handleSearchChange = (e) => {
    searchNode(e.target.value)
  }

  return (
    <div className="visualization" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
      <div className="graph-controls-overlay">
        <div className="graph-controls-panel">
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
                onClick={() => searchNode('')}
                className="clear-search-btn"
              >
                ✕
              </button>
            )}
          </div>
        </div>
      </div>

      <div
        className="graph-container"
        ref={containerRef}
        style={{ flex: 1, position: 'relative', minHeight: '500px', overflow: 'hidden' }}
      >
        {loading && (
          <div className="graph-overlay">
            <div className="graph-spinner" />
            <span>Analyzing repository...</span>
          </div>
        )}

        {error && !loading && (
          <div className="graph-overlay graph-error">
            <span>⚠ {error}</span>
          </div>
        )}

        {!loading && !error && graphData.nodes.length === 0 && (
          <div className="graph-overlay graph-empty">
            <span>Enter a repository above and click <strong>import</strong></span>
          </div>
        )}

        <svg
          ref={svgRef}
          id="dependency-graph"
          style={{ width: '100%', height: '100%', display: 'block' }}
        />

        <div className="graph-legend">
          <div className="legend-item">
            <div className="legend-color node-internal" />
            <span>Module</span>
          </div>
          <div className="legend-item">
            <div className="legend-color node-external-legend" />
            <span>External</span>
          </div>
          <div className="legend-item">
            <div className="legend-color node-found" />
            <span>Search match</span>
          </div>
        </div>

        {highlightedNode !== null && (
          <div className="highlight-info-panel">
            <strong>{highlightedNode}</strong>
          </div>
        )}
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
