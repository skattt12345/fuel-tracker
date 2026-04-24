import { Component, Input, Output, EventEmitter } from '@angular/core';
import { VehicleHistoryRecord } from 'src/app/models/vehicle';
import { AuthService } from 'src/app/services/Auth/auth.service';

@Component({
  selector: 'app-history-table',
  templateUrl: './history-table.component.html',
  styleUrls: ['./history-table.component.css'],
})
export class HistoryTableComponent {
  @Input() data: VehicleHistoryRecord[] = [];
  @Input() isGlobal: boolean = false; // Якщо true — показуємо назву авто
  @Input() showActions: boolean = true; // Якщо false — ховаємо кнопки редагування

  @Output() edit = new EventEmitter<VehicleHistoryRecord>();
  @Output() delete = new EventEmitter<VehicleHistoryRecord>();
  // Пагінація
  currentPage = 1;
  pageSize = 10; // Кількість рядків на сторінку

  constructor(public authService: AuthService) {}

  onEdit(row: VehicleHistoryRecord) {
    this.edit.emit(row);
  }

  onDelete(row: VehicleHistoryRecord) {
    this.delete.emit(row);
  }
  // Обчислюємо дані для поточної сторінки
  get paginatedData() {
    const startIndex = (this.currentPage - 1) * this.pageSize;
    return this.data.slice(startIndex, startIndex + this.pageSize);
  }

  // Загальна кількість сторінок
  get totalPages() {
    return Math.ceil(this.data.length / this.pageSize);
  }

  changePage(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
    }
  }
}
