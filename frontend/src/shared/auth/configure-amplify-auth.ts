import { Amplify } from 'aws-amplify';
import { environment } from '@env/environment';
import { MEDIA_BUCKET_ALIAS } from '../constants/storage.constant';

export const configureAmplifyAuth = () =>
  Amplify.configure({
    Storage: {
      S3: {
        buckets: {
          [MEDIA_BUCKET_ALIAS]: {
            bucketName: environment.storageMedia.bucket,
            region: environment.storageMedia.region,
          },
        },
      },
    },
    Auth: {
      Cognito: {
        userPoolId: environment.cognito.userPoolId,
        userPoolClientId: environment.cognito.userPoolClientId,
        identityPoolId: environment.cognito.identityPoolId,
        signUpVerificationMethod: 'code',
        loginWith: {
          oauth: {
            domain: environment.cognito.domain,
            scopes: ['email', 'profile', 'openid'],
            redirectSignIn: environment.cognito.redirectUrls.split(','),
            redirectSignOut: environment.cognito.redirectUrls.split(','),
            responseType: 'code',
          },
        },
      },
    },
  });
