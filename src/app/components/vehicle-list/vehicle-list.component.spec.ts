import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { of } from 'rxjs';
import { AuthService } from 'src/app/services/Auth/auth.service';
import { VehicleService } from 'src/app/services/vehicle.service';

import { VehicleListComponent } from './vehicle-list.component';

describe('VehicleListComponent', () => {
  let component: VehicleListComponent;
  let fixture: ComponentFixture<VehicleListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FormsModule, RouterTestingModule],
      declarations: [VehicleListComponent],
      providers: [
        {
          provide: VehicleService,
          useValue: {
            getVehicles: () => of([]),
            refreshVehicles: () => undefined,
            deleteVehicle: () => Promise.resolve(),
          },
        },
        {
          provide: AuthService,
          useValue: {
            isAdmin$: of(true),
            user$: of(null),
          },
        },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(VehicleListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
