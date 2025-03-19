import React, { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { LongPressButton } from "@/components/ui/long-press-button"
import { ConfigScreen } from "@/components/config-screen"
import "./App.css"
import { keylightConfig } from "../electron/shared/keylight-config"

declare global {
  interface Window {
    electron?: {
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
  const [showAdditional, setShowAdditional] = useState(false)

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setShowConfig(params.get('config') === 'true');
    
    // Initialize config values from URL params if present
    const host = params.get('host');
    const port = params.get('port');
    if (host) setKeylightHost(host);
    if (port) setKeylightPort(port);
  }, []);

  useEffect(() => {
    if (window.electron) {
      window.electron.onMessage("keylight-state", (state) => {
        if (state.connected) {
          setConnected(true)
          setError(null)
          setIsOn(state.on)
          setBrightness(state.brightness)
          setAutoMode(state.autoMode)
          setTemperature(state.temperature)
          if (state.config) {
            setKeylightHost(state.config.host || "")
            setKeylightPort(state.config.port?.toString() || "")
          }
        } else {
          setConnected(false)
          if (state.error) {
            setError(state.error)
          }
          if (state.config) {
            setKeylightHost(state.config.host || "")
            setKeylightPort(state.config.port?.toString() || "")
          }
        }
      })

      window.electron.sendMessage("keylight-control", { action: "getState" })
    }
  }, [])

  const handleRetry = () => {
    if (window.electron) {
      window.electron.sendMessage("keylight-control", { action: "retry" })
    }
  }

  const handleConfigSave = () => {
    if (window.electron) {
      window.electron.sendMessage("keylight-control", {
        action: "updateConfig",
        config: {
          host: keylightHost,
          port: keylightPort ? parseInt(keylightPort, 10) : undefined,
        },
      })
    }
  }

  const handleShowConfig = () => {
    if (window.electron) {
      window.electron.sendMessage("keylight-control", { action: "showConfig" })
    }
  }

  const handleHideConfig = () => {
    if (window.electron) {
      window.electron.sendMessage("keylight-control", { action: "hideConfig" })
    }
  }

  if (showConfig) {
    return (
      <div className="h-screen flex flex-col">
        <div className="titlebar h-[0px] fixed top-0 left-0 right-0 app-drag bg-[#1C1C1C]/50 backdrop-blur-sm" />
        <div className="flex-1">
          <ConfigScreen
            host={keylightHost}
            port={keylightPort}
            onHostChange={(value: string) => {
              console.log('Host change:', value)
              setKeylightHost(value)
            }}
            onPortChange={(value: string) => {
              console.log('Port change:', value)
              setKeylightPort(value)
            }}
            onSave={handleConfigSave}
            onBack={handleHideConfig}
          />
        </div>
      </div>
    )
  }

  if (!connected) {
    return (
      <div className="h-screen flex flex-col">
        <div className="titlebar h-[0px] fixed top-0 left-0 right-0 app-drag bg-[#1C1C1C]/50 backdrop-blur-sm" />
        <div className="flex-1">
          <Card className="w-[360px] h-full mx-auto bg-[#242424] border-none">
            <CardHeader className="app-drag cursor-move flex flex-row items-start justify-between p-4 pt-6 pb-3 relative">
              <div className="ml-2">
                <CardTitle className="text-white mb-1.5">Keylight Control</CardTitle>
                <CardDescription className="text-gray-400">Could not connect to keylight</CardDescription>
              </div>
            </CardHeader>
            <CardContent className="space-y-4 app-no-drag flex flex-col items-center">
              <Button
                onClick={handleRetry}
                variant="outline"
                className="w-24 bg-[#383A3C] text-white hover:bg-[#383A3C] border-none"
              >
                Try Again
              </Button>
              <button
                onClick={handleShowConfig}
                className="text-xs text-gray-500 bg-transparent border-none cursor-pointer"
              >
                Configure connection
              </button>
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
        enabled: checked,
      })
    }
  }

  const handleBrightnessChange = (value: number[]) => {
    setBrightness(value[0]);
  };

  const handleBrightnessCommit = (value: number[]) => {
    setBrightness(value[0])
    if (window.electron) {
      window.electron.sendMessage("keylight-control", { action: "setBrightness", value: value[0] })
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
      if (window.electron) {
        window.electron.sendMessage("keylight-control", {
          action: "updatePreset",
          preset,
          value: newValue,
        });
        setPresets((prev) => ({
          ...prev,
          [preset]: newValue,
        }));
      }
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
    <div className="h-screen flex flex-col">
      <div className="titlebar h-[0px] fixed top-0 left-0 right-0 app-drag bg-[#1C1C1C]/50 backdrop-blur-sm" />
      <div className="flex-1">
        <Card className="w-[360px] h-full mx-auto bg-[#242424] border-none">
          <CardHeader className="app-drag cursor-move flex flex-row items-start justify-between p-4 pt-6 pb-3 relative">
            <div className="ml-2">
              <CardTitle className="text-white mb-1.5">Keylight Control</CardTitle>
              <CardDescription className="text-gray-400">Manage your keylight settings</CardDescription>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="app-no-drag h-8 w-8 hover:bg-[#383A3C] absolute top-4 right-4"
              onClick={handleShowConfig}
            >
              <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-gray-400">
                <path d="M5.5 3C4.67157 3 4 3.67157 4 4.5C4 5.32843 4.67157 6 5.5 6C6.32843 6 7 5.32843 7 4.5C7 3.67157 6.32843 3 5.5 3ZM3 5C3.01671 5 3.03323 4.99918 3.04952 4.99758C3.28022 6.1399 4.28967 7 5.5 7C6.71033 7 7.71978 6.1399 7.95048 4.99758C7.96677 4.99918 7.98329 5 8 5H13.5C13.7761 5 14 4.77614 14 4.5C14 4.22386 13.7761 4 13.5 4H8C7.98329 4 7.96677 4.00082 7.95048 4.00242C7.71978 2.86009 6.71033 2 5.5 2C4.28967 2 3.28022 2.86009 3.04952 4.00242C3.03323 4.00082 3.01671 4 3 4H1.5C1.22386 4 1 4.22386 1 4.5C1 4.77614 1.22386 5 1.5 5H3ZM11.9505 10.9976C11.7198 12.1399 10.7103 13 9.5 13C8.28967 13 7.28022 12.1399 7.04952 10.9976C7.03323 10.9992 7.01671 11 7 11H1.5C1.22386 11 1 10.7761 1 10.5C1 10.2239 1.22386 10 1.5 10H7C7.01671 10 7.03323 10.0008 7.04952 10.0024C7.28022 8.8601 8.28967 8 9.5 8C10.7103 8 11.7198 8.8601 11.9505 10.0024C11.9668 10.0008 11.9833 10 12 10H13.5C13.7761 10 14 10.2239 14 10.5C14 10.7761 13.7761 11 13.5 11H12C11.9833 11 11.9668 10.9992 11.9505 10.9976ZM8 10.5C8 9.67157 8.67157 9 9.5 9C10.3284 9 11 9.67157 11 10.5C11 11.3284 10.3284 12 9.5 12C8.67157 12 8 11.3284 8 10.5Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path>
              </svg>
            </Button>
          </CardHeader>
          <CardContent className="space-y-4 app-no-drag mt-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Camera Auto-Mode</span>
              <Switch
                checked={autoMode}
                onCheckedChange={handleAutoModeToggle}
              />
            </div>
            <Button
              onClick={handleToggle}
              className={`w-full ${
                isOn 
                  ? "bg-[#E60133] hover:bg-[#E60133]" 
                  : "bg-[#383A3C] hover:bg-[#383A3C]"
              } text-white`}
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
            {showAdditional && (
              <>
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
              </>
            )}
            <div className="space-y-4">
              <Button
                onClick={() => setShowAdditional(!showAdditional)}
                variant="ghost"
                className="w-full text-muted-foreground text-sm hover:text-white hover:bg-transparent active:bg-transparent"
              >
                {showAdditional ? "Hide Additional Settings" : "Show Additional Settings"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
