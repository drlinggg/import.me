export const exportToPNG = (svgElement, filename = 'dependency-graph.png') => {
  const svgData = new XMLSerializer().serializeToString(svgElement)
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')
  
  const img = new Image()
  img.onload = () => {
    canvas.width = img.width
    canvas.height = img.height
    ctx.drawImage(img, 0, 0)
    
    const pngFile = canvas.toDataURL('image/png')
    const downloadLink = document.createElement('a')
    downloadLink.download = filename
    downloadLink.href = pngFile
    downloadLink.click()
  }
  
  const blob = new Blob([svgData], { type: 'image/svg+xml' })
  img.src = URL.createObjectURL(blob)
}

export const redirectToGitHub = () => {
  window.open('https://github.com/drlinggg/import.me', '_blank')
}
