import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ActivityResponse } from '../models/activity.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class ActivityService {
  private apiUrl = `${environment.apiUrl}/activity`;

  constructor(private http: HttpClient) {}

  getActivityLog(params: any = {}): Observable<ActivityResponse> {
    return this.http.get<ActivityResponse>(this.apiUrl, { params });
  }

  getUserActivity(userId: string, params: any = {}): Observable<ActivityResponse> {
    return this.http.get<ActivityResponse>(`${this.apiUrl}/user/${userId}`, { params });
  }

  getActivityStats(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/stats`);
  }
}
