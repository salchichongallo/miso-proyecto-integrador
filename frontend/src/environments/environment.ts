export const environment = {
  production: false,
  apiUrl: process.env['APP_API_URL']!,
  clientMicroserviceUrl: process.env['APP_CLIENT_MICROSERVICE_URL']!,
  vendorMicroserviceUrl: process.env['APP_VENDOR_MICROSERVICE_URL']!,
  providerMicroserviceUrl: process.env['APP_PROVIDER_MICROSERVICE_URL']!,
  productMicroserviceUrl: process.env['APP_PRODUCT_MICROSERVICE_URL']!,
  salesMicroserviceUrl: process.env['APP_SALES_MICROSERVICE_URL']!,
  ordersMicroserviceUrl: process.env['APP_ORDERS_MICROSERVICE_URL']!,
  cognito: {
    userPoolId: process.env['APP_COGNITO_USER_POOL_ID']!,
    userPoolClientId: process.env['APP_COGNITO_USER_POOL_CLIENT_ID']!,
    domain: process.env['APP_COGNITO_DOMAIN']!,
    redirectUrls: process.env['APP_COGNITO_REDIRECT_URLS']!,
  },
};
