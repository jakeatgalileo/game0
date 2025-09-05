"use client"

import { useState, useEffect, useCallback, useRef } from "react"

// Tetris piece definitions
const PIECES = [
  {
    shape: [[1, 1, 1, 1]], // I-piece
    color: "bg-cyan-400",
  },
  {
    shape: [
      [1, 1],
      [1, 1],
    ], // O-piece
    color: "bg-yellow-400",
  },
  {
    shape: [
      [0, 1, 0],
      [1, 1, 1],
    ], // T-piece
    color: "bg-purple-400",
  },
  {
    shape: [
      [0, 1, 1],
      [1, 1, 0],
    ], // S-piece
    color: "bg-green-400",
  },
  {
    shape: [
      [1, 1, 0],
      [0, 1, 1],
    ], // Z-piece
    color: "bg-red-400",
  },
  {
    shape: [
      [1, 0, 0],
      [1, 1, 1],
    ], // J-piece
    color: "bg-blue-400",
  },
  {
    shape: [
      [0, 0, 1],
      [1, 1, 1],
    ], // L-piece
    color: "bg-orange-400",
  },
]

const BOARD_WIDTH = 10
const BOARD_HEIGHT = 24

interface Position {
  x: number
  y: number
}

interface Piece {
  shape: number[][]
  color: string
  position: Position
}

type TetrisProps = {
  className?: string
  size?: 'mini' | 'focus'
  paused?: boolean
  onPausedChange?: (paused: boolean) => void
  captureKeyboardWhenFocusedOnly?: boolean
}

export default function TetrisLoadingGame({
  className,
  size = 'mini',
  paused,
  onPausedChange,
  captureKeyboardWhenFocusedOnly = true,
}: TetrisProps) {
  const [board, setBoard] = useState<string[][]>(() =>
    Array(BOARD_HEIGHT)
      .fill(null)
      .map(() => Array(BOARD_WIDTH).fill("")),
  )
  const [currentPiece, setCurrentPiece] = useState<Piece | null>(null)
  const [gameOver, setGameOver] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [isFocused, setIsFocused] = useState(false)
  const gameLoopRef = useRef<NodeJS.Timeout | null>(null)
  const lastDropTime = useRef<number>(Date.now())
  const effectivePaused = paused ?? isPaused

  const generatePiece = useCallback((): Piece => {
    const pieceType = PIECES[Math.floor(Math.random() * PIECES.length)]
    return {
      shape: pieceType.shape,
      color: pieceType.color,
      position: { x: Math.floor(BOARD_WIDTH / 2) - 1, y: 0 },
    }
  }, [])

  const checkCollision = useCallback(
    (piece: Piece, newPosition: Position): boolean => {
      for (let y = 0; y < piece.shape.length; y++) {
        for (let x = 0; x < piece.shape[y].length; x++) {
          if (piece.shape[y][x]) {
            const newX = newPosition.x + x
            const newY = newPosition.y + y

            // Check boundaries
            if (newX < 0 || newX >= BOARD_WIDTH || newY >= BOARD_HEIGHT) {
              return true
            }

            // Check collision with existing pieces
            if (newY >= 0 && board[newY][newX]) {
              return true
            }
          }
        }
      }
      return false
    },
    [board],
  )

  const rotatePiece = useCallback((piece: Piece): number[][] => {
    const rotated = piece.shape[0].map((_, index) => piece.shape.map((row) => row[index]).reverse())
    return rotated
  }, [])

  const placePiece = useCallback(
    (piece: Piece) => {
      const newBoard = board.map((row) => [...row])

      // Place piece on board
      for (let y = 0; y < piece.shape.length; y++) {
        for (let x = 0; x < piece.shape[y].length; x++) {
          if (piece.shape[y][x]) {
            const boardY = piece.position.y + y
            const boardX = piece.position.x + x
            if (boardY >= 0) {
              newBoard[boardY][boardX] = piece.color
            }
          }
        }
      }

      // Check for completed lines
      const completedLines: number[] = []
      for (let y = 0; y < BOARD_HEIGHT; y++) {
        if (newBoard[y].every((cell) => cell !== "")) {
          completedLines.push(y)
        }
      }

      // Remove completed lines
      completedLines.forEach((lineIndex) => {
        newBoard.splice(lineIndex, 1)
        newBoard.unshift(Array(BOARD_WIDTH).fill(""))
      })

      setBoard(newBoard)
    },
    [board],
  )

  const movePiece = useCallback(
    (direction: "left" | "right" | "down" | "rotate" | "hardDrop") => {
      if (!currentPiece || gameOver || effectivePaused) return

      if (direction === "hardDrop") {
        const dropPosition = { ...currentPiece.position }
        while (!checkCollision(currentPiece, { ...dropPosition, y: dropPosition.y + 1 })) {
          dropPosition.y += 1
        }
        const droppedPiece = { ...currentPiece, position: dropPosition }
        placePiece(droppedPiece)

        const newPiece = generatePiece()
        if (checkCollision(newPiece, newPiece.position)) {
          setGameOver(true)
        } else {
          setCurrentPiece(newPiece)
        }
        return
      }

      const newPosition = { ...currentPiece.position }
      let newShape = currentPiece.shape

      switch (direction) {
        case "left":
          newPosition.x -= 1
          break
        case "right":
          newPosition.x += 1
          break
        case "down":
          newPosition.y += 1
          lastDropTime.current = Date.now()
          break
        case "rotate":
          newShape = rotatePiece(currentPiece)
          break
      }

      const testPiece = { ...currentPiece, shape: newShape, position: newPosition }

      if (!checkCollision(testPiece, newPosition)) {
        setCurrentPiece(testPiece)
      } else if (direction === "down") {
        placePiece(currentPiece)

        const newPiece = generatePiece()
        if (checkCollision(newPiece, newPiece.position)) {
          setGameOver(true)
        } else {
          setCurrentPiece(newPiece)
        }
      }
    },
    [currentPiece, gameOver, effectivePaused, checkCollision, rotatePiece, placePiece, generatePiece],
  )

  const dropPiece = useCallback(() => {
    if (!gameOver && !effectivePaused && currentPiece) {
      movePiece("down")
    }
  }, [gameOver, effectivePaused, currentPiece, movePiece])

  useEffect(() => {
    if (gameOver || effectivePaused) {
      if (gameLoopRef.current) {
        clearInterval(gameLoopRef.current)
        gameLoopRef.current = null
      }
      return
    }

    const gameLoop = () => {
      const now = Date.now()
      if (now - lastDropTime.current >= 800) {
        dropPiece()
        lastDropTime.current = now
      }
    }

    gameLoopRef.current = setInterval(gameLoop, 50)

    return () => {
      if (gameLoopRef.current) {
        clearInterval(gameLoopRef.current)
        gameLoopRef.current = null
      }
    }
  }, [gameOver, effectivePaused, dropPiece])

  useEffect(() => {
    if (!currentPiece && !gameOver) {
      setCurrentPiece(generatePiece())
    }
  }, [currentPiece, gameOver, generatePiece])

  const getGhostPosition = useCallback(
    (piece: Piece): Position => {
      if (!piece) return { x: 0, y: 0 }

      const ghostPosition = { ...piece.position }
      while (!checkCollision(piece, { ...ghostPosition, y: ghostPosition.y + 1 })) {
        ghostPosition.y += 1
      }
      return ghostPosition
    },
    [checkCollision],
  )

  const renderBoard = () => {
    const displayBoard = board.map((row) => [...row])

    if (currentPiece) {
      const ghostPosition = getGhostPosition(currentPiece)
      for (let y = 0; y < currentPiece.shape.length; y++) {
        for (let x = 0; x < currentPiece.shape[y].length; x++) {
          if (currentPiece.shape[y][x]) {
            const boardY = ghostPosition.y + y
            const boardX = ghostPosition.x + x
            if (boardY >= 0 && boardY < BOARD_HEIGHT && boardX >= 0 && boardX < BOARD_WIDTH) {
              // Only show ghost if it's not at the same position as current piece
              if (boardY !== currentPiece.position.y + y || boardX !== currentPiece.position.x + x) {
                displayBoard[boardY][boardX] = "ghost"
              }
            }
          }
        }
      }
    }

    if (currentPiece) {
      for (let y = 0; y < currentPiece.shape.length; y++) {
        for (let x = 0; x < currentPiece.shape[y].length; x++) {
          if (currentPiece.shape[y][x]) {
            const boardY = currentPiece.position.y + y
            const boardX = currentPiece.position.x + x
            if (boardY >= 0 && boardY < BOARD_HEIGHT && boardX >= 0 && boardX < BOARD_WIDTH) {
              displayBoard[boardY][boardX] = currentPiece.color
            }
          }
        }
      }
    }

    return displayBoard
  }

  useEffect(() => {
    const shouldCapture = captureKeyboardWhenFocusedOnly ? isFocused : true
    if (!shouldCapture) return

    const handleKeyPress = (event: KeyboardEvent) => {
      if (gameOver) return

      switch (event.key) {
        case "ArrowLeft":
          event.preventDefault()
          movePiece("left")
          break
        case "ArrowRight":
          event.preventDefault()
          movePiece("right")
          break
        case "ArrowDown":
          event.preventDefault()
          movePiece("down")
          break
        case "ArrowUp":
          event.preventDefault()
          movePiece("rotate")
          break
        case " ":
          event.preventDefault()
          movePiece("hardDrop")
          break
        case "r":
        case "R":
          if (gameOver) {
            event.preventDefault()
            setBoard(
              Array(BOARD_HEIGHT)
                .fill(null)
                .map(() => Array(BOARD_WIDTH).fill("")),
            )
            setCurrentPiece(null)
            setGameOver(false)
            setIsPaused(false)
            onPausedChange?.(false)
            lastDropTime.current = Date.now()
          }
          break
      }
    }

    window.addEventListener("keydown", handleKeyPress)
    return () => window.removeEventListener("keydown", handleKeyPress)
  }, [movePiece, gameOver, isFocused, captureKeyboardWhenFocusedOnly, onPausedChange])

  const cellPx = size === 'focus' ? 18 : 14

  return (
    <div
      className={`relative outline-none ${className ?? ""}`}
      tabIndex={0}
      onFocus={() => setIsFocused(true)}
      onBlur={() => setIsFocused(false)}
      onClick={(e) => { (e.currentTarget as HTMLDivElement).focus() }}
      style={{
        // @ts-expect-error CSS var helper
        "--cell-size": `${cellPx}px`,
      }}
    >
      <div className="relative mx-auto">
        <div
          className="grid gap-[1px] p-2 bg-border rounded-[6px] shadow-lg"
          style={{
            gridTemplateColumns: `repeat(${BOARD_WIDTH}, var(--cell-size))`,
            gridAutoRows: 'var(--cell-size)'
          } as React.CSSProperties}
        >
          {renderBoard().map((row, y) =>
            row.map((cell, x) => (
              <div
                key={`${y}-${x}`}
                style={{ width: 'var(--cell-size)', height: 'var(--cell-size)' }}
                className={`rounded-[2px] border border-border/20 transition-colors ${
                  cell === "ghost" ? "bg-muted-foreground/20 border-muted-foreground/30" : cell || "bg-background/50"
                }`}
              />
            )),
          )}
        </div>

        {effectivePaused && !gameOver && (
          <div className="absolute inset-0 bg-background/90 flex items-center justify-center rounded-[6px]">
            <div className="text-center">
              <p className="font-sans text-lg font-semibold text-foreground mb-2">Paused</p>
              <p className="text-sm text-muted-foreground">Press Space to continue</p>
            </div>
          </div>
        )}

        {gameOver && (
          <div className="absolute inset-0 bg-background/90 flex items-center justify-center rounded-[6px]">
            <div className="text-center">
              <p className="font-sans text-lg font-semibold text-foreground mb-1">Game Over</p>
              <button
                onClick={() => {
                  setBoard(
                    Array(BOARD_HEIGHT)
                      .fill(null)
                      .map(() => Array(BOARD_WIDTH).fill("")),
                  )
                  setCurrentPiece(null)
                  setGameOver(false)
                  setIsPaused(false)
                  onPausedChange?.(false)
                  lastDropTime.current = Date.now()
                }}
                className="px-4 py-2 bg-primary text-primary-foreground rounded-[6px] font-sans text-sm hover:bg-primary/90 transition-colors"
              >
                Play Again
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="mt-2 text-center text-[11px] text-muted-foreground select-none">
        Arrow keys to move • Spacebar to drop
      </div>
    </div>
  )
}
