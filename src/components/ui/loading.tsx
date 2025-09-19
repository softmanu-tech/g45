"use client"

import React from "react"
import { motion } from "framer-motion"

interface LoadingProps {
  message?: string
  fullScreen?: boolean
  size?: "sm" | "md" | "lg"
}

export function Loading({ 
  message = "Loading...", 
  fullScreen = true, 
  size = "md" 
}: LoadingProps) {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-6 h-6", 
    lg: "w-8 h-8"
  }

  const textSizes = {
    sm: "text-sm",
    md: "text-lg",
    lg: "text-xl"
  }

  const LoadingContent = () => (
    <div className="bg-blue-200/95 backdrop-blur-md rounded-xl shadow-xl border border-blue-300/50 p-8">
      <div className="flex flex-col items-center gap-6">
        {/* Animated Loading Rings */}
        <div className="relative">
          {/* Outer Ring */}
          <motion.div
            className={`${sizeClasses[size]} border-2 border-blue-300 rounded-full`}
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          />
          
          {/* Middle Ring */}
          <motion.div
            className={`absolute inset-0 ${sizeClasses[size]} border-2 border-transparent border-t-blue-600 border-r-blue-600 rounded-full`}
            animate={{ rotate: -360 }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
          />
          
          {/* Inner Ring */}
          <motion.div
            className={`absolute inset-1 ${sizeClasses[size]} border border-transparent border-t-blue-800 rounded-full`}
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          />
          
          {/* Center Dot */}
          <motion.div
            className="absolute inset-0 flex items-center justify-center"
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          >
            <div className="w-1 h-1 bg-blue-800 rounded-full" />
          </motion.div>
        </div>

        {/* Animated Text */}
        <div className="text-center">
          <motion.p 
            className={`${textSizes[size]} font-medium text-blue-800`}
            animate={{ opacity: [0.7, 1, 0.7] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          >
            {message}
          </motion.p>
          
          {/* Technical Loading Dots */}
          <div className="flex items-center justify-center gap-1 mt-3">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className="w-1.5 h-1.5 bg-blue-600 rounded-full"
                animate={{ 
                  y: [0, -8, 0],
                  opacity: [0.5, 1, 0.5]
                }}
                transition={{ 
                  duration: 1.2,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: i * 0.2
                }}
              />
            ))}
          </div>
        </div>

        {/* Technical Progress Bar */}
        <div className="w-48 h-1 bg-blue-300/50 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-blue-600 via-blue-500 to-blue-400 rounded-full"
            animate={{ x: ["-100%", "100%"] }}
            transition={{ 
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        </div>

        {/* System Status Indicator */}
        <div className="flex items-center gap-2 text-xs text-blue-700">
          <motion.div
            className="w-2 h-2 bg-green-500 rounded-full"
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          />
          <span className="font-mono">System Processing...</span>
        </div>
      </div>
    </div>
  )

  if (fullScreen) {
    return (
      <div className="min-h-screen bg-blue-300 flex items-center justify-center px-4">
        <LoadingContent />
      </div>
    )
  }

  return (
    <div className="flex items-center justify-center py-8">
      <LoadingContent />
    </div>
  )
}

// Quick loading component for inline use
export function QuickLoading({ message = "Loading..." }: { message?: string }) {
  return (
    <div className="flex items-center gap-3 text-blue-800">
      <div className="relative">
        <motion.div
          className="w-5 h-5 border-2 border-blue-300 rounded-full"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        />
        <motion.div
          className="absolute inset-0 w-5 h-5 border-2 border-transparent border-t-blue-600 rounded-full"
          animate={{ rotate: -360 }}
          transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
        />
      </div>
      <motion.span 
        className="font-medium"
        animate={{ opacity: [0.7, 1, 0.7] }}
        transition={{ duration: 1.5, repeat: Infinity }}
      >
        {message}
      </motion.span>
    </div>
  )
}
