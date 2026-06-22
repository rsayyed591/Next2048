// ts-ignore
"use client"
import { useState, useEffect, useCallback, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
// import { useToast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"
import Confetti from "react-confetti"
import useWindowSize from "react-use/lib/useWindowSize"

type Tile = {
  id: number
  value: number
  mergedFrom?: Tile[]
}

type Grid = (Tile | null)[][]

const GRID_SIZE = 4
const CELL_SIZE = 14
// const CELL_GAP = 2

const Game2048 = () => {
  const [grid, setGrid] = useState<Grid>([])
  const [score, setScore] = useState(0)
  const [isWon, setIsWon] = useState(false)
  const [gameOver, setGameOver] = useState(false) 
//   const { toast } = useToast()
  const { width, height } = useWindowSize()
  const touchStartRef = useRef<{ x: number; y: number } | null>(null)

  useEffect(() => {
    resetGame()
  }, [])

  const resetGame = () => {
    const newGrid = Array(GRID_SIZE)
      .fill(null)
      .map(() => Array(GRID_SIZE).fill(null))
    addRandomTile(newGrid)
    addRandomTile(newGrid)
    setGrid(newGrid)
    setScore(0)
    setIsWon(false)
    setGameOver(false)
  }

  const addRandomTile = useCallback((grid: Grid) => {
    const availableCells = []
    for (let i = 0; i < GRID_SIZE; i++) {
      for (let j = 0; j < GRID_SIZE; j++) {
        if (!grid[i][j]) {
          availableCells.push({ i, j })
        }
      }
    }
    if (availableCells.length > 0) {
      const { i, j } = availableCells[Math.floor(Math.random() * availableCells.length)]
      grid[i][j] = { id: Math.random(), value: Math.random() < 0.9 ? 2 : 4 }
    }
  }, [])

const moveTiles = useCallback(
    (direction: "up" | "down" | "left" | "right") => {
      let moved = false
      let scoreIncrease = 0
      const newGrid: Grid = JSON.parse(JSON.stringify(grid)).map((row: (Tile | null)[]) =>
        row.map((tile: Tile | null) => (tile ? { ...tile, mergedFrom: undefined } : null))
      )      
  
      const move = (i: number, j: number, di: number, dj: number) => {
        const tile = newGrid[i][j]
        if (!tile) return 
      
        let newI = i + di
        let newJ = j + dj
        while (newI >= 0 && newI < GRID_SIZE && newJ >= 0 && newJ < GRID_SIZE) {
          const nextTile = newGrid[newI][newJ]
          if (!nextTile) {
            newGrid[newI][newJ] = tile
            newGrid[i][j] = null
            i = newI
            j = newJ
            moved = true
          } else if (nextTile.value === tile.value && !nextTile.mergedFrom) {
            newGrid[newI][newJ] = {
              id: Math.random(),
              value: tile.value * 2,
              mergedFrom: [tile, nextTile],
            }
            newGrid[i][j] = null
            // @ts-ignore: Object is possibly 'null'
            scoreIncrease += newGrid[newI][newJ].value
            moved = true
            // @ts-ignore: Object is possibly 'null'
            if (newGrid[newI][newJ].value === 2048 && !isWon) { // Fixed win condition to standard 2048
              setIsWon(true)
            }
            break
          } else {
            break
          }
          newI += di
          newJ += dj
        }
      }
  
      if (direction === "up") {
        for (let j = 0; j < GRID_SIZE; j++) {
          for (let i = 1; i < GRID_SIZE; i++) {
            move(i, j, -1, 0)
          }
        }
      } else if (direction === "down") {
        for (let j = 0; j < GRID_SIZE; j++) {
          for (let i = GRID_SIZE - 2; i >= 0; i--) {
            move(i, j, 1, 0)
          }
        }
      } else if (direction === "left") {
        for (let i = 0; i < GRID_SIZE; i++) {
          for (let j = 1; j < GRID_SIZE; j++) {
            move(i, j, 0, -1)
          }
        }
      } else if (direction === "right") {
        for (let i = 0; i < GRID_SIZE; i++) {
          for (let j = GRID_SIZE - 2; j >= 0; j--) {
            move(i, j, 0, 1)
          }
        }
      }
  
      if (moved) {
        addRandomTile(newGrid)
        setGrid(newGrid)
        setScore((prevScore) => prevScore + scoreIncrease)
      }
  
      if (isGameOver(newGrid)) {
        setGameOver(true)
      }
    },
    [grid, isWon, addRandomTile, gameOver],
  )
  
  const isGameOver = (grid: Grid) => {
    for (let i = 0; i < GRID_SIZE; i++) {
      for (let j = 0; j < GRID_SIZE; j++) {
        if (!grid[i][j]) return false
        if (
          (i < GRID_SIZE - 1 && grid[i][j]?.value === grid[i + 1][j]?.value) ||
          (j < GRID_SIZE - 1 && grid[i][j]?.value === grid[i][j + 1]?.value)
        ) {
          return false
        }
      }
    }
    return true
  }

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.key)) {
        e.preventDefault()
        moveTiles(e.key.replace("Arrow", "").toLowerCase() as "up" | "down" | "left" | "right")
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [moveTiles])

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartRef.current = {
      x: e.touches[0].clientX,
      y: e.touches[0].clientY,
    }
  }

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchStartRef.current) return

    const touchEnd = {
      x: e.changedTouches[0].clientX,
      y: e.changedTouches[0].clientY,
    }

    const dx = touchEnd.x - touchStartRef.current.x
    const dy = touchEnd.y - touchStartRef.current.y

    if (Math.abs(dx) > Math.abs(dy)) {
      moveTiles(dx > 0 ? "right" : "left")
    } else {
      moveTiles(dy > 0 ? "down" : "up")
    }

    touchStartRef.current = null
  }

  // Playful rainbow color mapping
  const getTileColor = (value: number) => {
    const colors: { [key: number]: string } = {
      2: "bg-pink-200 text-slate-800",
      4: "bg-rose-300 text-slate-800",
      8: "bg-orange-300 text-slate-800",
      16: "bg-yellow-300 text-slate-800",
      32: "bg-lime-300 text-slate-800",
      64: "bg-green-300 text-slate-800",
      128: "bg-teal-300 text-slate-800",
      256: "bg-cyan-300 text-slate-800",
      512: "bg-blue-300 text-slate-800",
      1024: "bg-indigo-400 text-white",
      2048: "bg-purple-500 text-white shadow-lg shadow-purple-500/50",
    }
    return colors[value] || "bg-fuchsia-500 text-white"
  }

  return (
    <Card
      className="p-6 bg-white/60 border-white/40 shadow-2xl backdrop-blur-md rounded-3xl"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <div className="mb-8 flex justify-between items-center">
        <h1 className="text-5xl font-extrabold text-slate-800 tracking-tight">2048</h1>
        <div className="text-right flex flex-col items-end gap-2">
          <div className="bg-slate-800 text-white px-6 py-2 rounded-2xl shadow-md">
            <span className="text-sm font-medium text-slate-300 uppercase tracking-wider block text-center">Score</span>
            <span className="text-2xl font-bold">{score}</span>
          </div>
          <Button onClick={resetGame} className="bg-indigo-500 hover:bg-indigo-600 text-white rounded-xl shadow-md transition-all">
            New Game
          </Button>
        </div>
      </div>
      
      <div
        className="grid gap-3 bg-slate-200/80 p-3 rounded-2xl shadow-inner"
        style={{
          gridTemplateColumns: `repeat(${GRID_SIZE}, ${CELL_SIZE}vmin)`,
          gridTemplateRows: `repeat(${GRID_SIZE}, ${CELL_SIZE}vmin)`,
        }}
      >
        {grid.flat().map((tile, index) => (
          <motion.div
            key={index}
            className={cn(
              "flex items-center justify-center rounded-xl font-extrabold text-3xl transition-colors",
              tile ? getTileColor(tile.value) : "bg-slate-300/50",
            )}
            initial={{ scale: tile?.mergedFrom ? 0 : 1 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 20 }}
          >
            <AnimatePresence>
              {tile && (
                <motion.div
                  key={tile.id}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                  className="w-full h-full flex items-center justify-center"
                >
                  {tile.value}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ))}
      </div>

      {isWon && (
        <div className="fixed inset-0 flex items-center justify-center bg-white/40 backdrop-blur-sm z-50">
          <Card className="p-8 bg-white border-none shadow-2xl rounded-3xl text-center max-w-sm w-full mx-4">
            <h2 className="text-3xl font-extrabold text-slate-800 mb-2">You Won! 🎉</h2>
            <p className="text-slate-500 mb-8">Incredible job reaching 2048!</p>
            <div className="flex gap-4 justify-center">
              <Button onClick={() => setIsWon(false)} variant="outline" className="rounded-xl border-slate-200 text-slate-600">
                Keep Playing
              </Button>
              <Button onClick={resetGame} className="rounded-xl bg-indigo-500 hover:bg-indigo-600 text-white">
                Play Again
              </Button>
            </div>
          </Card>
          <Confetti width={width} height={height} />
        </div>
      )}

      {gameOver && (
        <div className="fixed inset-0 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm z-50">
          <Card className="p-8 bg-white border-none shadow-2xl rounded-3xl text-center max-w-sm w-full mx-4">
            <h2 className="text-3xl font-extrabold text-slate-800 mb-2">Game Over!</h2>
            <p className="text-slate-500 mb-8">You scored <span className="font-bold text-indigo-500">{score}</span> points.</p>
            <Button onClick={resetGame} className="w-full rounded-xl bg-indigo-500 hover:bg-indigo-600 text-white py-6 text-lg">
              Try Again
            </Button>
          </Card>
          {/* Replaced gloomy gray confetti with a colorful default! */}
          <Confetti width={width} height={height} gravity={0.2} />
        </div>
      )}
    </Card>
  )
}

export default Game2048