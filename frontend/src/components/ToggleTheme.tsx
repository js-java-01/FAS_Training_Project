import React, { useCallback, useEffect, useRef, useState } from "react"

type Animation = "ripple" | "fade" | "none"

interface ToggleThemeProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  animation?: Animation
}

const ToggleTheme: React.FC<ToggleThemeProps> = ({
  animation = "ripple",
  className = "",
  ...props
}) => {
  const [isDark, setIsDark] = useState<boolean>(() => {
    const stored = localStorage.getItem("theme")
    if (stored === "dark") return true
    if (stored === "light") return false
    return document.documentElement.classList.contains("dark")
  })

  const [animKey, setAnimKey] = useState(0)
  const btnRef = useRef<HTMLButtonElement | null>(null)
  const transitionTimeoutRef = useRef<number | null>(null)

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add("dark")
      localStorage.setItem("theme", "dark")
    } else {
      document.documentElement.classList.remove("dark")
      localStorage.setItem("theme", "light")
    }
  }, [isDark])

  const triggerThemeTransition = useCallback(() => {
    const root = document.documentElement
    root.classList.add("theme-transition")

    if (transitionTimeoutRef.current) {
      window.clearTimeout(transitionTimeoutRef.current)
    }

    transitionTimeoutRef.current = window.setTimeout(() => {
      root.classList.remove("theme-transition")
      transitionTimeoutRef.current = null
    }, 120)
  }, [])

  useEffect(() => {
    return () => {
      if (transitionTimeoutRef.current) {
        window.clearTimeout(transitionTimeoutRef.current)
      }
    }
  }, [])

  const applyThemeToggle = useCallback(() => {
    setIsDark(prev => {
      setAnimKey(k => k + 1)
      return !prev
    })
  }, [])

  const onToggle = useCallback(() => {
    triggerThemeTransition()
    applyThemeToggle()
  }, [applyThemeToggle, triggerThemeTransition])

  return (
    <button
      ref={btnRef}
      type="button"
      aria-pressed={isDark}
      onClick={onToggle}
      className={`
        relative w-11 h-11 rounded-full
        flex items-center justify-center
        transition-colors
        ${isDark ? "bg-slate-900 text-yellow-300" : "bg-white text-slate-700"}
        ${className}
      `}
      {...props}
    >
      {animation !== "none" && (
        <span
          key={animKey}
          aria-hidden
          className={`
            absolute inset-0 rounded-full
            ${animation === "ripple" ? "animate-ripple" : "animate-fade"}
          `}
        />
      )}

      {isDark ? (
        // Sun 
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
          <circle cx="12" cy="12" r="4" />
          <g stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <line x1="12" y1="1" x2="12" y2="3" />
            <line x1="12" y1="21" x2="12" y2="23" />
            <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
            <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
            <line x1="1" y1="12" x2="3" y2="12" />
            <line x1="21" y1="12" x2="23" y2="12" />
            <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
            <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
          </g>
        </svg>
      ) : (
        // Moon
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
          <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
        </svg>
      )}
    </button>
  )
}

export default ToggleTheme
