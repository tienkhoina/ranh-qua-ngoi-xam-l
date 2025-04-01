import { useState, useEffect, useCallback } from 'react'
import './App.css'

function App() {
  const [gameSize, setGameSize] = useState({ width: 800, height: 600 })
  const [birdPosition, setBirdPosition] = useState(250)
  const [birdVelocity, setBirdVelocity] = useState(0)
  const [pipes, setPipes] = useState([])
  const [score, setScore] = useState(0)
  const [gameActive, setGameActive] = useState(true)
  const [birdRotation, setBirdRotation] = useState(0)

  // Game settings
  const gravity = 0.5
  const jump = -8
  const pipeWidth = 60
  const pipeGap = 150

  // Responsive game area
  useEffect(() => {
    const handleResize = () => {
      const maxWidth = Math.min(800, window.innerWidth - 40)
      const maxHeight = Math.min(600, window.innerHeight - 40)
      setGameSize({ width: maxWidth, height: maxHeight })
    }

    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const generatePipe = useCallback(() => {
    const minGap = 100
    const maxGap = gameSize.height - 200
    const gapPosition = Math.random() * (maxGap - minGap) + minGap
    return {
      topHeight: gapPosition,
      bottomHeight: gameSize.height - gapPosition - pipeGap,
      x: gameSize.width,
      passed: false
    }
  }, [gameSize.height, pipeGap, gameSize.width])

  const resetGame = () => {
    setBirdPosition(gameSize.height / 2 - 20)
    setBirdVelocity(0)
    setPipes([])
    setScore(0)
    setGameActive(true)
    setBirdRotation(0)
  }

  // Handle jump
  useEffect(() => {
    const handleKeyPress = (e) => {
      if ((e.code === 'Space' || e.type === 'click') && gameActive) {
        setBirdVelocity(jump)
        setBirdRotation(-20)
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    window.addEventListener('click', handleKeyPress)
    return () => {
      window.removeEventListener('keydown', handleKeyPress)
      window.removeEventListener('click', handleKeyPress)
    }
  }, [gameActive, jump])

  // Game loop
  useEffect(() => {
    const gameLoop = setInterval(() => {
      if (!gameActive) return

      // Update bird physics
      setBirdVelocity(prevVelocity => prevVelocity + gravity)
    setBirdPosition(prevPosition => Math.max(0, Math.min(gameSize.height - 40, prevPosition + birdVelocity)))
    setBirdRotation(prevRotation => Math.min(30, prevRotation + 1))

      // Update pipes
      setPipes(prev => {
        const newPipes = prev.map(pipe => ({
          ...pipe,
          x: pipe.x - 3
        })).filter(pipe => pipe.x > -pipeWidth)

        // Add new pipe
        if (newPipes.length === 0 || newPipes[newPipes.length - 1].x < gameSize.width - 250) {
          newPipes.push(generatePipe())
        }

        // Update score
        newPipes.forEach(pipe => {
          if (!pipe.passed && pipe.x + pipeWidth < 100) {
            pipe.passed = true
            setScore(s => s + 1)
          }
        })

        return newPipes
      })

      // Collision detection
      const birdRect = {
        x: 100,
        y: birdPosition,
        width: 40,
        height: 40
      }

      for (const pipe of pipes) {
        const topPipeRect = {
          x: pipe.x,
          y: 0,
          width: pipeWidth,
          height: pipe.topHeight
        }

        const bottomPipeRect = {
          x: pipe.x,
          y: gameSize.height - pipe.bottomHeight,
          width: pipeWidth,
          height: pipe.bottomHeight
        }

        if (checkCollision(birdRect, topPipeRect) || 
            checkCollision(birdRect, bottomPipeRect) || 
            birdPosition >= gameSize.height - 40) {
          setGameActive(false)
        }
      }
    }, 1000/60)

    return () => clearInterval(gameLoop)
  }, [gameActive, birdPosition, pipes, generatePipe, gameSize.height, gameSize.width, birdVelocity, gravity])

  const checkCollision = (rect1, rect2) => {
    return (
      rect1.x < rect2.x + rect2.width &&
      rect1.x + rect1.width > rect2.x &&
      rect1.y < rect2.y + rect2.height &&
      rect1.y + rect1.height > rect2.y
    )
  }

  return (
    <div>
      <div 
        className="mainname" 
        style={{
          textAlign: 'center', 
          fontSize: '2rem', 
          fontWeight: 'bold', 
          marginBottom: '20px'
        }}
      >
        Web của Tiến Khôi :D
      </div>
      <div className="game-container" style={{ width: gameSize.width, height: gameSize.height }}>
        <div className="background-layer" />
        <div className="score">Score: {score}</div>
        
        {/* Bird */}
        <div 
          className="bird"
          style={{
            top: birdPosition,
            transform: `rotate(${birdRotation}deg)`
          }}
        />

        {/* Pipes */}
        {pipes.map((pipe, index) => (
          <div key={index}>
            <div 
              className="pipe top"
              style={{
                left: pipe.x,
                height: pipe.topHeight,
                width: pipeWidth
              }}
            />
            <div 
              className="pipe bottom"
              style={{
                left: pipe.x,
                height: pipe.bottomHeight,
                width: pipeWidth
              }}
            />
          </div>
        ))}

        {!gameActive && (
          <div className="game-over">
            <h2>Em phải tin anh chứ</h2>
            <p>Anh chỉ yêu mỗi {score} em thôi</p>
            <button onClick={resetGame}>Yêu lại nào </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default App