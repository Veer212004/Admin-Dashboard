import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { Notification, NotificationResponse } from '../models/notification.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class NotificationService {
  private apiUrl = `${environment.apiUrl}/notifications`;
  private notificationsSubject = new BehaviorSubject<Notification[]>([]);
  public notifications$ = this.notificationsSubject.asObservable();
  private unreadCountSubject = new BehaviorSubject<number>(0);
  public unreadCount$ = this.unreadCountSubject.asObservable();

  constructor(private http: HttpClient) {}

  getNotifications(params: any = {}): Observable<NotificationResponse> {
    return this.http.get<NotificationResponse>(this.apiUrl, { params });
  }

  markAsRead(id: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/mark-read/${id}`, {});
  }

  sendNotification(data: { userId: string; title: string; message: string }): Observable<any> {
    return this.http.post(`${this.apiUrl}/send`, data);
  }

  broadcastMessage(data: { title: string; message: string; filter?: any }): Observable<any> {
    return this.http.post(`${this.apiUrl}/broadcast`, data);
  }

  getUnreadCount(): Observable<{ unreadCount: number }> {
    return this.http.get<{ unreadCount: number }>(`${this.apiUrl}/unread-count`);
  }

  setNotifications(notifications: Notification[]): void {
    this.notificationsSubject.next(notifications);
  }

  addNotification(notification: Notification): void {
    const current = this.notificationsSubject.value;
    this.notificationsSubject.next([notification, ...current]);
  }

  setUnreadCount(count: number): void {
    this.unreadCountSubject.next(count);
  }

  getUnreadCountValue(): number {
    return this.unreadCountSubject.value;
  }
}
