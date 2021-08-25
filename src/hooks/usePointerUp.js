import { useState, useEffect } from "react"

export default function usePointerUp(ref, onDraggableMode) {
  const [lastMovePosition, setLastMovePosition] = useState([0, 0])

  useEffect(() => {
    if (ref.current == null) {
      return
    }

    const handler = ({ clientX, clientY }) => {
      if (onDraggableMode) {
        const lastMovePositionX = clientX
        const lastMovePositionY = clientY
        setLastMovePosition([lastMovePositionX, lastMovePositionY])
      }
    }
    document.addEventListener("pointerup", handler)
    return () => {
      document.removeEventListener("pointerup", handler)
    }
  }, [onDraggableMode, ref])

  return lastMovePosition
}
