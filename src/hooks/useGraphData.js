import { useCallback } from 'react'

export const useGraphData = () => {
  const getGraphData = useCallback((repoUrl) => {
    console.log('Loading graph for:', repoUrl)
    
    return {
      nodes: [
        { id: 'main.py', group: 1 },
        { id: 'utils.py', group: 1 },
        { id: 'config.py', group: 1 },
        { id: 'requests', group: 2 },
        { id: 'os', group: 2 },
        { id: 'json', group: 2 }
      ],
      links: [
        { source: 'main.py', target: 'utils.py' },
        { source: 'main.py', target: 'requests' },
        { source: 'utils.py', target: 'config.py' },
        { source: 'utils.py', target: 'os' },
        { source: 'config.py', target: 'json' },
        { source: 'requests', target: 'json' }
      ]
    }
  }, [])

  return { getGraphData }
}
