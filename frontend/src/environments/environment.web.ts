export const environment = {
  production: true,
  platform: 'web',
  apiUrl: 'https://api.miso-medisupply.com',
  features: {
    pushNotifications: false,
    biometricAuth: false,
    camera: true,
    geolocation: true,
    fileSystem: false,
    nativeStorage: false,
  },
  capacitorPlugins: {
    statusBar: false,
    splashScreen: false,
    haptics: false,
    keyboard: false,
  },
};
