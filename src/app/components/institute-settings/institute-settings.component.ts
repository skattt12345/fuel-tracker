import { Component, Input, Output, EventEmitter } from '@angular/core';
import { Vehicle } from 'src/app/models/vehicle';

@Component({
  selector: 'app-institute-settings',
  templateUrl: './institute-settings.component.html',
  styleUrls: ['./institute-settings.component.css'],
})
export class InstituteSettingsComponent {
  @Input() vehicle!: Vehicle;
  @Input() distance: number = 0;
  @Output() settingsChanged = new EventEmitter<any>();

  calcParams: any = {
    warmupMinutes: 0,
    segments: {
      highway: 0, // -5%
      otherCity: 0, // +5%
      uzhhorod: 0, // +10%
      largeCity: 0, // +15%
    },
  };

  onToggle() {
    if (this.vehicle.isInstitute) {
      this.vehicle.linearNorm = this.vehicle.linearNorm || 0;
      this.vehicle.warmupRate = this.vehicle.warmupRate || 0;
    }
    this.emitChange();
  }

  // Розрахунок суми всіх введених кілометрів
  get totalDistributed(): number {
    const s = this.calcParams.segments;
    return (
      (Number(s.highway) || 0) +
      (Number(s.otherCity) || 0) +
      (Number(s.uzhhorod) || 0) +
      (Number(s.largeCity) || 0)
    );
  }

  get remainingKm(): number {
    return this.distance - this.totalDistributed;
  }

  fillRemainder(target: string) {
    const s = this.calcParams.segments;
    // Рахуємо все КРІМ цільового поля
    const otherSegmentsSum = this.totalDistributed - (Number(s[target]) || 0);

    // Залишок не може бути меншим за 0
    const remainder = Math.max(0, this.distance - otherSegmentsSum);

    this.calcParams.segments[target] = remainder;
    this.onInputChange();
  }

  emitChange() {
    this.settingsChanged.emit({
      isInstitute: this.vehicle.isInstitute,
      linearNorm: Number(this.vehicle.linearNorm) || 0,
      warmupRate: Number(this.vehicle.warmupRate) || 0,
      calcParams: this.calcParams,
    });
  }

  onInputChange() {
    this.emitChange();
  }
}
