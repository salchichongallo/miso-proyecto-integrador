export const environment = {
  production: false,
  platform: 'web',
  apiUrl: 'http://localhost:3000',
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
