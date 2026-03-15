import { useMemo, useCallback } from 'react'

export const useGraphColors = () => {
  const colors = useMemo(() => ({
    nodes: {
      internal: '#F687B3',
      external: '#9F7AEA',
    },
    links: {
      intraSub: 'rgba(184,50,128,0.75)',
      intraTop: 'rgba(184,50,128,0.40)',
      cross:    'rgba(140,100,220,0.25)',
    },
    arrows: '#B83280',
    text:   '#702459',
  }), [])

  const getNodeColor = useCallback((group) =>
    group === 2 ? colors.nodes.external : colors.nodes.internal
  , [colors])

  return { colors, getNodeColor }
}
