"use client"

import * as React from "react"
import { useTheme } from "next-themes"

const defaultColors = {
    background: "#FCFEFF",
    foreground: "#0F172A",
    card: "#FFFFFF",
    cardForeground: "#0F172A",
    mutedForeground: "#64748B",
    header: "#FFFFFF",
    border: "#E2E8F0",
    primary: "#0057ff",
}

export function ThemeSync() {
    const { theme } = useTheme()

    React.useEffect(() => {
        const applyColors = () => {
            const root = document.documentElement

            // If theme is NOT 'custom', we STILL want to allow custom colors IF they exist?
            // Actually, the user wants "Tema Editável" to work. 
            // Let's make it so it applies if a specific flag exists or just if it's 'custom'.
            // The problem is that 'light'/'dark' from next-themes are very common.

            const savedColors = localStorage.getItem("lp-factory-theme-colors")

            if (theme !== 'custom') {
                // Clear all custom properties if not in custom mode
                const vars = [
                    '--background', '--foreground', '--card', '--card-foreground',
                    '--muted-foreground', '--header', '--border', '--primary',
                    '--ring', '--input'
                ]
                vars.forEach(v => root.style.removeProperty(v))
                return
            }

            let parsed = defaultColors
            if (savedColors) {
                try {
                    parsed = { ...defaultColors, ...JSON.parse(savedColors) }
                } catch (e) {
                    console.error("ThemeSync parse error:", e)
                }
            }

            const hexToHslParts = (hex: string) => {
                if (!hex || typeof hex !== 'string') return null
                let r = 0, g = 0, b = 0
                if (hex.length === 4) {
                    r = parseInt(hex[1] + hex[1], 16)
                    g = parseInt(hex[2] + hex[2], 16)
                    b = parseInt(hex[3] + hex[3], 16)
                } else if (hex.length === 7) {
                    r = parseInt(hex.substring(1, 3), 16)
                    g = parseInt(hex.substring(3, 5), 16)
                    b = parseInt(hex.substring(5, 7), 16)
                } else {
                    return null
                }
                r /= 255; g /= 255; b /= 255
                const max = Math.max(r, g, b), min = Math.min(r, g, b)
                let h = 0, s = 0;
                const l = (max + min) / 2
                if (max !== min) {
                    const d = max - min
                    s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
                    switch (max) {
                        case r: h = (g - b) / d + (g < b ? 6 : 0); break
                        case g: h = (b - r) / d + 2; break
                        case b: h = (r - g) / d + 4; break
                    }
                    h /= 6
                }
                // Return as space-separated parts for modern hsl()
                return {
                    h: Math.round(h * 360),
                    s: Math.round(s * 100),
                    l: Math.round(l * 100)
                }
            }

            const cssVars: Record<string, string> = {
                '--background': parsed.background,
                '--foreground': parsed.foreground,
                '--card': parsed.card,
                '--card-foreground': parsed.cardForeground,
                '--muted-foreground': parsed.mutedForeground,
                '--header': parsed.header,
                '--border': parsed.border,
                '--primary': parsed.primary,
                '--ring': parsed.primary, // Ring follows primary
                '--input': parsed.border, // Input follows border
            }

            Object.entries(cssVars).forEach(([key, value]) => {
                if (value) {
                    const parts = hexToHslParts(value)
                    if (parts) {
                        // Use the format expected by shadcn/tailwind config: "h s% l%"
                        const hslValue = `${parts.h} ${parts.s}% ${parts.l}%`
                        root.style.setProperty(key, hslValue)
                    }
                }
            })
        }

        applyColors()

        // Watch for changes
        const handleStorage = (e: StorageEvent) => {
            if (e.key === 'lp-factory-theme-colors') applyColors()
        }

        window.addEventListener('storage', handleStorage)
        window.addEventListener('lp-theme-update', applyColors)

        return () => {
            window.removeEventListener('storage', handleStorage)
            window.removeEventListener('lp-theme-update', applyColors)
        }
    }, [theme])

    return null
}
