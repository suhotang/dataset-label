import { useState, useEffect } from "react"

export default function usePointerMove(
  labelSelectBoxRef,
  imageBoxRef,
  onDraggableMode,
  labelBoxData,
  changeLabelBoxStyle,
  setLabelBoxList,
  setLabelBoxData
) {
  const [movePosition, setMovePosition] = useState([0, 0])

  useEffect(() => {
    if (labelSelectBoxRef.current == null) {
      return
    }

    const handler = ({ clientX, clientY }) => {
      if (!onDraggableMode) {
        return
      }

      if (imageBoxRef.current == null) {
        return
      }

      const movePositionX = clientX
      const movePositionY = clientY
      setMovePosition([movePositionX, movePositionY])

      const rect = imageBoxRef.current.getBoundingClientRect()
      const x = movePositionX - rect.left
      const y = movePositionY - rect.top

      // Set label box style
      const newLabelBoxStyleList = changeLabelBoxStyle(
        labelBoxData.index,
        labelBoxData.originY,
        labelBoxData.originX,
        y - labelBoxData.startClientY, // yDiff
        x - labelBoxData.startClientX // xDiff
      )
      setLabelBoxList([...newLabelBoxStyleList])

      // Set label box data
      setLabelBoxData({
        ...labelBoxData,
        labelBoxPositionX: x,
        labelBoxPositionY: y,
        xDiff: labelBoxData.startClientX - x,
        yDiff: labelBoxData.startClientY - y,
      })
    }
    document.addEventListener("pointermove", handler)
    return () => {
      document.removeEventListener("pointermove", handler)
    }
  }, [
    changeLabelBoxStyle,
    imageBoxRef,
    labelBoxData,
    labelSelectBoxRef,
    onDraggableMode,
    setLabelBoxData,
    setLabelBoxList,
  ])

  return movePosition
}
