import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UserProfileService {

  getUserProfile(userId: number): Observable<any> {

    return of({
      profileImageUrl: ''
    });

  }
}