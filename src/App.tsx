import React, { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { LongPressButton } from "@/components/ui/long-press-button"
import "./App.css"

declare global {
  interface Window {
    electron: {
      sendMessage: (channel: string, args: any) => void
      onMessage: (channel: string, callback: (args: any) => void) => void
    }
  }
}

export function App() {
  const [isOn, setIsOn] = useState(false)
  const [brightness, setBrightness] = useState(50)
  const [autoMode, setAutoMode] = useState(false)
  const [connected, setConnected] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [presets, setPresets] = useState({ low: 10, high: 30 })

  useEffect(() => {
    if (window.electron) {
      window.electron.onMessage("keylight-state", (state) => {
        if (state.connected) {
          setConnected(true)
          setError(null)
          setIsOn(state.on)
          setBrightness(state.brightness)
          setAutoMode(state.autoMode)
          setPresets(state.presets)
        } else {
          setConnected(false)
          setError(state.error)
        }
      })

      window.electron.sendMessage("keylight-control", { action: "getState" })
    }
  }, [])

  const handleRetry = () => {
    window.electron.sendMessage("keylight-control", { action: "retry" })
  }

  if (!connected) {
    return (
      <div className="min-h-screen bg-black flex items-center">
        <div className="titlebar h-[0px] fixed top-0 left-0 right-0 app-drag bg-black/50 backdrop-blur-sm" />
        <div className="w-full">
          <Card className="w-[360px] mx-auto bg-black border-none">
            <CardHeader className="app-drag cursor-move">
              <CardTitle className="text-white text-center text-2xl font-normal">
                Could not connect to keylight
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 app-no-drag flex flex-col items-center">
              <Button
                onClick={handleRetry}
                variant="outline"
                className="w-24 bg-[#383A3C] text-white hover:bg-[#383A3C] border-none"
              >
                Try Again
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  const handleToggle = () => {
    setIsOn(!isOn)
    if (window.electron) {
      window.electron.sendMessage("keylight-control", { action: isOn ? "turnOff" : "turnOn" })
    }
  }

  const handleAutoModeToggle = (checked: boolean) => {
    setAutoMode(checked)
    if (window.electron) {
      window.electron.sendMessage("keylight-control", { 
        action: "setAutoMode", 
        enabled: checked 
      })
    }
  }

  const handleBrightnessChange = (value: number[]) => {
    setBrightness(value[0])
    if (window.electron) {
      window.electron.sendMessage("keylight-control", { action: "setBrightness", value: value[0] })
    }
  }

  const handlePresetBrightness = (preset: "high" | "low") => {
    const presetValue = presets[preset]
    setBrightness(presetValue)
    if (window.electron) {
      window.electron.sendMessage("keylight-control", { action: "setBrightness", value: presetValue })
    }
  }

  const handlePresetUpdate = (preset: "high" | "low") => {
    const newValue = brightness;
    if (
      (preset === "high" && newValue > presets.low) ||
      (preset === "low" && newValue < presets.high)
    ) {
      window.electron.sendMessage("keylight-control", {
        action: "updatePreset",
        preset,
        value: newValue,
      });
    }
  };

  return (
    <div className="min-h-screen bg-[#1C1C1C]">
      <div className="titlebar h-[0px] fixed top-0 left-0 right-0 app-drag bg-[#1C1C1C]/50 backdrop-blur-sm" />
      <div className="pt-[0px]">
        <Card className="w-[360px] mx-auto bg-[#242424]">
          <CardHeader className="app-drag cursor-move">
            <CardTitle className="text-white">Keylight Control</CardTitle>
            <CardDescription className="text-gray-400">Manage your keylight settings</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 app-no-drag">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Camera Auto-Mode</span>
              <Switch
                checked={autoMode}
                onCheckedChange={handleAutoModeToggle}
              />
            </div>
            <Button
              onClick={handleToggle}
              className="w-full bg-[#E60133] hover:bg-buttonRed/90 text-white"
              variant="default"
            >
              {isOn ? "Turn Off" : "Turn On"}
            </Button>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Brightness</span>
                <span className="text-sm text-muted-foreground">{brightness}%</span>
              </div>
              <Slider
                value={[brightness]}
                onValueChange={handleBrightnessChange}
                max={100}
                step={1}
                className="cursor-pointer"
              />
            </div>
            <div className="flex justify-between gap-4">
              <LongPressButton
                onClick={() => handlePresetBrightness("low")}
                onLongPress={() => handlePresetUpdate("low")}
                variant="outline"
                className="w-[156px] bg-[#383A3C] text-white hover:bg-[#383A3C] border-none"
              >
                Low
              </LongPressButton>
              <LongPressButton
                onClick={() => handlePresetBrightness("high")}
                onLongPress={() => handlePresetUpdate("high")}
                variant="outline"
                className="w-[156px] bg-[#383A3C] text-white hover:bg-[#383A3C] border-none"
              >
                High
              </LongPressButton>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

