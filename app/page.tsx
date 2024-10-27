'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { toast, ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

const WORDS = ['REACT', 'CLONE', 'WORDLE', 'GUESS', 'LETTER']
const WORD_LENGTH = 5
const MAX_GUESSES = 6
const KEYBOARD = [
  'QWERTYUIOP'.split(''),
  'ASDFGHJKL'.split(''),
  ['ENTER', ...'ZXCVBNM'.split(''), 'BACKSPACE']
]

type LetterStatus = 'correct' | 'present' | 'absent' | 'unused'

export default function Home() {
  const [solution, setSolution] = useState('')
  const [guesses, setGuesses] = useState<string[]>(Array(MAX_GUESSES).fill(''))
  const [currentGuess, setCurrentGuess] = useState('')
  const [gameOver, setGameOver] = useState(false)
  const [letterStatus, setLetterStatus] = useState<Record<string, LetterStatus>>({})
  const [shakeRow, setShakeRow] = useState(false)

  useEffect(() => {
    setSolution(WORDS[Math.floor(Math.random() * WORDS.length)])
  }, [])

  const updateLetterStatus = useCallback((guess: string) => {
    const newStatus = { ...letterStatus }
    for (let i = 0; i < guess.length; i++) {
      const letter = guess[i]
      if (solution[i] === letter) {
        newStatus[letter] = 'correct'
      } else if (solution.includes(letter) && newStatus[letter] !== 'correct') {
        newStatus[letter] = 'present'
      } else if (newStatus[letter] !== 'correct' && newStatus[letter] !== 'present') {
        newStatus[letter] = 'absent'
      }
    }
    setLetterStatus(newStatus)
  }, [solution, letterStatus])

  const checkGuessValidity = (guess: string) => {
    return guess.split('').some((letter, index) => 
      solution[index] === letter || solution.includes(letter)
    )
  }

  const onKeyPress = useCallback((key: string) => {
    if (gameOver) return

    if (key === 'ENTER') {
      if (currentGuess.length !== WORD_LENGTH) return

      if (!checkGuessValidity(currentGuess)) {
        setShakeRow(true)
        setTimeout(() => setShakeRow(false), 500)
        toast.error("Your guess must contain at least one correct letter!", {
          position: "top-center",
          autoClose: 2000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
        })
        return
      }

      const newGuesses = [...guesses]
      newGuesses[guesses.findIndex(val => val === '')] = currentGuess
      setGuesses(newGuesses)
      updateLetterStatus(currentGuess)

      if (currentGuess === solution) {
        setGameOver(true)
      } else if (newGuesses[MAX_GUESSES - 1] !== '') {
        setGameOver(true)
      }

      setCurrentGuess('')
    } else if (key === 'BACKSPACE') {
      setCurrentGuess(currentGuess.slice(0, -1))
    } else if (currentGuess.length < WORD_LENGTH) {
      setCurrentGuess(currentGuess + key)
    }
  }, [currentGuess, gameOver, guesses, solution, updateLetterStatus])

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Enter') {
        onKeyPress('ENTER')
      } else if (event.key === 'Backspace') {
        onKeyPress('BACKSPACE')
      } else if (/^[A-Za-z]$/.test(event.key)) {
        onKeyPress(event.key.toUpperCase())
      }
    }

    window.addEventListener('keydown', handleKeyDown)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [onKeyPress])

  const getLetterClass = (letter: string, index: number, guess: string) => {
    if (guess[index] === solution[index]) {
      return 'bg-emerald-500 text-white'
    } else if (solution.includes(guess[index])) {
      return 'bg-amber-500 text-white'
    } else {
      return 'bg-slate-600 text-white'
    }
  }

  const getKeyboardButtonClass = (key: string) => {
    switch (letterStatus[key]) {
      case 'correct':
        return 'bg-emerald-500 text-white'
      case 'present':
        return 'bg-amber-500 text-white'
      case 'absent':
        return 'bg-slate-600 text-white'
      default:
        return 'bg-slate-300 text-slate-800'
    }
  }

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <Card className="w-full max-w-lg bg-slate-800 border-none shadow-2xl">
        <CardHeader className="border-b border-slate-700">
          <CardTitle className="text-3xl font-bold text-center text-white">Wordle Clone</CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <style jsx global>{`
            @keyframes shake {
              0% { transform: translateX(0); }
              25% { transform: translateX(5px); }
              50% { transform: translateX(-5px); }
              75% { transform: translateX(5px); }
              100% { transform: translateX(0); }
            }
            .shake {
              animation: shake 0.5s ease-in-out;
            }
            @keyframes flip {
              0% { transform: scaleY(1); }
              50% { transform: scaleY(0); }
              100% { transform: scaleY(1); }
            }
            .flip {
              animation: flip 0.5s ease-in-out;
            }
            @keyframes pulse {
              0% { transform: scale(1); }
              50% { transform: scale(1.05); }
              100% { transform: scale(1); }
            }
            .pulse {
              animation: pulse 0.2s ease-in-out;
            }
          `}</style>
          <div className="grid grid-cols-5 gap-2 mb-6">
            {guesses.map((guess, i) => (
              <React.Fragment key={i}>
                {guess
                  ? guess.split('').map((letter, j) => (
                      <div
                        key={j}
                        className={`w-14 h-14 flex items-center justify-center text-2xl font-bold rounded-md ${getLetterClass(
                          letter,
                          j,
                          guess
                        )} flip`}
                        style={{ animationDelay: `${j * 0.1}s` }}
                      >
                        {letter}
                      </div>
                    ))
                  : Array(WORD_LENGTH)
                      .fill('')
                      .map((_, j) => (
                        <div
                          key={j}
                          className={`w-14 h-14 flex items-center justify-center text-2xl font-bold rounded-md border-2 border-slate-600 text-white ${
                            i === guesses.findIndex(val => val === '') && shakeRow ? 'shake' : ''
                          }`}
                        >
                          {i === guesses.findIndex(val => val === '') && j < currentGuess.length
                            ? currentGuess[j]
                            : ''}
                        </div>
                      ))}
              </React.Fragment>
            ))}
          </div>

          {KEYBOARD.map((row, i) => (
            <div key={i} className={`flex justify-center gap-1 mb-2`}>
              {row.map((key) => (
                <Button
                  key={key}
                  onClick={() => onKeyPress(key)}
                  className={`${
                    key.length > 1 ? 'px-2 py-4' : 'w-10 h-12'
                  } text-sm font-bold rounded-md transition-all duration-200 ${getKeyboardButtonClass(key)} hover:opacity-80 focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-white pulse`}
                >
                  {key === 'BACKSPACE' ? '←' : key}
                </Button>
              ))}
            </div>
          ))}

          {gameOver && (
            <div className="mt-6 text-center bg-slate-700 p-4 rounded-md">
              {guesses.find(guess => guess === solution) ? (
                <p className="text-emerald-400 font-bold text-xl">Congratulations! You guessed the word!</p>
              ) : (
                <p className="text-red-400 font-bold text-xl">Game Over. The word was: {solution}</p>
              )}
            </div>
          )}
        </CardContent>
      </Card>
      <ToastContainer theme="dark" />
    </div>
  )
}