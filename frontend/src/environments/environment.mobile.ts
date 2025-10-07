export const environment = {
  production: true,
  platform: 'mobile',
  apiUrl: 'https://api.miso-medisupply.com',
  features: {
    pushNotifications: true,
    biometricAuth: true,
    camera: true,
    geolocation: true,
    fileSystem: true,
    nativeStorage: true,
  },
  capacitorPlugins: {
    statusBar: true,
    splashScreen: true,
    haptics: true,
    keyboard: true,
  },
};
