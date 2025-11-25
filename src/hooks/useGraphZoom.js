import { useCallback } from 'react'
import * as d3 from 'd3'

export const useGraphZoom = () => {
  const createZoom = useCallback(() => {
    return d3.zoom()
      .scaleExtent([0.5, 3])
      .on('zoom', (event) => {
      })
  }, [])

  return { createZoom }
}
