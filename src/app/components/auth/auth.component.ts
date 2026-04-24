import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { take } from 'rxjs/operators';
import { AuthService } from 'src/app/services/Auth/auth.service';

@Component({
  selector: 'app-auth',
  templateUrl: './auth.component.html',
  styleUrls: ['./auth.component.css'],
})
export class AuthComponent implements OnInit {
  constructor(
    public authService: AuthService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.authService.user$.pipe(take(1)).subscribe((user) => {
      if (user) {
        this.router.navigate(['/']);
      }
    });
  }

  async login() {
    try {
      await this.authService.loginWithGoogle();
      // Після успішного входу примусово йдемо на головну
      this.router.navigate(['/']);
    } catch (error) {
      console.error('Помилка при вході:', error);
    }
  }
}
