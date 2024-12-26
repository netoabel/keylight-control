import React, { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { LongPressButton } from "@/components/ui/long-press-button"
import "./App.css"
import { keylightConfig } from "../electron/shared/keylight-config"

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
  const [brightness, setBrightness] = useState(keylightConfig.brightness.default)
  const [autoMode, setAutoMode] = useState(false)
  const [connected, setConnected] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [presets, setPresets] = useState(keylightConfig.presets)
  const [showConfig, setShowConfig] = useState(false)
  const [keylightHost, setKeylightHost] = useState("")
  const [keylightPort, setKeylightPort] = useState("")
  const [temperature, setTemperature] = useState(keylightConfig.temperature.default)

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
          setKeylightHost(state.config.host)
          setKeylightPort(state.config.port.toString())
          setTemperature(state.temperature)
        } else {
          setConnected(false)
          setError(state.error)
          setKeylightHost(state.config.host)
          setKeylightPort(state.config.port.toString())
        }
      })

      window.electron.sendMessage("keylight-control", { action: "getState" })
    }
  }, [])

  const handleRetry = () => {
    window.electron.sendMessage("keylight-control", { action: "retry" })
  }

  const handleConfigSave = () => {
    window.electron.sendMessage("keylight-control", { 
      action: "updateConfig", 
      config: {
        host: keylightHost,
        port: parseInt(keylightPort, 10)
      }
    });
    setShowConfig(false);
  };

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
              
              {!showConfig ? (
                <button
                  onClick={() => setShowConfig(true)}
                  className="text-xs text-gray-500 bg-transparent border-none cursor-pointer"
                >
                  Configure connection
                </button>
              ) : (
                <div className="space-y-4 w-full">
                  <div className="flex gap-4">
                    <div className="space-y-2 flex-1">
                      <label className="text-xs text-gray-500">Host</label>
                      <input
                        type="text"
                        value={keylightHost}
                        onChange={(e) => setKeylightHost(e.target.value)}
                        className="w-full bg-[#383A3C] text-white border-none rounded-md px-3 py-2 text-sm"
                      />
                    </div>
                    <div className="space-y-2 w-[4.5rem]">
                      <label className="text-xs text-gray-500">Port</label>
                      <input
                        type="number"
                        value={keylightPort}
                        onChange={(e) => setKeylightPort(e.target.value)}
                        className="w-full bg-[#383A3C] text-white border-none rounded-md px-3 py-2 text-sm"
                      />
                    </div>
                  </div>
                  <Button
                    onClick={handleConfigSave}
                    variant="outline"
                    className="w-full bg-[#383A3C] text-white hover:bg-[#383A3C] border-none mt-4"
                  >
                    Save
                  </Button>
                </div>
              )}
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
    setBrightness(value[0]);
  };

  const handleBrightnessCommit = (value: number[]) => {
    setBrightness(value[0]);
    if (window.electron) {
      window.electron.sendMessage("keylight-control", { action: "setBrightness", value: value[0] });
    }
  };

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

  const handleTemperatureChange = (value: number[]) => {
    setTemperature(value[0]);
  };

  const handleTemperatureCommit = (value: number[]) => {
    setTemperature(value[0]);
    if (window.electron) {
      window.electron.sendMessage("keylight-control", { 
        action: "setTemperature", 
        value: value[0]
      });
    }
  };

  const handleTemperaturePreset = (preset: "warm" | "cold") => {
    const presetValue = presets[preset];
    if (window.electron && presetValue !== undefined) {
      setTemperature(presetValue);
      window.electron.sendMessage("keylight-control", { 
        action: "setTemperature", 
        value: presetValue 
      });
    }
  };

  const handleTemperaturePresetUpdate = (preset: "warm" | "cold") => {
    const newValue = temperature;
    if (window.electron) {
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
                onValueCommit={handleBrightnessCommit}
                min={keylightConfig.brightness.min}
                max={keylightConfig.brightness.max}
                step={keylightConfig.brightness.step}
                className="cursor-pointer"
              />
            </div>
            <div className="flex justify-between gap-2">
              <LongPressButton
                onClick={() => handlePresetBrightness("low")}
                onLongPress={() => handlePresetUpdate("low")}
                variant="outline"
                className="w-[150px] bg-[#383A3C] text-white hover:bg-[#383A3C] hover:text-white border-none"
              >
                Low
              </LongPressButton>
              <LongPressButton
                onClick={() => handlePresetBrightness("high")}
                onLongPress={() => handlePresetUpdate("high")}
                variant="outline"
                className="w-[150px] bg-[#383A3C] text-white hover:bg-[#383A3C] hover:text-white border-none"
              >
                High
              </LongPressButton>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Temperature</span>
                <span className="text-sm text-muted-foreground">{temperature}K</span>
              </div>
              <Slider
                value={[temperature]}
                onValueChange={handleTemperatureChange}
                onValueCommit={handleTemperatureCommit}
                min={keylightConfig.temperature.min}
                max={keylightConfig.temperature.max}
                step={keylightConfig.temperature.step}
                className="cursor-pointer"
              />
            </div>
            <div className="flex justify-between gap-2">
              <LongPressButton
                onClick={() => handleTemperaturePreset("warm")}
                onLongPress={() => handleTemperaturePresetUpdate("warm")}
                variant="outline"
                className="w-[150px] bg-[#383A3C] text-white hover:bg-[#383A3C] hover:text-white border-none"
              >
                Warm
              </LongPressButton>
              <LongPressButton
                onClick={() => handleTemperaturePreset("cold")}
                onLongPress={() => handleTemperaturePresetUpdate("cold")}
                variant="outline"
                className="w-[150px] bg-[#383A3C] text-white hover:bg-[#383A3C] hover:text-white border-none"
              >
                Cold
              </LongPressButton>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

