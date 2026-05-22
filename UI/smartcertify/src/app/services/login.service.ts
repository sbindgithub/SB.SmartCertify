import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Claim } from '../models/claim';

@Injectable({
  providedIn: 'root'
})
export class LoginService {

  userId = 1;

  claims$ = new BehaviorSubject<Claim[]>([]);
}