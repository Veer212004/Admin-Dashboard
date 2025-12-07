import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NotificationService } from '../../../services/notification.service';
import { Notification } from '../../../models/notification.model';
import { SocketService } from '../../../services/socket.service';

@Component({
  selector: 'app-notifications',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-6">
      <div class="bg-white rounded-lg shadow p-6">
        <h1 class="text-2xl font-bold text-gray-900 mb-4">Notifications</h1>

        <!-- Filters -->
        <div class="flex gap-4 mb-6">
          <button
            (click)="showAll()"
            [class.bg-blue-600]="!unreadOnly"
            [class.bg-gray-400]="unreadOnly"
            class="text-white font-bold py-2 px-4 rounded-lg transition"
          >
            All
          </button>
          <button
            (click)="showUnread()"
            [class.bg-blue-600]="unreadOnly"
            [class.bg-gray-400]="!unreadOnly"
            class="text-white font-bold py-2 px-4 rounded-lg transition"
          >
            Unread
          </button>
        </div>

        <!-- Notifications List -->
        <div class="space-y-2">
          <div *ngFor="let notification of notifications"
               [class.bg-blue-50]="!notification.read"
               [class.bg-gray-50]="notification.read"
               class="p-4 rounded-lg border border-gray-200">
            <div class="flex justify-between items-start">
              <div class="flex-1">
                <h3 class="font-bold text-gray-900">{{ notification.title }}</h3>
                <p class="text-gray-600 text-sm mt-1">{{ notification.message }}</p>
                <p class="text-gray-500 text-xs mt-2">{{ notification.createdAt | date: 'short' }}</p>
              </div>
              <button
                *ngIf="!notification.read"
                (click)="markAsRead(notification._id)"
                class="text-blue-600 hover:text-blue-800 font-bold text-sm ml-4"
              >
                Mark Read
              </button>
            </div>
          </div>

          <div *ngIf="notifications.length === 0" class="text-center py-8 text-gray-600">
            No notifications
          </div>
        </div>

        <!-- Pagination -->
        <div class="mt-6 flex justify-between items-center">
          <span class="text-gray-700">Total: {{ total }} notifications</span>
          <div class="flex gap-2">
            <button
              [disabled]="page === 1"
              (click)="previousPage()"
              class="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50"
            >
              Previous
            </button>
            <span class="px-4 py-2">Page {{ page }} of {{ pages }}</span>
            <button
              [disabled]="page === pages"
              (click)="nextPage()"
              class="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class NotificationsComponent implements OnInit {
  notifications: Notification[] = [];
  total = 0;
  page = 1;
  pages = 1;
  limit = 10;
  unreadOnly = false;

  constructor(
    private notificationService: NotificationService,
    private socketService: SocketService
  ) {}

  ngOnInit(): void {
    this.loadNotifications();
    this.setupRealtime();
  }

  loadNotifications(): void {
    const params = {
      page: this.page,
      limit: this.limit,
      ...(this.unreadOnly && { unreadOnly: true }),
    };

    this.notificationService.getNotifications(params).subscribe({
      next: (response) => {
        this.notifications = response.notifications;
        this.total = response.total;
        this.pages = response.pages;
        this.notificationService.setUnreadCount(response.unreadCount);
      },
    });
  }

  markAsRead(id: string): void {
    this.notificationService.markAsRead(id).subscribe({
      next: () => this.loadNotifications(),
    });
  }

  showAll(): void {
    this.unreadOnly = false;
    this.page = 1;
    this.loadNotifications();
  }

  showUnread(): void {
    this.unreadOnly = true;
    this.page = 1;
    this.loadNotifications();
  }

  previousPage(): void {
    if (this.page > 1) {
      this.page--;
      this.loadNotifications();
    }
  }

  nextPage(): void {
    if (this.page < this.pages) {
      this.page++;
      this.loadNotifications();
    }
  }

  private setupRealtime(): void {
    this.socketService.on<any>('newNotification').subscribe(() => {
      this.loadNotifications();
    });
  }
}
