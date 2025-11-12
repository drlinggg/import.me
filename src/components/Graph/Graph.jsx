import { useEffect, useRef } from 'react'

const Graph = () => {
  const svgRef = useRef()

  useEffect(() => {
    if (svgRef.current) {
      svgRef.current.innerHTML = ''
    }
  }, [])

  return (
    <div className="visualization">
      <div className="graph-container">
        <svg ref={svgRef} id="dependency-graph"></svg>
      </div>
      <div className="controls-overlay">
        <button className="control-button">Save as PNG</button>
        <button className="control-button">Star me</button>
      </div>
    </div>
  )
}

export default Graph
