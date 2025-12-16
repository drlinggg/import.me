import { useCallback } from 'react'
import * as d3 from 'd3'

export const useGraphZoom = () => {
  const createZoom = useCallback((svg, g, setTransform) => {
    return d3.zoom()
      .scaleExtent([0.1, 4])
      .on('zoom', (event) => {
        if (g) {
          g.attr('transform', event.transform)
        }
        if (setTransform) {
          setTransform({
            x: event.transform.x,
            y: event.transform.y,
            scale: event.transform.k
          })
        }
      })
  }, [])

  return { createZoom }
}
