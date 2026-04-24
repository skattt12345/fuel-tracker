import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { of } from 'rxjs';
import { VehicleService } from 'src/app/services/vehicle.service';

import { VehicleAllHistoryComponent } from './vehicle-all-history.component';

describe('VehicleAllHistoryComponent', () => {
  let component: VehicleAllHistoryComponent;
  let fixture: ComponentFixture<VehicleAllHistoryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FormsModule],
      declarations: [VehicleAllHistoryComponent],
      providers: [
        {
          provide: VehicleService,
          useValue: {
            getVehicles: () => of([]),
          },
        },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(VehicleAllHistoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
