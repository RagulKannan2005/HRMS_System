import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class Auth {
  private http = inject(HttpClient);

  private apiURL = 'http://localhost:8081/api/v1/auth';

  currentUser = signal<any>(null);

  constructor(private router: Router) {}

  registeradmin(user: any) {
    return this.http.post(this.apiURL + '/register-admin', user);
  }

  login(user: any) {
    return this.http.post(this.apiURL + '/login', user);
  }

  getUser() {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  }

  getUsername() {
    const u = this.getUser();
    return u?.userName || u?.username || null;
  }

  getrole(): String | null {
    const role = this.getUser()?.role;
    return role ? role.toString().toUpperCase() : null;
  }
  isAdmin(): boolean {
    return this.getrole() === 'ADMIN';
  }
  isManager(): boolean {
    return this.getrole() === 'MANAGER';
  }
  isEmployee(): boolean {
    return this.getrole() === 'EMPLOYEE';
  }
  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('user');

    this.currentUser.set(null);

    this.router.navigate(['/login'], {
      replaceUrl: true,
    });
  }
}
