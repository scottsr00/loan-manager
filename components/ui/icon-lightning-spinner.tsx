'use client'

import React, { useState, useEffect } from 'react'
import { Zap } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

export default function IconLightningSpinner() {
  const [isLoading, setIsLoading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [animation, setAnimation] = useState<'none' | 'spin' | 'shake'>('none')

  useEffect(() => {
    let interval: NodeJS.Timeout
    if (isLoading) {
      interval = setInterval(() => {
        setProgress((prevProgress) => {
          if (prevProgress >= 100) {
            setAnimation('spin')
            setTimeout(() => {
              setAnimation('shake')
              setTimeout(() => setAnimation('none'), 500) // Reset after shake
            }, 500) // Start shake after spin
            return 0
          }
          return prevProgress + 1
        })
      }, 20)
    } else {
      setProgress(0)
      setAnimation('none')
    }
    return () => clearInterval(interval)
  }, [isLoading])

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Icon Lightning Spinner</CardTitle>
        <CardDescription>Watch the lightning strike, spin, and shake</CardDescription>
      </CardHeader>
      <CardContent className="flex justify-center items-center h-80 bg-gray-100 rounded-md">
        {isLoading && (
          <div className={`relative w-32 h-64 flex items-center justify-center ${
            animation === 'spin' ? 'animate-spin-once' : 
            animation === 'shake' ? 'animate-shake' : ''
          }`}>
            <Zap 
              className="w-24 h-24 text-gray-300" 
              strokeWidth={2}
            />
            <div 
              className="absolute inset-0 flex items-center justify-center"
              style={{
                clipPath: `inset(${100 - progress}% 0 0 0)`,
                transition: 'clip-path 20ms linear'
              }}
            >
              <Zap 
                className="w-24 h-24 text-yellow-500" 
                strokeWidth={2}
              />
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-center">
        <Button 
          onClick={() => setIsLoading(!isLoading)}
          variant="outline"
          className="border-2 border-gray-800 text-gray-800 font-bold hover:bg-gray-800 hover:text-white transition-colors"
        >
          {isLoading ? 'Stop Lightning' : 'Start Lightning'}
        </Button>
      </CardFooter>
      <style jsx global>{`
        @keyframes spinOnce {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
        .animate-spin-once {
          animation: spinOnce 0.5s linear;
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
          20%, 40%, 60%, 80% { transform: translateX(5px); }
        }
        .animate-shake {
          animation: shake 0.5s cubic-bezier(.36,.07,.19,.97) both;
        }
      `}</style>
    </Card>
  )
}