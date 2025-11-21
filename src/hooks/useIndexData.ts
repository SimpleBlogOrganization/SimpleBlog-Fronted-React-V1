import { useApp } from '@/contexts/AppContext'
import { useRef } from 'react'

const useIndexData = () => {
  const { mode } = useApp()
  const lightImage = 'youke1/s1/2025/11/20/691e0b674bbf5.png'
  const darkImage = '/youke1/s1/2025/11/18/691be91e006ab.png'
  const initialModeRef = useRef(mode)

  // 只在首次渲染时根据当前主题返回图片顺序，之后保持不变
  const initialMode = initialModeRef.current
  return initialMode === 'light'
    ? { topImage: lightImage, bottomImage: darkImage }
    : { topImage: darkImage, bottomImage: lightImage }
}

export default useIndexData
