import {
  ApplicationConfig,
  provideBrowserGlobalErrorListeners
} from '@angular/core';

import { provideRouter } from '@angular/router';

import { routes } from './app.routes';

import {
  IPublicClientApplication,
  PublicClientApplication,
  BrowserCacheLocation,
  InteractionType
} from '@azure/msal-browser';

import {
  MsalService,
  MsalGuard,
  MsalBroadcastService,
  MSAL_INSTANCE,
  MSAL_GUARD_CONFIG,
  MsalGuardConfiguration
} from '@azure/msal-angular';

export const b2cPolicies = {
  authorities: {
    signUpSignIn: {
      authority:
        'https://YOURTENANT.b2clogin.com/YOURTENANT.onmicrosoft.com/B2C_1_signup_signin'
    },
    editProfile: {
      authority:
        'https://YOURTENANT.b2clogin.com/YOURTENANT.onmicrosoft.com/B2C_1_edit_profile'
    }
  }
};

export function MSALInstanceFactory(): IPublicClientApplication {
  return new PublicClientApplication({
    auth: {
      clientId: 'YOUR_CLIENT_ID',
      authority: b2cPolicies.authorities.signUpSignIn.authority,
      redirectUri: '/'
    },
    cache: {
      cacheLocation: BrowserCacheLocation.LocalStorage
    }
  });
}

export function MSALGuardConfigFactory(): MsalGuardConfiguration {
  return {
    interactionType: InteractionType.Redirect,
    authRequest: {
      scopes: ['openid', 'profile']
    }
  };
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),

    {
      provide: MSAL_INSTANCE,
      useFactory: MSALInstanceFactory
    },
    {
      provide: MSAL_GUARD_CONFIG,
      useFactory: MSALGuardConfigFactory
    },

    MsalService,
    MsalGuard,
    MsalBroadcastService
  ]
};