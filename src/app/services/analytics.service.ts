import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { AnalyticsSummary, SignupTrend, SessionTrend, ActiveUsersByDay } from '../models/analytics.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class AnalyticsService {
  private apiUrl = `${environment.apiUrl}/analytics`;
  private summarySubject = new BehaviorSubject<AnalyticsSummary | null>(null);
  public summary$ = this.summarySubject.asObservable();

  constructor(private http: HttpClient) {}

  getSummary(): Observable<AnalyticsSummary> {
    return this.http.get<AnalyticsSummary>(`${this.apiUrl}/summary`);
  }

  getSignupTrend(from?: string, to?: string): Observable<{ trend: SignupTrend[] }> {
    const params: any = {};
    if (from) params.from = from;
    if (to) params.to = to;
    return this.http.get<{ trend: SignupTrend[] }>(`${this.apiUrl}/signups`, { params });
  }

  getSessionsTrend(from?: string, to?: string): Observable<{ trend: SessionTrend[] }> {
    const params: any = {};
    if (from) params.from = from;
    if (to) params.to = to;
    return this.http.get<{ trend: SessionTrend[] }>(`${this.apiUrl}/sessions`, { params });
  }

  getActiveUsersByDay(from?: string, to?: string): Observable<{ data: ActiveUsersByDay[] }> {
    const params: any = {};
    if (from) params.from = from;
    if (to) params.to = to;
    return this.http.get<{ data: ActiveUsersByDay[] }>(`${this.apiUrl}/active-users`, { params });
  }

  setSummary(summary: AnalyticsSummary): void {
    this.summarySubject.next(summary);
  }
}
