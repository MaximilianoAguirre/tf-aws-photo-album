import React, { useState, useContext, createContext } from 'react'

const UserDrawerContext = createContext()

export function useUserDrawer() {
  return useContext(UserDrawerContext)
}

export function UserDrawerProvider({ children }) {
  const [opened, setOpen] = useState(false)

  return (
    <UserDrawerContext.Provider
      value={{
        opened,
        open: () => setOpen(true),
        close: () => setOpen(false)
      }}
    >
      {children}
    </UserDrawerContext.Provider>
  )
}
