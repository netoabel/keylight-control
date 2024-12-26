export const keylightConfig = {
  default: {
    host: "elgato-key-light-air-ec6e.local",
    port: 9123,
  },
  temperature: {
    min: 2900,
    max: 7000,
    step: 100,
    default: 7000,
  },
  brightness: {
    min: 0,
    max: 100,
    step: 1,
    default: 50,
  },
  presets: {
    low: 10,
    high: 30,
    warm: 4000,
    cold: 7000,
  },
};
