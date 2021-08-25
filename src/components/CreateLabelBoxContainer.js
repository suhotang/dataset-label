import React, { useState, useRef, useCallback, useEffect } from "react"
import styled from "styled-components"
import { primaryBoxColor } from "../style/colors"

const ContentContainer = styled.div`
  flex: 1;
  height: 100%;
  overflow: hidden;
`

const LabelSelectContainer = styled.div`
  position: relative;
  display: inline-block;
  overflow: hidden;
`

const LabelBox = styled.div`
  position: absolute;
  border: 3px solid ${primaryBoxColor};
  cursor: move;
  touch-action: none;
`

const initialLabelBoxData = {
  startClientX: 0,
  startClientY: 0,
  labelBoxPositionX: 0,
  labelBoxPositionY: 0,
  xDiff: 0,
  yDiff: 0,
}

const selectLabelMaxLen = 5

export default function CreateLabelBoxContainer({
  labelBoxList,
  setLabelBoxList,
  imageUrl,
}) {
  const labelSelectBoxRef = useRef()
  const imageBoxRef = useRef()
  const [onCreateMode, setOnCreateMode] = useState(false)
  const [cropEventBound, setCropEventBound] = useState(false)
  const [labelBoxData, setLabelBoxData] = useState({
    ...initialLabelBoxData,
  })

  const setOnCreateModeValue = (value) => {
    setOnCreateMode(value)
  }

  const onImageBoxPointerDown = (event) => {
    if (labelBoxList.length >= selectLabelMaxLen) {
      alert(`라벨링 박스는 최대 ${selectLabelMaxLen}개까지만 생성할 수 있습니다. `)
      return
    }

    if (imageBoxRef.current == null) {
      return
    }

    // Focus for detecting keypress.
    labelSelectBoxRef.current.focus({ preventScroll: true })

    const rect = imageBoxRef.current.getBoundingClientRect()
    const x = event.clientX - rect.left
    const y = event.clientY - rect.top

    setLabelBoxData({
      ...initialLabelBoxData,
      startClientX: x,
      startClientY: y,
      labelBoxPositionX: x,
      labelBoxPositionY: y,
    })
    setOnCreateModeValue(true)
  }

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const onImageBoxPointerMove = useCallback(
    (event) => {
      if (!onCreateMode) {
        return
      }

      if (imageBoxRef.current == null) {
        return
      }

      const rect = imageBoxRef.current.getBoundingClientRect()
      const x = event.clientX - rect.left
      const y = event.clientY - rect.top

      setLabelBoxData({
        ...labelBoxData,
        labelBoxPositionX: x,
        labelBoxPositionY: y,
        xDiff: labelBoxData.startClientX - x,
        yDiff: labelBoxData.startClientY - y,
      })
    },
    [labelBoxData, onCreateMode]
  )

  const onImageBoxPointerDone = useCallback(
    (event) => {
      if (labelBoxList.length >= selectLabelMaxLen) {
        return
      }

      if (onCreateMode) {
        if (imageBoxRef.current == null) {
          return
        }

        const rect = imageBoxRef.current.getBoundingClientRect()
        const lastX = event.clientX - rect.left
        const lastY = event.clientY - rect.top

        const labelBoxStyle = getLabelBoxStyle()
        // eslint-disable-next-line react-hooks/exhaustive-deps
        setOnCreateModeValue(false)
        setLabelBoxList([
          ...labelBoxList,
          {
            index: labelBoxList.length,
            style: {
              top: labelBoxStyle.top,
              left: labelBoxStyle.left,
              width: Math.abs(lastX - labelBoxStyle.left),
              height: Math.abs(lastY - labelBoxStyle.top),
            },
          },
        ])
        setLabelBoxData({ ...initialLabelBoxData })
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [onCreateMode, setLabelBoxData]
  )

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const addCropEvents = useCallback(() => {
    if (cropEventBound) {
      return
    }

    if (labelSelectBoxRef.current == null) {
      return
    }

    labelSelectBoxRef.current.addEventListener("pointermove", onImageBoxPointerMove)
    labelSelectBoxRef.current.addEventListener("pointerup", onImageBoxPointerDone)
    labelSelectBoxRef.current.addEventListener("pointercancel", onImageBoxPointerDone)

    setCropEventBound(true)
  }, [cropEventBound, onImageBoxPointerDone, onImageBoxPointerMove])

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const removeCropEvents = useCallback(() => {
    if (!cropEventBound) {
      return
    }

    if (labelSelectBoxRef.current == null) {
      return
    }

    labelSelectBoxRef.current.removeEventListener("pointermove", onImageBoxPointerMove)
    labelSelectBoxRef.current.removeEventListener("pointerup", onImageBoxPointerDone)
    labelSelectBoxRef.current.removeEventListener("pointercancel", onImageBoxPointerDone)

    setCropEventBound(false)
  }, [cropEventBound, onImageBoxPointerDone, onImageBoxPointerMove])

  const getLabelBoxStyle = () => {
    let top = labelBoxData.startClientY
    let left = labelBoxData.startClientX
    const width = Math.abs(labelBoxData.xDiff)
    const height = Math.abs(labelBoxData.yDiff)

    if (labelBoxData.xDiff > 0) {
      left -= width
    }

    if (labelBoxData.yDiff > 0) {
      top -= height
    }

    return {
      top,
      left,
      width,
      height,
    }
  }

  useEffect(() => {
    if (onCreateMode && !cropEventBound) {
      // Add pointer move, up, cancel event listeners
      addCropEvents()
    }
    if (!onCreateMode && cropEventBound) {
      // Remove event listeners
      removeCropEvents()
    }
  }, [labelBoxData, onCreateMode, cropEventBound, addCropEvents, removeCropEvents])

  return (
    <ContentContainer>
      <LabelSelectContainer
        ref={labelSelectBoxRef}
        onPointerDown={(e) => onImageBoxPointerDown(e)}
      >
        <div
          ref={imageBoxRef}
          style={{
            display: "inline-block",
            width: "fit-content",
            height: "fit-content",
          }}
        >
          <img draggable={false} src={imageUrl} alt="labeling-img" />
        </div>
        {onCreateMode && <LabelBox style={getLabelBoxStyle()} />}
      </LabelSelectContainer>
    </ContentContainer>
  )
}
