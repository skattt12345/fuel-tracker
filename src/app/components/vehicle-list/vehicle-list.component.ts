import { Component, OnInit } from '@angular/core';
import { firstValueFrom, take } from 'rxjs';
import { Vehicle } from 'src/app/models/vehicle';
import { AuthService } from 'src/app/services/Auth/auth.service';
import { VehicleService } from 'src/app/services/vehicle.service';

@Component({
  selector: 'app-vehicle-list',
  templateUrl: './vehicle-list.component.html',
  styleUrls: ['./vehicle-list.component.css'],
})
export class VehicleListComponent implements OnInit {
  vehicles: Vehicle[] = []; // Основний список з бази
  filteredVehicles: Vehicle[] = []; // Список, який ми бачимо (відфільтрований)
  searchTerm: string = ''; // Текст пошуку
  selectedVehicle: any = null;
  isAdmin: boolean = true;

  constructor(
    private vehicleService: VehicleService,
    public authService: AuthService,
  ) {}

  ngOnInit(): void {
    this.vehicleService.getVehicles().subscribe((data) => {
      this.vehicles = data;
      // Викликаємо фільтрацію тут, щоб при видаленні/додаванні
      // актуальний список відразу з'являвся на екрані з врахуванням пошуку
      this.filterVehicles();
      console.log('Список машин оновлено реактивно:', this.vehicles);
    });
  }

  // Функція фільтрації
  filterVehicles(): void {
    const search = this.searchTerm.toLowerCase();
    this.filteredVehicles = this.vehicles.filter(
      (v) =>
        v.name.toLowerCase().includes(search) ||
        v.plate.toLowerCase().includes(search),
    );
  }
  // Додай у клас компоненти списку
  // Вказуємо тип Vehicle замість any
  async removeVehicle(event: Event, vehicle: Vehicle) {
    event.stopPropagation();

    const isAdmin = await firstValueFrom(this.authService.isAdmin$);

    if (!isAdmin) {
      alert('У вас немає прав для видалення!');
      return;
    }

    // Додаємо перевірку на наявність id перед видаленням
    if (vehicle.id === undefined) {
      alert('Помилка: ID машини не знайдено');
      return;
    }

    if (confirm(`Видалити ${vehicle.name}?`)) {
      try {
        await this.vehicleService.deleteVehicle(vehicle.id);
      } catch (error) {
        alert('Помилка при видаленні!');
      }
    }
  }
  openInfo(event: Event, vehicle: any) {
    event.stopPropagation(); // Зупиняємо перехід по картці
    this.selectedVehicle = vehicle;
  }

  // Метод для оновлення списку (тепер без помилок)
  onVehicleUpdated() {
    this.selectedVehicle = null;
    this.vehicleService.refreshVehicles();
  }
}
