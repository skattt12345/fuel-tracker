import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { of } from 'rxjs';
import { AuthService } from 'src/app/services/Auth/auth.service';
import { VehicleService } from 'src/app/services/vehicle.service';

import { VehicleHistoryComponent } from './vehicle-history.component';

describe('VehicleHistoryComponent', () => {
  let component: VehicleHistoryComponent;
  let fixture: ComponentFixture<VehicleHistoryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FormsModule, RouterTestingModule],
      declarations: [VehicleHistoryComponent],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              paramMap: {
                get: () => null,
              },
            },
          },
        },
        {
          provide: VehicleService,
          useValue: {
            getVehicleById: () => of(null),
            deleteHistoryRecord: () => Promise.resolve(),
            updateHistoryRecord: () => Promise.resolve(),
          },
        },
        {
          provide: AuthService,
          useValue: {
            isAdmin$: of(false),
          },
        },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(VehicleHistoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
