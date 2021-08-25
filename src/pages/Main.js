import React, { useCallback, useEffect, useState } from "react"
import styled from "styled-components"
import {
  borderColor,
  interactionColor,
  lightGrayColor,
  darkGrayColor,
} from "../style/colors"
import { ReactComponent as BoxIcon } from "../icons/BoundingBoxCreate.svg"
import { ReactComponent as SelectIcon } from "../icons/ToolbarSelect.svg"
import CreateLabelBoxContainer from "../components/CreateLabelBoxContainer"
import UpdateLabelBoxContainer from "../components/UpdateLabelBoxContainer"

const PageContainer = styled.section`
  display: flex;
  flex-direction: column;
  width: 100vw;
  height: 100vh;
  background: white;
  padding: 0;
  margin: 0;
`

const TopLabelBox = styled.header`
  display: flex;
  flex: 0 0 64px;
  width: 100%;
  height: 64px;
  box-sizing: border-box;
  border: 1px solid ${borderColor};
  padding: 21px 0 16px 56px;
  background: ${lightGrayColor};
`

const RowContainer = styled.div`
  display: flex;
  flex: 1;
  width: 100%;
`

const SideMenuBox = styled.nav`
  display: flex;
  flex-direction: column;
  width: 56px;
  height: 100%;
  flex: 0 0 56px;
  align-items: center;
  box-sizing: border-box;
  border: 1px solid ${borderColor};
  border-top: none;
  background: ${lightGrayColor};
`

const MenuButton = styled.button`
  display: flex;
  width: 40px;
  height: 40px;
  justify-content: center;
  align-items: center;
  box-sizing: border-box;
  background: ${(props) => (props.isSelected ? interactionColor : "transparent")};
  border: none;
  border-radius: 8px;
  margin: 8px;
  &:hover {
    background: ${interactionColor};
  }
  svg {
    path {
      fill: ${(props) => (props.isSelected ? darkGrayColor : "none")};
    }
  }
`

const menus = {
  createLabel: 1,
  updateLabel: 2,
}

export default function MainPage() {
  useEffect(() => {
    fetch("https://jsonplaceholder.typicode.com/photos")
      .then((response) => response.json())
      .then((json) => {
        const defaultImageUrl = json[10]?.url
        setImageUrl(defaultImageUrl)
      })
      .catch((error) => {
        console.log(error)
      })
  }, [])

  const [labelBoxList, setLabelBoxList] = useState([])
  const [curMenuIndex, setMenuIndex] = useState(1)
  const [imageUrl, setImageUrl] = useState(null)
  const onMenuChangede = useCallback((index) => {
    setMenuIndex(index)
  }, [])

  const setLabelBoxData = (value) => {
    setLabelBoxList(value)
  }

  return (
    <PageContainer>
      <TopLabelBox>Dataset Label</TopLabelBox>
      <RowContainer>
        <SideMenuBox>
          <MenuButton
            isSelected={curMenuIndex === menus.createLabel}
            onClick={() => onMenuChangede(menus.createLabel)}
          >
            <SelectIcon />
          </MenuButton>
          <MenuButton
            isSelected={curMenuIndex === menus.updateLabel}
            onClick={() => onMenuChangede(menus.updateLabel)}
          >
            <BoxIcon />
          </MenuButton>
        </SideMenuBox>
        {curMenuIndex === menus.createLabel ? (
          <CreateLabelBoxContainer
            labelBoxList={labelBoxList}
            setLabelBoxList={setLabelBoxData}
            imageUrl={imageUrl}
          />
        ) : (
          <UpdateLabelBoxContainer
            labelBoxList={labelBoxList}
            setLabelBoxList={setLabelBoxData}
            imageUrl={imageUrl}
          />
        )}
      </RowContainer>
    </PageContainer>
  )
}
