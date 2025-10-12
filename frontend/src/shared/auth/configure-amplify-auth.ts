import { Amplify } from 'aws-amplify';
import { environment } from '@env/environment';

export const configureAmplifyAuth = () =>
  Amplify.configure({
    Auth: {
      Cognito: {
        userPoolId: environment.cognito.userPoolId,
        userPoolClientId: environment.cognito.userPoolClientId,
        signUpVerificationMethod: 'code',
        loginWith: {
          oauth: {
            domain: environment.cognito.domain,
            scopes: ['email', 'profile', 'openid', 'aws.cognito.signin.user.admin'],
            redirectSignIn: environment.cognito.redirectUrls.split(','),
            redirectSignOut: environment.cognito.redirectUrls.split(','),
            responseType: 'code',
          },
        },
      },
    },
  });
