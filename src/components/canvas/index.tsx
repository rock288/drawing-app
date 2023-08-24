"use client"

import React, { useCallback, useEffect, useRef, useState } from "react"
import Button from "../button"
import LayerStraight from "./layer1"

export interface Point {
  x: number
  y: number
}

function Drawing() {
  const [lineWidth, setLineWidth] = useState<string>("1")
  const [color, setColor] = useState<string>("#ff0000")
  const [straight, setStraight] = useState<boolean>(false)
  const [currentFile, setCurrentFile] = useState<File | null>(null)

  const refCanvas = useRef<HTMLCanvasElement | null>(null)
  const painting = useRef<boolean>(false)

  const getCtx = () => {
    if (refCanvas.current) {
      return refCanvas.current.getContext("2d")
    }
    return null
  }

  const onChangeFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]

    if (file) {
      setCurrentFile(file)
      drawImage(file)
    }

    e.target.files = null
  }

  const drawImage = (file: File) => {
    const ctx = getCtx()

    if (ctx) {
      const reader = new FileReader()
      reader.onload = function (event) {
        const image = new Image()
        image.onload = function () {
          // Vẽ hình ảnh đã tải lên canvas
          ctx.drawImage(image, 0, 0, 500, 500)
        }
        image.src = (event.target?.result || "") as string
      }
      reader.readAsDataURL(file)
    }
  }

  const getX = (e: MouseEvent | TouchEvent) => {
    if (refCanvas.current) {
      const clientX =
        (e as MouseEvent).clientX || (e as TouchEvent).touches[0].clientX
      const canvasRect = refCanvas.current.getBoundingClientRect()
      const canvasX = canvasRect.left
      return clientX - canvasX + window.pageXOffset
    }

    return 0
  }

  const getY = (e: MouseEvent | TouchEvent) => {
    if (refCanvas.current) {
      const clientY =
        (e as MouseEvent).clientY || (e as TouchEvent).touches[0].clientY
      const canvasRect = refCanvas.current.getBoundingClientRect()
      const canvasY = canvasRect.top
      return clientY - canvasY + window.pageYOffset
    }

    return 0
  }

  const stop = useCallback((e: MouseEvent | TouchEvent) => {
    if (painting.current) {
      const ctx = getCtx()
      if (ctx) {
        ctx.stroke()
        ctx.closePath()
        painting.current = false
      }
    }

    e.preventDefault()
  }, [])

  const start = useCallback((e: MouseEvent | TouchEvent) => {
    painting.current = true

    const ctx = getCtx()
    if (ctx) {
      ctx.beginPath()
      ctx.moveTo(getX(e as MouseEvent), getY(e as MouseEvent))
    }
    e.preventDefault()
  }, [])

  const draw = useCallback(
    (e: MouseEvent | TouchEvent) => {
      if (!painting.current) return

      const ctx = getCtx()
      if (ctx) {
        ctx.strokeStyle = color
        ctx.lineWidth = parseInt(lineWidth) || 1
        ctx.lineCap = "round"
        ctx.lineJoin = "round"
        ctx.lineTo(getX(e as MouseEvent), getY(e as MouseEvent))
        ctx.stroke()
      }
      e.preventDefault()
    },
    [color, lineWidth]
  )

  const drawStraight = (start: Point, end: Point) => {
    const ctx = getCtx()
    if (ctx) {
      ctx.strokeStyle = color
      ctx.lineWidth = parseInt(lineWidth) || 1

      ctx.beginPath()
      ctx.moveTo(start.x, start.y)
      ctx.lineTo(end.x, end.y)
      ctx.stroke()
    }
  }

  const reset = () => {
    const ctx = getCtx()
    if (ctx) {
      ctx.clearRect(0, 0, 500, 500)
      currentFile && drawImage(currentFile)
    }
  }

  useEffect(() => {
    if (refCanvas.current) {
      refCanvas.current.addEventListener("mousedown", start)
      refCanvas.current.addEventListener("mousemove", draw)
      refCanvas.current.addEventListener("touchstart", start)
      refCanvas.current.addEventListener("touchmove", draw)

      refCanvas.current.addEventListener("touchend", stop)
      refCanvas.current.addEventListener("mouseup", stop)
      refCanvas.current.addEventListener("mouseout", stop)
    }

    return () => {
      if (refCanvas.current) {
        refCanvas.current.removeEventListener("mousedown", start)
        refCanvas.current.removeEventListener("mousemove", draw)
        refCanvas.current.removeEventListener("touchstart", start)
        refCanvas.current.removeEventListener("touchmove", draw)

        refCanvas.current.removeEventListener("touchend", stop)
        refCanvas.current.removeEventListener("mouseup", stop)
        refCanvas.current.removeEventListener("mouseout", stop)
      }
    }
  }, [start, draw, stop])

  return (
    <div className="container mx-auto px-4">
      <div className="flex items-center justify-center gap-2 p-2">
        <input type="file" onChange={onChangeFile} />
      </div>

      <div className="flex items-center justify-center flex-col relative">
        <canvas
          className="border border-slate-600"
          ref={refCanvas}
          width={500}
          height={500}
        ></canvas>

        {straight ? (
          <LayerStraight {...{ lineWidth, color, drawStraight }} />
        ) : null}
        <div className="flex gap-2 p-2">
          <Button
            className={straight ? "bg-gray-500 hover:bg-gray-700" : ""}
            onClick={() => setStraight(!straight)}
          >
            Vẽ
          </Button>
          <Button
            className={straight ? "" : "bg-gray-500 hover:bg-gray-700"}
            onClick={() => setStraight(!straight)}
          >
            Đường thẳng
          </Button>
        </div>

        <div className="flex gap-2 p-2">
          <input
            className="h-auto w-20"
            value={lineWidth}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              setLineWidth(e.target.value)
            }}
          />
          <input
            className="w-20 h-20 "
            type="color"
            value={color}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setColor(e.target.value)
            }
          />
        </div>

        <div className="flex gap-2 p-2">
          <Button onClick={reset}>Reset</Button>
          <Button>Lưu</Button>
        </div>
      </div>
    </div>
  )
}

export default Drawing
