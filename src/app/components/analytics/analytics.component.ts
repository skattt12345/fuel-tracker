import { Component, OnInit, ViewChild } from '@angular/core';
import { VehicleService } from '../../services/vehicle.service';
import { Vehicle } from '../../models/vehicle';
import { ChartConfiguration, ChartData, ChartType } from 'chart.js';
import { BaseChartDirective } from 'ng2-charts';
import * as XLSX from 'xlsx'; // Імпорт бібліотеки

@Component({
  selector: 'app-analytics',
  templateUrl: './analytics.component.html',
  styleUrls: ['./analytics.component.css'],
})
export class AnalyticsComponent implements OnInit {
  @ViewChild(BaseChartDirective) chart: BaseChartDirective | undefined;
  vehicles: Vehicle[] = [];
  loading = true;

  selectedMonth: number = new Date().getMonth(); // Поточний місяць (0-11)
  selectedYear: number = new Date().getFullYear(); // Поточний рік

  months = [
    'Січень',
    'Лютий',
    'Березень',
    'Квітень',
    'Травень',
    'Червень',
    'Липень',
    'Серпень',
    'Вересень',
    'Жовтень',
    'Листопад',
    'Грудень',
  ];

  years: number[] = [2024, 2025, 2026, 2027];

  // Налаштування графіку
  public barChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: true, position: 'top' },
    },
  };
  public barChartType: ChartType = 'bar';
  public barChartData: ChartData<'bar'> = {
    labels: [],
    datasets: [],
  };

  constructor(private vehicleService: VehicleService) {}

  ngOnInit(): void {
    this.vehicleService.getVehicles().subscribe((data) => {
      this.vehicles = data.map((v) => ({
        ...v,
        history: v.history ? Object.values(v.history) : [],
      }));
      this.updateChart();
      this.loading = false;
    });
  }

  updateChart(): void {
    console.log(
      'Машини для графіка:',
      this.vehicles.map((v) => ({
        name: v.name,
        fuel: this.getTotalFuelUsed(v),
        dist: this.getTotalDistance(v),
      })),
    );

    const labels = this.vehicles.map((v) => v.name);

    // Рахуємо дані ТІЛЬКИ для вибраного періоду
    const factData = this.vehicles.map((v) => this.getTotalFuelUsed(v));
    const normData = this.vehicles.map((v) => this.getTotalFuelNorm(v));

    // Створюємо повністю новий об'єкт даних (це лікує "зникаючі" стовпчики)
    this.barChartData = {
      labels: labels,
      datasets: [
        {
          data: factData,
          label: 'Факт (л)',
          backgroundColor: '#ef4444',
          borderRadius: 6,
        },
        {
          data: normData,
          label: 'Норма (л)',
          backgroundColor: '#94a3b8',
          borderRadius: 6,
        },
      ],
    };

    // Примусове оновлення, якщо графік уже ініціалізований
    setTimeout(() => {
      this.chart?.update();
    }, 100);
  }
  // Метод для отримання фільтрованої історії для конкретного авто
  // Метод для отримання фільтрованої історії для конкретного авто
  getFilteredHistory(vehicle: Vehicle): any[] {
    if (!vehicle.history) return [];

    const historyArray = Array.isArray(vehicle.history)
      ? vehicle.history
      : Object.values(vehicle.history);

    const targetMonth = Number(this.selectedMonth);
    const targetYear = Number(this.selectedYear);

    return historyArray.filter((record: any) => {
      if (!record || !record.date) return false;

      const dateParts = record.date.split('.');
      if (dateParts.length !== 3) return false;

      const recordMonth = Number(dateParts[1]);
      const recordYear = Number(dateParts[2]);

      // ЯКЩО вибрано "Весь рік" (targetMonth === -1)
      if (targetMonth === -1) {
        return recordYear === targetYear;
      }

      // ІНАКШЕ фільтруємо як раніше (місяць + рік)
      return recordMonth === targetMonth + 1 && recordYear === targetYear;
    });
  }

  // Оновимо методи розрахунку, щоб вони використовували getFilteredHistory

  // Не забудь викликати updateChart() при зміні фільтрів!
  onFilterChange() {
    const m = Number(this.selectedMonth) + 1;
    console.log('Шукаю місяць:', m, 'рік:', this.selectedYear);
    this.updateChart();
  }

  getTotalFuelUsed(v: Vehicle): number {
    const history = this.getFilteredHistory(v);
    return history.reduce((sum, r) => sum + (Number(r.fuelUsed) || 0), 0);
  }

  getTotalFuelNorm(v: Vehicle): number {
    const distance = this.getTotalDistance(v);
    // Беремо linearNorm з картки авто. Якщо її нема - беремо середню витрату
    const norm = v.linearNorm || v.consumption || 0;
    return (distance * norm) / 100;
  }

  getDifference(v: Vehicle): number {
    return this.getTotalFuelUsed(v) - this.getTotalFuelNorm(v);
  }
  getTotalDistance(v: Vehicle): number {
    const history = this.getFilteredHistory(v);
    return history.reduce((sum, r) => sum + (Number(r.distance) || 0), 0);
  }
  exportExcel() {
    // 1. Готуємо дані у зручному для Excel форматі
    const dataToExport = this.vehicles.map((v) => ({
      Автомобіль: v.name,
      'Держ. номер': v.plate,
      'Пробіг (км)': this.getTotalDistance(v),
      'Факт (л)': this.getTotalFuelUsed(v),
      'Норма (л)': this.getTotalFuelNorm(v),
      'Різниця (л)': this.getDifference(v),
    }));

    // 2. Створюємо робочу книгу та лист
    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Звіт по пальному');

    // 3. Формуємо назву файлу залежно від фільтра
    const period =
      this.selectedMonth === -1
        ? `рік_${this.selectedYear}`
        : `${this.months[this.selectedMonth]}_${this.selectedYear}`;

    const fileName = `Звіт_пальне_Закарпаття_${period}.xlsx`;

    // 4. Завантажуємо файл
    XLSX.writeFile(workbook, fileName);
  }
}
