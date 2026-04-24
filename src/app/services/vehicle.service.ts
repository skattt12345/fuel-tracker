import { Injectable } from '@angular/core';
import {
  Observable,
  from,
  map,
  BehaviorSubject,
  tap,
  catchError,
  firstValueFrom,
} from 'rxjs';
import { LoadingService } from './loading/loading.service';
// Імпортуємо твої нові інтерфейси
import {
  Vehicle,
  VehicleDetailed,
  VehicleHistoryRecord,
} from '../models/vehicle';

@Injectable({
  providedIn: 'root',
})
export class VehicleService {
  private vehiclesSubject = new BehaviorSubject<Vehicle[]>([]);
  vehicles$ = this.vehiclesSubject.asObservable();

  private readonly apiUrl =
    'https://fueltracker-dsns-default-rtdb.europe-west1.firebasedatabase.app';

  constructor(private loadingService: LoadingService) {
    this.refreshVehicles();
  }

  refreshVehicles() {
    this.getVehiclesFromApi().subscribe({
      next: (data) => this.vehiclesSubject.next(data),
      error: () => this.loadingService.hide(),
    });
  }

  private getVehiclesFromApi(): Observable<Vehicle[]> {
    this.loadingService.show();
    return from(
      fetch(`${this.apiUrl}/vehicles.json`).then((res) => res.json()),
    ).pipe(
      map((data) => {
        if (!data) return [];
        return Object.keys(data)
          .filter((key) => data[key] !== null)
          .map((key) => ({
            ...data[key],
            // Гарантуємо, що ID — це число
            id: data[key].id !== undefined ? Number(data[key].id) : Number(key),
          }))
          .filter((v) => v && v.name);
      }),
      tap(() => this.loadingService.hide()),
      catchError((err) => {
        this.loadingService.hide();
        throw err;
      }),
    );
  }

  getVehicles(): Observable<Vehicle[]> {
    return this.vehicles$;
  }

  // Використовуємо VehicleDetailed для отримання повної інформації
  getVehicleById(id: number | string): Observable<VehicleDetailed | null> {
    this.loadingService.show();
    return from(
      fetch(`${this.apiUrl}/vehicles/${id}.json`).then((res) => res.json()),
    ).pipe(
      map((data) => (data ? { ...data, id: Number(id) } : null)),
      tap(() => this.loadingService.hide()),
      catchError((err) => {
        this.loadingService.hide();
        console.error('Помилка завантаження авто:', err);
        throw err;
      }),
    );
  }

  async createVehicle(vehicle: Vehicle, nextId: number) {
    const response = await fetch(`${this.apiUrl}/vehicles/${nextId}.json`, {
      method: 'PUT',
      body: JSON.stringify({ ...vehicle, id: nextId }),
      headers: { 'Content-Type': 'application/json' },
    });

    if (response.ok) {
      const current = this.vehiclesSubject.value;
      this.vehiclesSubject.next([...current, { ...vehicle, id: nextId }]);
    }
    return response.json();
  }

  async deleteVehicle(id: number) {
    const response = await fetch(`${this.apiUrl}/vehicles/${id}.json`, {
      method: 'DELETE',
    });

    if (response.ok) {
      const current = this.vehiclesSubject.value;
      this.vehiclesSubject.next(current.filter((v) => v.id !== id));
    }
    return response.json();
  }

  // Використовуємо Partial<VehicleDetailed>, щоб можна було оновлювати лише окремі поля (напр. тільки VIN)
  async updateVehicleData(
    id: number | string,
    vehicleData: Partial<VehicleDetailed>,
  ) {
    this.loadingService.show();
    try {
      const res = await fetch(`${this.apiUrl}/vehicles/${id}.json`, {
        method: 'PATCH',
        body: JSON.stringify(vehicleData),
        headers: { 'Content-Type': 'application/json' },
      });
      if (res.ok) this.refreshVehicles();
      return res;
    } finally {
      this.loadingService.hide();
    }
  }

  async addHistoryRecord(
    vehicleId: number | string,
    record: VehicleHistoryRecord,
  ) {
    const recordId = Date.now();
    const response = await fetch(
      `${this.apiUrl}/vehicles/${vehicleId}/history/${recordId}.json`,
      {
        method: 'PUT',
        body: JSON.stringify(record),
        headers: { 'Content-Type': 'application/json' },
      },
    );

    if (!response.ok) throw new Error('Не вдалося зберегти запис у журнал');

    this.refreshVehicles();
    return response.json();
  }

  async deleteHistoryRecord(vehicleId: string | number, firebaseId: string) {
    const response = await fetch(
      `${this.apiUrl}/vehicles/${vehicleId}/history/${firebaseId}.json`,
      { method: 'DELETE' },
    );

    if (response.ok) this.refreshVehicles();
    return response;
  }

  async updateHistoryRecord(
    vehicleId: string | number,
    firebaseId: string,
    data: Partial<VehicleHistoryRecord>,
  ) {
    const response = await fetch(
      `${this.apiUrl}/vehicles/${vehicleId}/history/${firebaseId}.json`,
      {
        method: 'PATCH',
        body: JSON.stringify(data),
        headers: { 'Content-Type': 'application/json' },
      },
    );

    if (response.ok) this.refreshVehicles();
    return response.json();
  }

  async isSheetNumberUsedGlobally(sheetNumber: string): Promise<boolean> {
    const vehicles = await firstValueFrom(this.getVehicles());
    if (!vehicles) return false;

    const trimmedNumber = sheetNumber.trim();
    return vehicles.some((vehicle) => {
      if (!vehicle.history) return false;

      // Перетворюємо об'єкт історії в масив для перевірки
      const historyArray = Object.values(vehicle.history);
      return historyArray.some((record: any) => {
        const num =
          record.sheetNumber || record.routeNumber || record.routeSheetNumber;
        return num?.toString().trim() === trimmedNumber;
      });
    });
  }
}
