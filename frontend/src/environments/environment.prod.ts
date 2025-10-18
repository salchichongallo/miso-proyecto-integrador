export const environment = {
  production: true,
  apiUrl: '#{APP_API_URL}#',
  clientMicroserviceUrl: '#{APP_CLIENT_MICROSERVICE_URL}#',
  vendorMicroserviceUrl: '#{APP_VENDOR_MICROSERVICE_URL}#',
  cognito: {
    userPoolId: '#{APP_COGNITO_USER_POOL_ID}#',
    userPoolClientId: '#{APP_COGNITO_USER_POOL_CLIENT_ID}#',
    domain: '#{APP_COGNITO_DOMAIN}#',
    redirectUrls: '#{APP_COGNITO_REDIRECT_URLS}#',
  },
};
