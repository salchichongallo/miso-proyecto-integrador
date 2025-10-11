import { Amplify } from 'aws-amplify';

// TODO: use env variables
export const configureAmplifyAuth = () =>
  Amplify.configure({
    Auth: {
      Cognito: {
        userPoolId: 'us-east-1_5qbB9vEPR',
        userPoolClientId: '5q1jki11ejiegqhmi0c6rl53lp',
        signUpVerificationMethod: 'code',
        loginWith: {
          oauth: {
            domain: 'https://us-east-15qbb9vepr.auth.us-east-1.amazoncognito.com',
            scopes: ['email', 'profile', 'openid', 'aws.cognito.signin.user.admin', 'custom:role'],
            redirectSignIn: ['http://localhost:4200/'],
            redirectSignOut: ['http://localhost:4200/'],
            responseType: 'code',
          },
        },
      },
    },
  });
