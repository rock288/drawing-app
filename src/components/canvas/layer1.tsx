"use client"

import React, { useCallback, useEffect, useRef, useState } from "react"
import { Point } from "./index"

interface Props {
  lineWidth: string
  color: string
  drawStraight: (start: Point, end: Point) => void
}

function LayerStraight({ lineWidth, color, drawStraight }: Props) {
  const refCanvas = useRef<HTMLCanvasElement | null>(null)
  const [startPoint, setStartPoint] = useState<Point | null>(null)
  const endPoint = useRef<Point | null>(null)

  const getCtx = () => {
    if (refCanvas.current) {
      return refCanvas.current.getContext("2d")
    }
    return null
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

  const resetPoint = () => {
    setStartPoint(null)
    endPoint.current = null
  }

  const stop = useCallback(
    (e: MouseEvent | TouchEvent) => {
      const ctx = getCtx()
      if (ctx) {
        if (startPoint && endPoint.current) {
          drawStraight(startPoint, endPoint.current)
        }
        resetPoint()
        ctx.clearRect(0, 0, 500, 500)
        ctx.closePath()
      }

      e.preventDefault()
    },
    [drawStraight, startPoint]
  )

  const start = useCallback(
    (e: MouseEvent | TouchEvent) => {
      const ctx = getCtx()
      if (ctx) {
        setStartPoint({ x: getX(e), y: getY(e) })
      }
      e.preventDefault()
    },
    [setStartPoint]
  )

  const draw = useCallback(
    (e: MouseEvent | TouchEvent) => {
      if (!startPoint) return

      const ctx = getCtx()
      if (ctx) {
        ctx.strokeStyle = color
        ctx.lineWidth = parseInt(lineWidth) || 1
        ctx.clearRect(0, 0, 500, 500)

        ctx.beginPath()
        ctx.moveTo(startPoint.x, startPoint.y)
        ctx.lineTo(getX(e), getY(e))
        ctx.stroke()

        endPoint.current = { x: getX(e), y: getY(e) }
      }
      e.preventDefault()
    },
    [color, lineWidth, startPoint]
  )

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
    <canvas
      className="absolute top-0 left-50 border border-slate-600 "
      ref={refCanvas}
      width={500}
      height={500}
    ></canvas>
  )
}

export default LayerStraight
