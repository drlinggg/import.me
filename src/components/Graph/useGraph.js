import { useEffect, useRef } from 'react'
import cytoscape from 'cytoscape'
import coseBilkent from 'cytoscape-cose-bilkent'

cytoscape.use(coseBilkent)

export const useGraph = () => {
  const graphRef = useRef(null)
  const cyRef = useRef(null)

  useEffect(() => {
    if (!graphRef.current) return

    cyRef.current = cytoscape({
      container: graphRef.current,
      elements: [],
      style: [
        {
          selector: 'node',
          style: {
            'background-color': '#4a90e2',
            'label': 'data(id)',
            'color': '#fff',
            'text-valign': 'center',
            'text-halign': 'center'
          }
        },
        {
          selector: 'edge',
          style: {
            'width': 2,
            'line-color': '#8e44ad',
            'target-arrow-color': '#8e44ad',
            'target-arrow-shape': 'triangle'
          }
        }
      ],
      layout: {
        name: 'cose-bilkent',
        idealEdgeLength: 100,
        nodeRepulsion: 4500
      }
    })

    return () => {
      if (cyRef.current) {
        cyRef.current.destroy()
      }
    }
  }, [])

  return { graphRef, cyRef }
}
