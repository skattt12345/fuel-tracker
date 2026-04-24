import { inject, Injectable, NgZone } from '@angular/core';
import {
  Auth,
  authState,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  User,
} from '@angular/fire/auth';
import {
  Firestore,
  doc,
  setDoc,
  getDoc,
  docData,
} from '@angular/fire/firestore';
import { Router } from '@angular/router';
import { firstValueFrom, Observable, of } from 'rxjs';
import { switchMap, map, shareReplay, take } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  // Потік стану користувача
  user$: Observable<User | null>;
  isAdmin$: Observable<boolean>;
  private auth = inject(Auth);

  constructor(
    private firestore: Firestore,
    private router: Router,
    private ngZone: NgZone,
  ) {
    // Для версії 7.6 використовуємо authState(this.auth)
    this.user$ = authState(this.auth);
    this.isAdmin$ = this.userRole$.pipe(
      map((role) => role === 'admin'),
      shareReplay(1),
    );
  }

  // Отримання ролі користувача (Observable)
  get userRole$(): Observable<string | null> {
    return this.user$.pipe(
      switchMap((user) => {
        if (!user) return of(null);
        const userDocRef = doc(this.firestore, `users/${user.uid}`);
        // docData автоматично стежить за змінами в базі
        return docData(userDocRef).pipe(
          map((userData: any) => userData?.role || 'driver'),
        );
      }),
    );
  }

  async loginWithGoogle() {
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(this.auth, provider);
      const user = result.user;

      // Перевіряємо, чи є користувач у базі
      const userDocRef = doc(this.firestore, `users/${user.uid}`);
      const userSnap = await getDoc(userDocRef);

      if (!userSnap.exists()) {
        await setDoc(userDocRef, {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
          role: 'driver', // за замовчуванням
          createdAt: new Date(),
        });
      }

      this.ngZone.run(() => {
        this.router.navigate(['/']);
      });

      return user;
    } catch (error) {
      console.error('Помилка авторизації:', error);
      return null;
    }
  }

  async logout() {
    try {
      await signOut(this.auth);
      this.ngZone.run(() => {
        this.router.navigate(['/login']);
      });
    } catch (error) {
      console.error('Помилка виходу:', error);
    }
  }
  async getUserData() {
    // Чекаємо, поки Firebase ініціалізується і віддасть юзера
    const user = await firstValueFrom(this.user$.pipe(take(1)));
    return {
      uid: user?.uid || null,
      name:
        user?.displayName || user?.email?.split('@')[0] || 'Невідомий водій',
    };
  }
  getCurrentUserName(): string {
    const user = this.auth.currentUser;
    return user?.displayName || user?.email || 'Невідомий водій';
  }
}
