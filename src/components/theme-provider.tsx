"use client"

import * as React from "react"
import { ThemeProvider as NextThemeProvider } from "next-themes"

type Attribute = "class" | "data-theme" | "data-mode"

interface ThemeProviderProps {
  children: React.ReactNode
  defaultTheme?: string
  attribute?: Attribute | Attribute[]
  enableSystem?: boolean
}

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return (
    <NextThemeProvider {...props}>
      {children}
    </NextThemeProvider>
  )
} 