import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Session, ActiveSession } from '../models/session.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class SessionService {
  private apiUrl = `${environment.apiUrl}/sessions`;

  constructor(private http: HttpClient) {}

  startSession(data: { socketId: string; device?: string; ip?: string }): Observable<Session> {
    return this.http.post<Session>(`${this.apiUrl}/start`, data);
  }

  getActiveSessions(): Observable<{ sessions: ActiveSession[]; total: number }> {
    return this.http.get<{ sessions: ActiveSession[]; total: number }>(`${this.apiUrl}/active`);
  }

  getAllSessions(params: any = {}): Observable<{ sessions: Session[]; total: number; pages: number }> {
    return this.http.get<{ sessions: Session[]; total: number; pages: number }>(this.apiUrl, { params });
  }

  endSession(id: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/${id}/end`, {});
  }

  terminateSession(id: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/${id}/terminate`, {});
  }
}
