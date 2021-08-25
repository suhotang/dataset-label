import React, { useState, useRef, useCallback, useEffect } from "react"
import styled from "styled-components"
import usePointerMove from "../hooks/usePointerMove"
import usePointerUp from "../hooks/usePointerUp"
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
  originX: 0,
  originY: 0,
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
  const changeLabelBoxStyle = useCallback(
    (index, originY, originX, yDiff, xDiff) => {
      if (originY === 0 || originX === 0) {
        return labelBoxList
      }

      let newTop = originY + yDiff
      let newLeft = originX + xDiff

      return labelBoxList.map((item) => {
        if (item.index === index) {
          return {
            index,
            style: { ...item.style, top: newTop, left: newLeft },
          }
        }
        return item
      })
    },
    // eslint-disable-next-line no-use-before-define
    [labelBoxList]
  )

  const labelSelectBoxRef = useRef()
  const imageBoxRef = useRef()
  const [onDraggableMode, setOnDraggableMode] = useState(false)
  const [labelBoxData, setLabelBoxData] = useState({
    ...initialLabelBoxData,
  })
  const [selectedItemList, setSelectedItemList] = useState([])
  // not using pointer move position value
  // eslint-disable-next-line no-unused-vars
  const [_movePositionX, _movePositionY] = usePointerMove(
    labelSelectBoxRef,
    imageBoxRef,
    onDraggableMode,
    labelBoxData,
    changeLabelBoxStyle,
    setLabelBoxList,
    setLabelBoxData
  )
  const [lastMovePositionX, lastMovePositionY] = usePointerUp(
    labelSelectBoxRef,
    onDraggableMode
  )

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
      originX: labelBoxList[index].style.left,
      originY: labelBoxList[index].style.top,
      startClientX: x,
      startClientY: y,
      labelBoxPositionX: x,
      labelBoxPositionY: y,
      index,
    })
    setOnDraggableModeValue(true)
  }

  // Handle onPointerUp event
  useEffect(() => {
    if (onDraggableMode) {
      setLabelBoxData({ ...initialLabelBoxData })
      setOnDraggableModeValue(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lastMovePositionX, lastMovePositionY])

  return (
    <ContentContainer>
      <LabelSelectContainer ref={labelSelectBoxRef}>
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
