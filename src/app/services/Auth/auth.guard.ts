import { Injectable } from '@angular/core';
import { CanActivate, Router, UrlTree } from '@angular/router';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { Observable } from 'rxjs';
import { map, take } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate {
  constructor(
    private afAuth: AngularFireAuth,
    private router: Router,
  ) {}

  canActivate(): Observable<boolean | UrlTree> {
    return this.afAuth.authState.pipe(
      take(1),
      map((user) => {
        if (user) {
          return true; // Пускаємо до машин
        } else {
          console.log('Guard: Користувача не знайдено, йдемо на логін');
          return this.router.createUrlTree(['/login']);
        }
      }),
    );
  }
}
