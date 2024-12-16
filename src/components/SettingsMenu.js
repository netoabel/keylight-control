"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = __importDefault(require("react"));
const button_1 = require("@/components/ui/button");
const dropdown_menu_1 = require("@/components/ui/dropdown-menu");
const react_icons_1 = require("@radix-ui/react-icons");
const next_themes_1 = require("next-themes");
const SettingsMenu = () => {
    const { theme, setTheme } = (0, next_themes_1.useTheme)();
    return (<dropdown_menu_1.DropdownMenu>
      <dropdown_menu_1.DropdownMenuTrigger asChild>
        <button_1.Button variant="ghost" size="icon" className="app-no-drag">
          <span className="sr-only">Open settings</span>
          <span>⚙️</span>
        </button_1.Button>
      </dropdown_menu_1.DropdownMenuTrigger>
      <dropdown_menu_1.DropdownMenuContent align="end">
        <dropdown_menu_1.DropdownMenuItem onClick={() => setTheme("light")}>
          <react_icons_1.SunIcon className="mr-2 h-4 w-4"/>
          Light Mode
        </dropdown_menu_1.DropdownMenuItem>
        <dropdown_menu_1.DropdownMenuItem onClick={() => setTheme("dark")}>
          <react_icons_1.MoonIcon className="mr-2 h-4 w-4"/>
          Dark Mode
        </dropdown_menu_1.DropdownMenuItem>
        <dropdown_menu_1.DropdownMenuItem onClick={() => setTheme("system")}>
          System Default
        </dropdown_menu_1.DropdownMenuItem>
      </dropdown_menu_1.DropdownMenuContent>
    </dropdown_menu_1.DropdownMenu>);
};
exports.default = SettingsMenu;
