import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ChevronLeft } from "lucide-react"

interface ConfigScreenProps {
  host: string
  port: string
  onHostChange: (value: string) => void
  onPortChange: (value: string) => void
  onSave: () => void
  onBack: () => void
}

export function ConfigScreen({
  host,
  port,
  onHostChange,
  onPortChange,
  onSave,
  onBack,
}: ConfigScreenProps) {
  return (
    <Card className="w-[360px] h-full mx-auto bg-[#242424] border-none">
      <div className="app-drag">
        <CardHeader className="cursor-move flex flex-row items-center justify-between p-4 pt-6 pb-3 relative">
          <Button
            variant="ghost"
            size="icon"
            className="app-no-drag h-8 w-8 hover:bg-[#383A3C] absolute left-4 top-4 z-10"
            onClick={onBack}
          >
            <ChevronLeft className="h-4 w-4 text-gray-400" />
          </Button>
          <div className="flex-1 text-center">
            <CardTitle className="text-white mb-1.5">Connection Settings</CardTitle>
          </div>
        </CardHeader>
      </div>
      <div className="app-no-drag">
        <CardContent className="space-y-4 p-6">
          <div className="space-y-4 w-full">
            <div className="flex gap-4">
              <div className="space-y-2 flex-1">
                <label className="text-xs text-gray-500">Host</label>
                <input
                  type="text"
                  value={host}
                  onChange={(e) => onHostChange(e.target.value)}
                  className="w-full bg-[#383A3C] text-white border-none rounded-md px-3 py-2 text-sm"
                />
              </div>
              <div className="space-y-2 w-[4.5rem]">
                <label className="text-xs text-gray-500">Port</label>
                <input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  value={port}
                  onChange={(e) => onPortChange(e.target.value)}
                  className="w-full bg-[#383A3C] text-white border-none rounded-md px-3 py-2 text-sm"
                />
              </div>
            </div>
            <Button
              onClick={onSave}
              variant="outline"
              className="w-full bg-[#383A3C] text-white hover:text-white hover:bg-[#4A4C4E] border-none mt-4"
            >
              Save
            </Button>
          </div>
        </CardContent>
      </div>
    </Card>
  )
}
