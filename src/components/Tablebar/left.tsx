import { forwardRef } from 'react'

const Left = forwardRef<HTMLDivElement>((_props, ref) => {
  return (
    <div ref={ref} className="tablebar__left">
      <div className="tablebar__logo">
        <span className="tablebar__logo-text">My Blog</span>
      </div>
    </div>
  )
})

Left.displayName = 'Left'

export default Left
