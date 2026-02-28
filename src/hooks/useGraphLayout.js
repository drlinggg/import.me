import * as d3 from 'd3'

export const useGraphLayout = () => {
  const createInitialLayout = (nodes, width, height) => {
    // Создаем круговую расстановку для начального отображения
    const radius = Math.min(width, height) * 0.4
    const angle = (2 * Math.PI) / nodes.length
    
    nodes.forEach((node, i) => {
      node.fx = width / 2 + radius * Math.cos(i * angle)
      node.fy = height / 2 + radius * Math.sin(i * angle)
    })

    // Через секунду убираем фиксацию для физической симуляции
    setTimeout(() => {
      nodes.forEach(node => {
        node.fx = null
        node.fy = null
      })
    }, 1000)
  }

  return { createInitialLayout }
}
