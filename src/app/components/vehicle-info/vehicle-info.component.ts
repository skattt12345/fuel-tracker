import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { VehicleService } from '../../services/vehicle.service';

@Component({
  selector: 'app-vehicle-info',
  templateUrl: './vehicle-info.component.html',
  styleUrls: ['./vehicle-info.component.css'],
})
export class VehicleInfoComponent implements OnInit {
  @Input() vehicle: any;
  @Input() isAdmin: boolean = false;
  @Output() close = new EventEmitter<void>();
  @Output() updated = new EventEmitter<void>();

  vehicleForm!: FormGroup;

  constructor(
    private fb: FormBuilder,
    private vehicleService: VehicleService,
  ) {}

  ngOnInit() {
    document.body.style.overflow = 'hidden';
    this.vehicleForm = this.fb.group({
      name: [this.vehicle?.name, Validators.required],
      plate: [this.vehicle?.plate, Validators.required],
      consumption: [
        this.vehicle?.consumption,
        [Validators.required, Validators.min(0)],
      ],
      inventoryNumber: [this.vehicle?.inventoryNumber || ''],

      // Нові поля
      vin: [
        this.vehicle?.vin || '',
        [Validators.minLength(17), Validators.maxLength(17)],
      ],
      fuelTankCapacity: [
        this.vehicle?.fuelTankCapacity || '',
        [Validators.min(1)],
      ],
      manufactureYear: [
        this.vehicle?.manufactureYear || '',
        [Validators.min(1950), Validators.max(new Date().getFullYear())],
      ],
      fuelType: [this.vehicle?.fuelType || 'Дизель'], // Можна зробити вибір зі списку
      notes: [this.vehicle?.notes || ''],
    });

    if (!this.isAdmin) {
      this.vehicleForm.disable();
    }
  }
  ngOnDestroy() {
    // Повертаємо скрол, коли компонента знищується (закривається)
    document.body.style.overflow = 'auto';
  }
  closeInfo() {
    this.close.emit();
  }

  async save() {
    if (this.vehicleForm.valid && this.vehicle.id) {
      try {
        await this.vehicleService.updateVehicleData(
          this.vehicle.id,
          this.vehicleForm.value,
        );
        this.updated.emit();
        alert('Дані оновлено!');
      } catch (err) {
        alert('Помилка при збереженні');
      }
    }
  }
}
