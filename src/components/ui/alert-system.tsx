"use client"

import React, { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, CheckCircle, AlertTriangle, XCircle, Info, Zap } from "lucide-react"

export type AlertType = "success" | "error" | "warning" | "info" | "loading"

interface Alert {
  id: string
  type: AlertType
  title: string
  message: string
  duration?: number
  actions?: Array<{
    label: string
    action: () => void
    variant?: "primary" | "secondary"
  }>
}

interface AlertContextType {
  alerts: Alert[]
  addAlert: (alert: Omit<Alert, "id">) => void
  removeAlert: (id: string) => void
  clearAlerts: () => void
}

const AlertContext = React.createContext<AlertContextType | undefined>(undefined)

export function useAlert() {
  const context = React.useContext(AlertContext)
  if (!context) {
    throw new Error("useAlert must be used within an AlertProvider")
  }
  return context
}

export function AlertProvider({ children }: { children: React.ReactNode }) {
  const [alerts, setAlerts] = useState<Alert[]>([])

  const addAlert = (alert: Omit<Alert, "id">) => {
    const id = Math.random().toString(36).substr(2, 9)
    const newAlert = { ...alert, id }
    setAlerts(prev => [...prev, newAlert])

    // Auto-remove after duration (default 5 seconds)
    if (alert.type !== "loading") {
      setTimeout(() => {
        removeAlert(id)
      }, alert.duration || 5000)
    }
  }

  const removeAlert = (id: string) => {
    setAlerts(prev => prev.filter(alert => alert.id !== id))
  }

  const clearAlerts = () => {
    setAlerts([])
  }

  return (
    <AlertContext.Provider value={{ alerts, addAlert, removeAlert, clearAlerts }}>
      {children}
      <AlertContainer alerts={alerts} removeAlert={removeAlert} />
    </AlertContext.Provider>
  )
}

function AlertContainer({ alerts, removeAlert }: { alerts: Alert[], removeAlert: (id: string) => void }) {
  return (
    <div className="fixed top-4 right-4 z-[9999] space-y-3 w-full max-w-sm sm:max-w-md md:max-w-lg px-4 sm:px-0">
      <AnimatePresence mode="popLayout">
        {alerts.map((alert) => (
          <AlertComponent
            key={alert.id}
            alert={alert}
            onRemove={() => removeAlert(alert.id)}
          />
        ))}
      </AnimatePresence>
    </div>
  )
}

function AlertComponent({ alert, onRemove }: { alert: Alert, onRemove: () => void }) {
  const getAlertConfig = (type: AlertType) => {
    switch (type) {
      case "success":
        return {
          icon: CheckCircle,
          bgColor: "bg-gradient-to-r from-blue-400 to-blue-600",
          borderColor: "border-blue-300",
          iconColor: "text-white",
          textColor: "text-white"
        }
      case "error":
        return {
          icon: XCircle,
          bgColor: "bg-gradient-to-r from-blue-500 to-blue-700",
          borderColor: "border-blue-400",
          iconColor: "text-white",
          textColor: "text-white"
        }
      case "warning":
        return {
          icon: AlertTriangle,
          bgColor: "bg-gradient-to-r from-blue-300 to-blue-500",
          borderColor: "border-blue-200",
          iconColor: "text-white",
          textColor: "text-white"
        }
      case "info":
        return {
          icon: Info,
          bgColor: "bg-gradient-to-r from-blue-500 to-blue-600",
          borderColor: "border-blue-300",
          iconColor: "text-white",
          textColor: "text-white"
        }
      case "loading":
        return {
          icon: Zap,
          bgColor: "bg-gradient-to-r from-blue-400 to-blue-600",
          borderColor: "border-blue-300",
          iconColor: "text-white",
          textColor: "text-white"
        }
    }
  }

  const config = getAlertConfig(alert.type)
  const Icon = config.icon

  return (
    <motion.div
      initial={{ opacity: 0, x: 300, scale: 0.8 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 300, scale: 0.8 }}
      transition={{ 
        type: "spring", 
        stiffness: 300, 
        damping: 30,
        opacity: { duration: 0.2 }
      }}
      className={`
        ${config.bgColor} ${config.borderColor} ${config.textColor}
        backdrop-blur-md border shadow-2xl rounded-xl p-3 sm:p-4 relative overflow-hidden
        hover:shadow-3xl transition-shadow duration-300 w-full
      `}
    >
      {/* Animated Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <motion.div
          className="absolute inset-0 bg-white"
          animate={{ 
            background: [
              "radial-gradient(circle at 20% 50%, white 0%, transparent 50%)",
              "radial-gradient(circle at 80% 50%, white 0%, transparent 50%)",
              "radial-gradient(circle at 50% 20%, white 0%, transparent 50%)",
              "radial-gradient(circle at 20% 50%, white 0%, transparent 50%)"
            ]
          }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      {/* Progress Bar for Timed Alerts */}
      {alert.type !== "loading" && (
        <motion.div
          className="absolute bottom-0 left-0 h-1 bg-white/30 rounded-full"
          initial={{ width: "100%" }}
          animate={{ width: "0%" }}
          transition={{ duration: alert.duration || 5, ease: "linear" }}
        />
      )}

      <div className="relative z-10">
        <div className="flex items-start gap-2 sm:gap-3">
          {/* Animated Icon */}
          <motion.div
            initial={{ rotate: 0, scale: 1 }}
            animate={{ 
              rotate: alert.type === "loading" ? 360 : 0,
              scale: [1, 1.1, 1]
            }}
            transition={{ 
              rotate: { duration: 2, repeat: alert.type === "loading" ? Infinity : 0, ease: "linear" },
              scale: { duration: 0.6, ease: "easeInOut" }
            }}
            className="flex-shrink-0 mt-0.5"
          >
            <Icon className={`h-5 w-5 sm:h-6 sm:w-6 ${config.iconColor}`} />
          </motion.div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <motion.h3
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-xs sm:text-sm font-bold leading-tight sm:leading-5"
            >
              {alert.title}
            </motion.h3>
            
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="mt-1 text-xs sm:text-sm opacity-90 leading-relaxed"
            >
              {alert.message}
            </motion.p>

            {/* Action Buttons */}
            {alert.actions && alert.actions.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="mt-3 flex flex-wrap gap-2"
              >
                {alert.actions.map((action, index) => (
                  <button
                    key={index}
                    onClick={action.action}
                    className={`
                      px-2 sm:px-3 py-1 sm:py-1.5 text-xs font-medium rounded-lg transition-all duration-200
                      ${action.variant === "primary" 
                        ? "bg-white/20 hover:bg-white/30 backdrop-blur-sm" 
                        : "bg-white/10 hover:bg-white/20 backdrop-blur-sm"
                      }
                      hover:scale-105 active:scale-95 flex-shrink-0
                    `}
                  >
                    {action.label}
                  </button>
                ))}
              </motion.div>
            )}
          </div>

          {/* Close Button */}
          {alert.type !== "loading" && (
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4 }}
              onClick={onRemove}
              className="flex-shrink-0 p-1 rounded-full hover:bg-white/20 transition-colors duration-200"
            >
              <X className="h-3 w-3 sm:h-4 sm:w-4" />
            </motion.button>
          )}
        </div>
      </div>

      {/* Particle Effects for Success */}
      {alert.type === "success" && (
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-white rounded-full"
              initial={{ 
                opacity: 0,
                x: "50%",
                y: "50%",
                scale: 0
              }}
              animate={{ 
                opacity: [0, 1, 0],
                x: `${50 + (Math.random() - 0.5) * 200}%`,
                y: `${50 + (Math.random() - 0.5) * 200}%`,
                scale: [0, 1, 0]
              }}
              transition={{ 
                duration: 2,
                delay: i * 0.1,
                ease: "easeOut"
              }}
            />
          ))}
        </div>
      )}
    </motion.div>
  )
}

// Convenience functions for common alert types
export const showAlert = {
  success: (title: string, message: string, actions?: Alert["actions"]) => {
    const { addAlert } = useAlert()
    addAlert({ type: "success", title, message, actions })
  },
  
  error: (title: string, message: string, actions?: Alert["actions"]) => {
    const { addAlert } = useAlert()
    addAlert({ type: "error", title, message, actions, duration: 8000 })
  },
  
  warning: (title: string, message: string, actions?: Alert["actions"]) => {
    const { addAlert } = useAlert()
    addAlert({ type: "warning", title, message, actions, duration: 6000 })
  },
  
  info: (title: string, message: string, actions?: Alert["actions"]) => {
    const { addAlert } = useAlert()
    addAlert({ type: "info", title, message, actions })
  },
  
  loading: (title: string, message: string) => {
    const { addAlert } = useAlert()
    return addAlert({ type: "loading", title, message })
  }
}

// Hook for easy alert usage
export function useAlerts() {
  const { addAlert, removeAlert, clearAlerts } = useAlert()
  
  return {
    success: (title: string, message: string, actions?: Alert["actions"]) => 
      addAlert({ type: "success", title, message, actions }),
    
    error: (title: string, message: string, actions?: Alert["actions"]) => 
      addAlert({ type: "error", title, message, actions, duration: 8000 }),
    
    warning: (title: string, message: string, actions?: Alert["actions"]) => 
      addAlert({ type: "warning", title, message, actions, duration: 6000 }),
    
    info: (title: string, message: string, actions?: Alert["actions"]) => 
      addAlert({ type: "info", title, message, actions }),
    
    loading: (title: string, message: string) => 
      addAlert({ type: "loading", title, message }),
    
    remove: removeAlert,
    clear: clearAlerts
  }
}
