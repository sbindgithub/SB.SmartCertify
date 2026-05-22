import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';

import { Subject, filter, takeUntil } from 'rxjs';

import {
  MSAL_GUARD_CONFIG,
  MsalBroadcastService,
  MsalGuardConfiguration,
  MsalService,
} from '@azure/msal-angular';

import {
  AuthenticationResult,
  EventMessage,
  EventType,
  InteractionStatus,
  InteractionType,
  PopupRequest,
  RedirectRequest,
} from '@azure/msal-browser';

import { Claim } from '../../models/claim';
import { LoginService } from '../../services/login.service';
import { UserProfileService } from '../../services/user-profile.service';
import { b2cPolicies } from '../../app.config';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css',
})
export class HeaderComponent {
  isIframe = false;
  loginDisplay = false;
  isAdmin = false;

  private readonly _destroying$ = new Subject<void>();

  claims: Claim[] = [];
  profilePictureUrl = '';

  constructor(
    @Inject(MSAL_GUARD_CONFIG)
    private msalGuardConfig: MsalGuardConfiguration,

    private authService: MsalService,
    private msalBroadcastService: MsalBroadcastService,
    private loginService: LoginService,
    private router: Router,
    private userService: UserProfileService
  ) {}

  ngOnInit(): void {
    this.loginService.claims$.subscribe((s: Claim[]) => {
      const roles = s.filter(
        (f: Claim) => f.claim === 'extension_userRoles'
      );

      this.getUserInfo();

      setInterval(() => {
        this.getUserInfo();
      }, 30000);

      if (roles.length && !this.isAdmin) {
        this.isAdmin =
          roles[0].value
            .split(',')
            .filter((f: string) => f === 'Admin').length > 0;
      }
    });

    this.authService
      .handleRedirectObservable()
      .subscribe((result: AuthenticationResult | null) => {
        if (result) {
          const redirectStartPage =
            localStorage.getItem('redirectStartPage');

          if (redirectStartPage) {
            this.router.navigate([redirectStartPage]);

            localStorage.removeItem('redirectStartPage');
          }
        }
      });

    this.isIframe = window !== window.parent && !window.opener;

    this.setLoginDisplay();

    this.msalBroadcastService.msalSubject$
      .pipe(
        filter(
          (msg: EventMessage) =>
            msg.eventType === EventType.LOGIN_SUCCESS
        )
      )
      .subscribe(() => {
        if (this.authService.instance.getAllAccounts().length === 0) {
          window.location.pathname = '/';
        } else {
          this.setLoginDisplay();
        }
      });

    this.loginService.claims$.subscribe((c: Claim[]) => {
      this.claims = c;
    });

    this.msalBroadcastService.inProgress$
      .pipe(
        filter(
          (status: InteractionStatus) =>
            status === InteractionStatus.None
        ),
        takeUntil(this._destroying$)
      )
      .subscribe(() => {
        this.setLoginDisplay();

        this.checkAndSetActiveAccount();
      });
  }

  setLoginDisplay(): void {
    this.loginDisplay =
      this.authService.instance.getAllAccounts().length > 0;
  }

  checkAndSetActiveAccount(): void {
    let activeAccount =
      this.authService.instance.getActiveAccount();

    if (
      !activeAccount &&
      this.authService.instance.getAllAccounts().length > 0
    ) {
      let accounts =
        this.authService.instance.getAllAccounts();

      this.authService.instance.setActiveAccount(accounts[0]);
    }
  }

  loginRedirect(): void {
    if (this.msalGuardConfig.authRequest) {
      this.authService.loginRedirect({
        ...this.msalGuardConfig.authRequest,
      } as RedirectRequest);
    } else {
      this.authService.loginRedirect();
    }
  }

  loginPopup(): void {
    if (this.msalGuardConfig.authRequest) {
      this.authService
        .loginPopup({
          ...this.msalGuardConfig.authRequest,
        } as PopupRequest)
        .subscribe((response: AuthenticationResult) => {
          this.authService.instance.setActiveAccount(
            response.account
          );
        });
    } else {
      this.authService
        .loginPopup()
        .subscribe((response: AuthenticationResult) => {
          this.authService.instance.setActiveAccount(
            response.account
          );
        });
    }
  }

  logout(popup?: boolean): void {
    if (popup) {
      this.authService.logoutPopup({
        mainWindowRedirectUri: '/',
      });
    } else {
      this.authService.logoutRedirect();
    }
  }

  editProfile(): void {
    let editProfileFlowRequest:
      | RedirectRequest
      | PopupRequest = {
      authority:
        b2cPolicies.authorities.editProfile.authority,
      scopes: [],
    };

    this.login(editProfileFlowRequest);
  }

  login(
    userFlowRequest?: RedirectRequest | PopupRequest
  ): void {
    if (
      this.msalGuardConfig.interactionType ===
      InteractionType.Popup
    ) {
      if (this.msalGuardConfig.authRequest) {
        this.authService
          .loginPopup({
            ...this.msalGuardConfig.authRequest,
            ...userFlowRequest,
          } as PopupRequest)
          .subscribe((response: AuthenticationResult) => {
            this.authService.instance.setActiveAccount(
              response.account
            );
          });
      } else {
        this.authService
          .loginPopup(userFlowRequest)
          .subscribe((response: AuthenticationResult) => {
            this.authService.instance.setActiveAccount(
              response.account
            );
          });
      }
    } else {
      if (this.msalGuardConfig.authRequest) {
        this.authService.loginRedirect({
          ...this.msalGuardConfig.authRequest,
          ...userFlowRequest,
        } as RedirectRequest);
      } else {
        this.authService.loginRedirect(userFlowRequest);
      }
    }
  }

  ngOnDestroy(): void {
    this._destroying$.next(undefined);

    this._destroying$.complete();
  }

  getUserInfo(): void {
    if (
      this.loginService.userId &&
      this.loginService.userId > 0
    ) {
      this.userService
        .getUserProfile(this.loginService.userId)
        .subscribe((s: any) => {
          this.profilePictureUrl =
            s.profileImageUrl || '';
        });
    }
  }
}