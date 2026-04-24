import { Component, OnInit, OnDestroy } from '@angular/core';
import { VehicleService } from 'src/app/services/vehicle.service';
import { VehicleHistoryRecord } from 'src/app/models/vehicle';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-vehicle-all-history',
  templateUrl: './vehicle-all-history.component.html',
  styleUrls: ['./vehicle-all-history.component.css'],
})
export class VehicleAllHistoryComponent implements OnInit, OnDestroy {
  allRecords: VehicleHistoryRecord[] = []; // Всі записи з бази
  filteredRecords: VehicleHistoryRecord[] = []; // Тільки ті, що пройшли фільтр
  private subscription: Subscription = new Subscription();

  // Змінні для фільтрації
  startDate: string = '';
  endDate: string = '';
  sortAscending = false;

  // Змінні для блоків статистики
  totalDistance = 0;
  totalFuelUsed = 0;
  totalDP = 0;
  totalA95 = 0;
  totalFuelUsedDP = 0;
  totalFuelUsedA95 = 0;
  totalSheetsCount = 0;

  constructor(private vehicleService: VehicleService) {}

  ngOnInit(): void {
    this.subscription = this.vehicleService
      .getVehicles()
      .subscribe((vehicles) => {
        let all: VehicleHistoryRecord[] = [];

        vehicles.forEach((vehicle) => {
          if (vehicle.history) {
            const historyArray = Object.keys(vehicle.history).map((key) => {
              const record = vehicle.history![key as any];
              return {
                ...record,
                firebaseId: key,
                vehicleName: vehicle.name,
                vehiclePlate: vehicle.plate,
                // Використовуємо англійську 'A-95' для уникнення помилок типізації
                fuelType: record.fuelType || vehicle.fuelType,
              };
            });
            all.push(...historyArray);
          }
        });

        this.allRecords = all;
        this.applyFilters(); // Запускаємо фільтрацію та розрахунок при отриманні даних
      });
  }

  // Головна функція фільтрації
  applyFilters() {
    this.filteredRecords = this.allRecords.filter((record) => {
      if (!this.startDate && !this.endDate) return true;

      const recordDate = this.parseDate(record.date);
      const current = new Date(recordDate).setHours(0, 0, 0, 0);
      const start = this.startDate
        ? new Date(this.startDate).setHours(0, 0, 0, 0)
        : null;
      const end = this.endDate
        ? new Date(this.endDate).setHours(23, 59, 59, 999)
        : null;

      return (!start || current >= start) && (!end || current <= end);
    });

    this.sortHistory();
    this.calculateTotals();
  }

  // Конвертація дати з ДД.ММ.РРРР у формат для Date()
  private parseDate(dateStr: string): string {
    const parts = dateStr.split('.');
    if (parts.length !== 3) return dateStr;
    return `${parts[2]}-${parts[1]}-${parts[0]}`;
  }

  // Сортування (нові/старі)
  sortHistory() {
    this.filteredRecords.sort((a, b) => {
      const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return this.sortAscending ? dateA - dateB : dateB - dateA;
    });
  }

  toggleSort() {
    this.sortAscending = !this.sortAscending;
    this.sortHistory();
  }

  // Розрахунок показників на основі ВІДФІЛЬТРОВАНИХ даних
  calculateTotals(): void {
    this.totalDistance = 0;
    this.totalFuelUsed = 0;
    this.totalDP = 0;
    this.totalA95 = 0;
    this.totalFuelUsedDP = 0;
    this.totalFuelUsedA95 = 0;

    this.totalSheetsCount = this.filteredRecords.length;

    this.filteredRecords.forEach((record) => {
      this.totalDistance += record.distance || 0;
      this.totalFuelUsed += record.fuelUsed || 0;

      if (record.fuelType === 'ДП') {
        this.totalDP += record.fuelAdded || 0;
        this.totalFuelUsedDP += record.fuelUsed || 0;
      } else if (record.fuelType === 'A-95') {
        this.totalA95 += record.fuelAdded || 0;
        this.totalFuelUsedA95 += record.fuelUsed || 0;
      }
    });
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}
