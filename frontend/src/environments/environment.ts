export const environment = {
  production: false,
  apiUrl: process.env['APP_API_URL']!,
  vendorMicroserviceUrl: process.env['APP_VENDOR_MICROSERVICE_URL']!,
  cognito: {
    userPoolId: process.env['APP_COGNITO_USER_POOL_ID']!,
    userPoolClientId: process.env['APP_COGNITO_USER_POOL_CLIENT_ID']!,
    domain: process.env['APP_COGNITO_DOMAIN']!,
    redirectUrls: process.env['APP_COGNITO_REDIRECT_URLS']!,
  },
};
