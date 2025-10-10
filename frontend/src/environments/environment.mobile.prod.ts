export const environment = {
  production: true,
  platform: 'development',
  apiUrl: 'http://localhost:3000',
  features: {
    pushNotifications: false,
    biometricAuth: false,
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
