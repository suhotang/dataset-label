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

const DragBar = styled.div`
  position: absolute;
  width: 16px;
  height: 16px;
  box-sizing: border-box;
  border: 3px solid ${primaryBoxColor};
  background: white;
`

const initialLabelBoxData = {
  startClientX: 0,
  startClientY: 0,
  labelBoxPositionX: 0,
  labelBoxPositionY: 0,
  xDiff: 0,
  yDiff: 0,
}

export default function UpdateLabelBoxContainer({
  labelBoxList = [],
  setLabelBoxList,
  imageUrl,
}) {
  const labelSelectBoxRef = useRef()
  const imageBoxRef = useRef()
  const [onDraggableMode, setOnDraggableMode] = useState(false)
  const [cropEventBound, setCropEventBound] = useState(false)
  const [labelBoxData, setLabelBoxData] = useState({
    ...initialLabelBoxData,
  })
  const [selectedItemList, setSelectedItemList] = useState([])

  const setOnDraggableModeValue = (value) => {
    setOnDraggableMode(value)
  }

  const onLabelBoxPointerDown = (index, event) => {
    if (!selectedItemList.includes(index)) {
      const newSelectedItemList = [...selectedItemList, index]
      setSelectedItemList(newSelectedItemList)
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
      index,
    })
    setOnDraggableModeValue(true)
  }

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const changeLabelBoxStyle = (index, curTop, curLeft) => {
    let newTop = labelBoxList[index].style.top + (curTop - labelBoxData.startClientY)
    let newLeft = labelBoxList[index].style.left + (curLeft - labelBoxData.startClientX)

    return labelBoxList.map((item) => {
      if (item.index === index) {
        return {
          index,
          style: { ...item.style, top: newTop, left: newLeft },
        }
      }
      return item
    })
  }

  const onLabelBoxPointerMove = useCallback(
    (event) => {
      if (!onDraggableMode) {
        return
      }

      if (imageBoxRef.current == null) {
        return
      }

      const rect = imageBoxRef.current.getBoundingClientRect()
      const x = event.clientX - rect.left
      const y = event.clientY - rect.top

      const newLabelBoxStyleList = changeLabelBoxStyle(labelBoxData?.index, y, x)
      setLabelBoxList([...newLabelBoxStyleList])

      setLabelBoxData({
        ...labelBoxData,
        labelBoxPositionX: x,
        labelBoxPositionY: y,
        xDiff: labelBoxData.startClientX - x,
        yDiff: labelBoxData.startClientY - y,
      })
    },
    [changeLabelBoxStyle, labelBoxData, onDraggableMode, setLabelBoxList]
  )

  const onLabelBoxPointerDone = useCallback(
    (_event) => {
      if (onDraggableMode) {
        if (imageBoxRef.current == null) {
          return
        }
        setLabelBoxData({ ...initialLabelBoxData })
        setOnDraggableModeValue(false)
      }
    },
    [onDraggableMode]
  )

  const addCropEvents = useCallback(() => {
    if (cropEventBound) {
      return
    }

    if (labelSelectBoxRef.current == null) {
      return
    }

    labelSelectBoxRef.current.addEventListener("pointermove", onLabelBoxPointerMove)
    labelSelectBoxRef.current.addEventListener("pointerup", onLabelBoxPointerDone)
    labelSelectBoxRef.current.addEventListener("pointercancel", onLabelBoxPointerDone)

    setCropEventBound(true)
  }, [cropEventBound, onLabelBoxPointerDone, onLabelBoxPointerMove])

  const removeCropEvents = useCallback(() => {
    if (!cropEventBound) {
      return
    }

    if (labelSelectBoxRef.current == null) {
      return
    }

    labelSelectBoxRef.current.removeEventListener("pointermove", onLabelBoxPointerMove)
    labelSelectBoxRef.current.removeEventListener("pointerup", onLabelBoxPointerDone)
    labelSelectBoxRef.current.removeEventListener("pointercancel", onLabelBoxPointerDone)

    setCropEventBound(false)
  }, [cropEventBound, onLabelBoxPointerDone, onLabelBoxPointerMove])

  useEffect(() => {
    if (onDraggableMode && !cropEventBound) {
      // Add pointer move, up, cancel event listeners
      addCropEvents()
    }
    if (!onDraggableMode && cropEventBound) {
      // Remove event listeners
      removeCropEvents()
    }
  }, [cropEventBound, addCropEvents, removeCropEvents, onDraggableMode])

  return (
    <ContentContainer>
      <LabelSelectContainer ref={labelSelectBoxRef} onPointerDown={(e) => {}}>
        <div
          ref={imageBoxRef}
          style={{ display: "inline-block", width: "fit-content", height: "fit-content" }}
        >
          <img draggable={false} src={imageUrl} alt="labeling-img" />
        </div>
        {labelBoxList.map((item) => {
          const { index, style } = item
          const isSelected = selectedItemList.includes(index)
          return (
            <LabelBox
              id={index}
              style={style}
              onPointerDown={(event) => onLabelBoxPointerDown(index, event)}
            >
              {isSelected && (
                <>
                  <DragBar
                    className="leftTop"
                    style={{ top: 0, left: 0, marginLeft: "-10px", marginTop: "-10px" }}
                  />
                  <DragBar
                    className="rightTop"
                    style={{ top: 0, right: 0, marginRight: "-10px", marginTop: "-10px" }}
                  />
                  <DragBar
                    className="leftBottom"
                    style={{
                      bottom: 0,
                      left: 0,
                      marginLeft: "-10px",
                      marginBottom: "-10px",
                    }}
                  />
                  <DragBar
                    className="rightBottom"
                    style={{
                      bottom: 0,
                      right: 0,
                      marginRight: "-10px",
                      marginBottom: "-10px",
                    }}
                  />
                  <DragBar
                    className="topCenter"
                    style={{ top: 0, left: 0, marginLeft: "-10px", marginTop: "-10px" }}
                  />
                  <DragBar
                    className="bottomCenter"
                    style={{ top: 0, left: 0, marginLeft: "-10px", marginTop: "-10px" }}
                  />
                  <DragBar
                    className="leftCenter"
                    style={{ top: 0, left: 0, marginLeft: "-10px", marginTop: "-10px" }}
                  />
                  <DragBar
                    className="rightCenter"
                    style={{ top: 0, left: 0, marginLeft: "-10px", marginTop: "-10px" }}
                  />
                </>
              )}
            </LabelBox>
          )
        })}
      </LabelSelectContainer>
    </ContentContainer>
  )
}
