import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { KanbanBoard, KanbanCard } from '../models/kanban.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class KanbanService {
  private apiUrl = `${environment.apiUrl}/kanban`;
  private boardsSubject = new BehaviorSubject<KanbanBoard[]>([]);
  public boards$ = this.boardsSubject.asObservable();

  constructor(private http: HttpClient) {}

  createBoard(title: string, description?: string): Observable<KanbanBoard> {
    return this.http.post<KanbanBoard>(`${this.apiUrl}/boards`, { title, description });
  }

  getBoards(): Observable<KanbanBoard[]> {
    return this.http.get<KanbanBoard[]>(`${this.apiUrl}/boards`);
  }

  getBoardById(id: string): Observable<KanbanBoard> {
    return this.http.get<KanbanBoard>(`${this.apiUrl}/boards/${id}`);
  }

  createCard(boardId: string, title: string, description?: string, column?: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/cards`, {
      boardId,
      title,
      description,
      column: column || 'todo'
    });
  }

  updateCard(cardId: string, data: any): Observable<KanbanCard> {
    return this.http.put<KanbanCard>(`${this.apiUrl}/cards/${cardId}`, data);
  }

  updateCardColumn(boardId: string, cardId: string, column: string): Observable<any> {
    return this.http.put(`${this.apiUrl}/cards/${cardId}`, { column });
  }

  deleteCard(boardId: string, cardId: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/cards/${cardId}`);
  }

  updateAssigneeRole(cardId: string, assigneeId: string, newRole: string): Observable<any> {
    return this.http.put(`${this.apiUrl}/cards/${cardId}/assignee/${assigneeId}/role`, { newRole });
  }

  setBoards(boards: KanbanBoard[]): void {
    this.boardsSubject.next(boards);
  }

  getBoards$(): Observable<KanbanBoard[]> {
    return this.boards$;
  }
}
