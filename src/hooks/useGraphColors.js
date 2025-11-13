import { useMemo, useCallback } from 'react'

export const useGraphColors = () => {
  const colors = useMemo(() => ({
    nodes: {
      internal: '#F687B3',
      external: '#B83280'
    },
    links: '#D53F8C',
    arrows: '#B83280',
    text: '#702459'
  }), [])

  const getNodeColor = useCallback((group) => 
    group === 1 ? colors.nodes.internal : colors.nodes.external
  , [colors])

  return { colors, getNodeColor }
}
