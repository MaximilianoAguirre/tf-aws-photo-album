import React, { useState, useContext, createContext } from 'react'

const ThemeContext = createContext()

export function useTheme() {
  return useContext(ThemeContext)
}

export const themes = {
  Dark: 'dark',
  Light: 'light'
}

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(themes.Dark)

  return (
    <ThemeContext.Provider
      value={{
        theme,
        setTheme
      }}
    >
      {children}
    </ThemeContext.Provider>
  )
}
