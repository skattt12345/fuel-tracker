import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
// Імпортуємо інтерфейси
import { Vehicle, VehicleHistoryRecord } from 'src/app/models/vehicle';
import { AuthService } from 'src/app/services/Auth/auth.service';
import { VehicleService } from 'src/app/services/vehicle.service';

@Component({
  selector: 'app-vehicle-history',
  templateUrl: './vehicle-history.component.html',
  styleUrls: ['./vehicle-history.component.css'],
})
export class VehicleHistoryComponent implements OnInit, OnDestroy {
  vehicle: Vehicle | null = null;
  // Використовуємо наш інтерфейс для записів
  allRecords: VehicleHistoryRecord[] = [];
  filteredRecords: VehicleHistoryRecord[] = [];

  private isAdminInternal: boolean = false;
  private authSub?: Subscription;

  startDate: string = '';
  endDate: string = '';
  sortAscending = false;
  showEditModal = false;
  // Типізуємо об'єкт редагування
  editingRecord: any = null;

  constructor(
    private route: ActivatedRoute,
    private vehicleService: VehicleService,
    public authService: AuthService,
  ) {}

  ngOnInit(): void {
    // Підписка на права адміна
    this.authSub = this.authService.isAdmin$.subscribe((admin) => {
      this.isAdminInternal = admin;
    });

    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.vehicleService.getVehicleById(id).subscribe((data) => {
        if (!data) return;
        this.vehicle = data;

        if (data.history) {
          // Перетворюємо об'єкт історії Firebase у масив з додаванням ID
          this.allRecords = Object.keys(data.history).map((key) => ({
            ...(data.history as any)[key],
            firebaseId: key,
          }));
          this.applyFilters();
        }
      });
    }
  }

  ngOnDestroy(): void {
    this.authSub?.unsubscribe();
  }

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
  }

  sortHistory() {
    this.filteredRecords.sort((a, b) => {
      const idA = Number(a.firebaseId) || 0;
      const idB = Number(b.firebaseId) || 0;
      return this.sortAscending ? idA - idB : idB - idA;
    });
  }

  toggleSort() {
    this.sortAscending = !this.sortAscending;
    this.sortHistory();
  }

  resetFilters() {
    this.startDate = '';
    this.endDate = '';
    this.applyFilters();
  }

  private parseDate(dateStr: string): string {
    const parts = dateStr.split('.');
    if (parts.length !== 3) return dateStr;
    return `${parts[2]}-${parts[1]}-${parts[0]}`;
  }

  // ПІДСУМКИ
  get totalDistance(): number {
    return this.filteredRecords.reduce(
      (sum, r) => sum + (Number(r.distance) || 0),
      0,
    );
  }

  get totalFuelUsed(): number {
    return this.filteredRecords.reduce(
      (sum, r) => sum + (Number(r.fuelUsed) || 0),
      0,
    );
  }

  get totalRefueled(): number {
    return this.filteredRecords.reduce(
      (sum, r) => sum + (Number(r.fuelAdded) || 0),
      0,
    );
  }

  deleteRecord(record: VehicleHistoryRecord) {
    if (!this.isAdminInternal) {
      alert('У вас немає прав для видалення записів!');
      return;
    }

    if (!this.vehicle || !this.vehicle.id || !record.firebaseId) return;

    if (confirm(`Видалити запис №${record.sheetNumber || 'без номера'}?`)) {
      this.vehicleService
        .deleteHistoryRecord(this.vehicle.id, record.firebaseId)
        .then(() => {
          this.allRecords = this.allRecords.filter(
            (r) => r.firebaseId !== record.firebaseId,
          );
          this.applyFilters();
        })
        .catch((err) => alert('Помилка при видаленні: ' + err));
    }
  }

  openEdit(row: VehicleHistoryRecord) {
    if (!this.isAdminInternal) {
      alert('Тільки адміністратор може редагувати історію!');
      return;
    }
    this.editingRecord = { ...row };
    this.showEditModal = true;
  }

  async saveEdit() {
    if (
      !this.isAdminInternal ||
      !this.vehicle ||
      !this.vehicle.id ||
      !this.editingRecord
    )
      return;

    const newDistance =
      this.editingRecord.mileageAfter - this.editingRecord.mileageBefore;
    if (newDistance < 0) {
      alert('Пробіг "Після" не може бути меншим за пробіг "До"!');
      return;
    }

    const consumptionRate = this.vehicle.consumption || 0;
    const newFuelUsed = (newDistance * consumptionRate) / 100;

    // Шукаємо оригінальний запис для перерахунку залишку
    const oldEntry = this.allRecords.find(
      (r) => r.firebaseId === this.editingRecord.firebaseId,
    );
    if (!oldEntry) return;

    const fuelBeforeTrip =
      Number(oldEntry.fuelLeft) +
      Number(oldEntry.fuelUsed) -
      (Number(oldEntry.fuelAdded) || 0);
    const newFuelLeft =
      fuelBeforeTrip +
      (Number(this.editingRecord.fuelAdded) || 0) -
      newFuelUsed;

    const dataToSave: Partial<VehicleHistoryRecord> = {
      sheetNumber: this.editingRecord.sheetNumber,
      mileageBefore: Number(this.editingRecord.mileageBefore),
      mileageAfter: Number(this.editingRecord.mileageAfter),
      distance: newDistance,
      fuelAdded: Number(this.editingRecord.fuelAdded) || 0,
      fuelUsed: Number(newFuelUsed.toFixed(2)),
      fuelLeft: Number(newFuelLeft.toFixed(2)),
    };

    try {
      await this.vehicleService.updateHistoryRecord(
        this.vehicle.id,
        this.editingRecord.firebaseId,
        dataToSave,
      );

      this.showEditModal = false;
      // Оновлюємо локально
      const index = this.allRecords.findIndex(
        (r) => r.firebaseId === this.editingRecord.firebaseId,
      );
      if (index !== -1) {
        this.allRecords[index] = { ...this.allRecords[index], ...dataToSave };
      }
      this.applyFilters();
    } catch (err) {
      alert('Помилка оновлення: ' + err);
    }
  }
}
