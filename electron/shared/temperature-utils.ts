export const temperatureUtils = {
  toKelvin: (deviceValue: number) => {
    return Math.round(7000 - ((deviceValue - 143) * (7000 - 2900)) / (344 - 143));
  },
  toDeviceValue: (kelvin: number) => {
    return Math.round(143 + ((7000 - kelvin) * (344 - 143)) / (7000 - 2900));
  },
};
