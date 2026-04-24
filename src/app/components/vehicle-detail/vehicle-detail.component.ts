import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { VehicleService } from '../../services/vehicle.service';
import { Vehicle, VehicleHistoryRecord } from 'src/app/models/vehicle';
import { AuthService } from 'src/app/services/Auth/auth.service';

@Component({
  selector: 'app-vehicle-detail',
  templateUrl: './vehicle-detail.component.html',
  styleUrls: ['./vehicle-detail.component.css'],
})
export class VehicleDetailComponent implements OnInit {
  readonly Number = Number;
  readonly Math = Math;

  @ViewChild('fuelInput') fuelInput!: ElementRef;

  vehicle: Vehicle | undefined;
  newMileage: number | null = null;
  fuelAdded: number | null = null;

  distance: number = 0;
  fuelUsed: number = 0;
  calculatedFuelLeft: number = 0;

  showResult: boolean = false;
  showFuelAlert: boolean = false;
  isSheetNumberTaken = false;
  routeSheetNumber: string = '';
  suggestedMileage: number | null = null;

  // Об'єкт для збереження розподілу пробігу
  calcParams: any = {
    warmupMinutes: 0,
    segments: {
      highway: 0, // -5%
      otherCity: 0, // +5%
      uzhhorod: 0, // +10%
      largeCity: 0, // +15%
    },
  };

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private vehicleService: VehicleService,
    private authService: AuthService,
  ) {}

  ngOnInit(): void {
    const vehicleId = this.route.snapshot.paramMap.get('id');
    if (!vehicleId) return;

    this.vehicleService.getVehicleById(vehicleId).subscribe((data) => {
      if (data) {
        this.vehicle = {
          ...data,
          id: data.id !== undefined ? data.id : Number(vehicleId),
        };
        this.checkSheetNumber();
      } else {
        this.router.navigate(['/']);
      }
    });
  }

  // --- МЕТОД, ЯКИЙ ТИ ВИПАДКОВО ВИДАЛИВ ---
  handleSettingsChange(data: any) {
    if (this.vehicle) {
      this.vehicle.isInstitute = data.isInstitute;
      this.vehicle.linearNorm = data.linearNorm;
      this.vehicle.warmupRate = data.warmupRate;

      // Отримуємо сегменти (траса, місто і т.д.) з дочірньої компоненти
      this.calcParams = data.calcParams;

      // Одразу перераховуємо пальне
      this.calculate();
    }
  }

  get totalSegmentKm(): number {
    const s = this.calcParams.segments;
    return (
      Number(s.highway || 0) +
      Number(s.otherCity || 0) +
      Number(s.uzhhorod || 0) +
      Number(s.largeCity || 0)
    );
  }

  get remainingKm(): number {
    return Math.max(0, this.distance - this.totalSegmentKm);
  }

  calculate() {
    if (!this.vehicle || this.newMileage === null) return;

    this.distance = Number(this.newMileage) - this.vehicle.mileage;
    if (this.distance <= 0) {
      this.fuelUsed = 0;
      this.showResult = false;
      return;
    }

    // Визначаємо базову норму (Hl або звичайна)
    const baseConsumption = this.vehicle.isInstitute
      ? Number(this.vehicle.linearNorm) || 0
      : Number(this.vehicle.linearNorm) ||
        Number(this.vehicle.consumption) ||
        0;

    if (this.vehicle.isInstitute && this.calcParams) {
      const hl = baseConsumption;
      const s = this.calcParams.segments;

      // Розрахунок по сегментах (Наказ №432)
      const fuelHighway = ((hl * Number(s.highway || 0)) / 100) * 0.95;
      const fuelOther = ((hl * Number(s.otherCity || 0)) / 100) * 1.05;
      const fuelUzh = ((hl * Number(s.uzhhorod || 0)) / 100) * 1.1;
      const fuelLarge = ((hl * Number(s.largeCity || 0)) / 100) * 1.15;

      const fuelWarmup =
        (Number(this.calcParams.warmupMinutes) || 0) *
        (Number(this.vehicle.warmupRate) || 0);

      this.fuelUsed =
        fuelHighway + fuelOther + fuelUzh + fuelLarge + fuelWarmup;
    } else {
      // Звичайний розрахунок
      this.fuelUsed = (this.distance * baseConsumption) / 100;
    }

    // Округлення до 3 знаків для точності ДСНС
    this.calculatedFuelLeft = Number(
      (
        this.vehicle.fuelLeft +
        (Number(this.fuelAdded) || 0) -
        this.fuelUsed
      ).toFixed(3),
    );
    this.showResult = true;
  }

  getSuggestion() {
    if (!this.vehicle || !this.fuelUsed) return;
    const currentMileage = this.vehicle.mileage;
    const consumption = this.vehicle.consumption;
    let bestMileage = this.newMileage || currentMileage;
    let minGramms = 999;
    const startSearch = (this.newMileage || currentMileage) - 5;
    const endSearch = (this.newMileage || currentMileage) + 5;
    for (let km = startSearch; km <= endSearch; km++) {
      if (km <= currentMileage) continue;
      const testDistance = km - currentMileage;
      const testFuel = (testDistance * consumption) / 100;
      const gramms = Math.abs(testFuel * 10 - Math.round(testFuel * 10));
      if (gramms < minGramms) {
        minGramms = gramms;
        bestMileage = km;
      }
    }
    this.suggestedMileage = bestMileage;
  }

  applySuggestion() {
    if (this.suggestedMileage) {
      this.newMileage = this.suggestedMileage;
      this.calculate();
      this.suggestedMileage = null;
    }
  }

  async saveData() {
    if (
      !this.vehicle ||
      this.vehicle.id === undefined ||
      this.newMileage === null ||
      !this.routeSheetNumber
    ) {
      alert('Будь ласка, заповніть номер листа та новий пробіг!');
      return;
    }
    if (this.calculatedFuelLeft < 0) {
      this.showFuelAlert = true;
      return;
    }
    await this.checkSheetNumber();
    if (this.isSheetNumberTaken) {
      alert('Цей номер листа вже використано!');
      return;
    }
    if (Number(this.newMileage) < this.vehicle.mileage) {
      alert('Помилка: Новий пробіг менший за поточний!');
      return;
    }

    const author = await this.authService.getUserData();
    const historyRecord: VehicleHistoryRecord = {
      date: new Date().toLocaleDateString('uk-UA'),
      time: new Date().toLocaleTimeString('uk-UA', {
        hour: '2-digit',
        minute: '2-digit',
      }),
      sheetNumber: this.routeSheetNumber,
      mileageBefore: this.vehicle.mileage,
      mileageAfter: Number(this.newMileage),
      distance: Number(this.newMileage) - this.vehicle.mileage,
      fuelUsed: parseFloat(this.fuelUsed.toFixed(3)),
      fuelAdded: Number(this.fuelAdded) || 0,
      fuelLeft: parseFloat(this.calculatedFuelLeft.toFixed(3)),
      vehicleName: this.vehicle.name,
      vehiclePlate: this.vehicle.plate,
      createdBy: author.name,
      createdByUid: author.uid,
      createdAt: new Date().toISOString(),
    };

    const updatedVehicleData = {
      mileage: Number(this.newMileage),
      fuelLeft: parseFloat(this.calculatedFuelLeft.toFixed(3)),
      lastUpdate: new Date().toISOString(),
      lastRouteSheet: this.routeSheetNumber,
      isInstitute: this.vehicle.isInstitute,
      linearNorm: this.vehicle.linearNorm,
      warmupRate: this.vehicle.warmupRate,
    };

    try {
      await this.vehicleService.updateVehicleData(
        this.vehicle.id,
        updatedVehicleData,
      );
      await this.vehicleService.addHistoryRecord(
        this.vehicle.id,
        historyRecord,
      );
      alert('Дані успішно збережено!');
      this.router.navigate(['/']);
    } catch (error: any) {
      alert('Помилка: ' + error.message);
    }
  }

  async checkSheetNumber() {
    if (!this.routeSheetNumber?.trim()) {
      this.isSheetNumberTaken = false;
      return;
    }
    try {
      this.isSheetNumberTaken =
        await this.vehicleService.isSheetNumberUsedGlobally(
          this.routeSheetNumber,
        );
    } catch {
      this.isSheetNumberTaken = false;
    }
  }

  closeAlertAndFocus() {
    this.showFuelAlert = false;
    setTimeout(() => {
      this.fuelInput?.nativeElement?.focus();
      this.fuelInput?.nativeElement?.select();
    }, 100);
  }

  updateVehicleInDb() {
    if (this.vehicle?.id !== undefined) {
      this.vehicleService
        .updateVehicleData(this.vehicle.id, {
          isInstitute: this.vehicle.isInstitute,
          linearNorm: this.vehicle.linearNorm,
          warmupRate: this.vehicle.warmupRate,
          ageBonus: this.vehicle.ageBonus,
        })
        .then(() => {
          this.calculate();
        });
    }
  }
}
