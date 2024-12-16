"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = __importStar(require("react"));
const button_1 = require("@/components/ui/button");
const slider_1 = require("@/components/ui/slider");
const card_1 = require("@/components/ui/card");
require("./App.css");
const App = () => {
    const [isOn, setIsOn] = (0, react_1.useState)(false);
    const [brightness, setBrightness] = (0, react_1.useState)(50);
    const handleToggle = () => {
        setIsOn(!isOn);
        if (window.electron) {
            window.electron.sendMessage("keylight-control", { action: isOn ? "turnOff" : "turnOn" });
        }
    };
    const handleBrightnessChange = (value) => {
        setBrightness(value[0]);
        if (window.electron) {
            window.electron.sendMessage("keylight-control", { action: "setBrightness", value: value[0] });
        }
    };
    const handlePresetBrightness = (preset) => {
        const presetValue = preset === "high" ? 100 : 20;
        setBrightness(presetValue);
        if (window.electron) {
            window.electron.sendMessage("keylight-control", { action: "setBrightness", value: presetValue });
        }
    };
    return (<div className="min-h-screen bg-[#1C1C1C]">
      <div className="titlebar h-[0px] fixed top-0 left-0 right-0 app-drag bg-[#1C1C1C]/50 backdrop-blur-sm"/>
      <div className="pt-[0px]">
        <card_1.Card className="w-[360px] mx-auto bg-[#242424]">
          <card_1.CardHeader className="app-drag cursor-move">
            <card_1.CardTitle className="text-white">Keylight Control</card_1.CardTitle>
            <card_1.CardDescription className="text-gray-400">Manage your keylight settings</card_1.CardDescription>
          </card_1.CardHeader>
          <card_1.CardContent className="space-y-4 app-no-drag">
            <button_1.Button onClick={handleToggle} className="w-full bg-[#E60133] hover:bg-buttonRed/90 text-white" variant="default">
              {isOn ? "Turn Off" : "Turn On"}
            </button_1.Button>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Brightness</span>
                <span className="text-sm text-muted-foreground">{brightness}%</span>
              </div>
              <slider_1.Slider value={[brightness]} onValueChange={handleBrightnessChange} max={100} step={1} className="cursor-pointer"/>
            </div>
            <div className="flex justify-between gap-4">
              <button_1.Button onClick={() => handlePresetBrightness("low")} variant="outline" className="flex-1 bg-[#383A3C] text-white hover:bg-[#383A3C] border-none">
                Low
              </button_1.Button>
              <button_1.Button onClick={() => handlePresetBrightness("high")} variant="outline" className="flex-1 bg-[#383A3C] text-white hover:bg-[#383A3C] border-none">
                High
              </button_1.Button>
            </div>
          </card_1.CardContent>
        </card_1.Card>
      </div>
    </div>);
};
exports.default = App;
