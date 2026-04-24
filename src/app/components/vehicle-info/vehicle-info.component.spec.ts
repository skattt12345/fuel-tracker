import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { VehicleService } from 'src/app/services/vehicle.service';

import { VehicleInfoComponent } from './vehicle-info.component';

describe('VehicleInfoComponent', () => {
  let component: VehicleInfoComponent;
  let fixture: ComponentFixture<VehicleInfoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReactiveFormsModule],
      declarations: [VehicleInfoComponent],
      providers: [
        {
          provide: VehicleService,
          useValue: {
            updateVehicleData: () => Promise.resolve(),
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(VehicleInfoComponent);
    component = fixture.componentInstance;
    component.vehicle = {
      id: 1,
      name: 'Test Vehicle',
      plate: 'AO 0000 AA',
      consumption: 10,
    };
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
