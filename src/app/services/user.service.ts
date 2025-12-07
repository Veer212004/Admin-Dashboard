import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { User, UserSettings } from '../models/auth.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private apiUrl = `${environment.apiUrl}/users`;

  constructor(private http: HttpClient) {}

  getUsers(params: any = {}): Observable<{ users: User[]; total: number; pages: number }> {
    return this.http.get<{ users: User[]; total: number; pages: number }>(this.apiUrl, { params });
  }

  getUserById(id: string): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/${id}`);
  }

  updateUser(id: string, data: Partial<User>): Observable<User> {
    return this.http.put<User>(`${this.apiUrl}/${id}`, data);
  }

  changeUserRole(id: string, role: 'user' | 'admin'): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}/role`, { role });
  }

  deleteUser(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  updateSettings(settings: UserSettings): Observable<any> {
    return this.http.put(`${this.apiUrl}/settings/update`, { settings });
  }
}
