import { CommonModule } from '@angular/common';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { of } from 'rxjs';
import { AppComponent } from './app.component';
import { AuthService } from './services/Auth/auth.service';
import { LoadingService } from './services/loading/loading.service';
import { VehicleService } from './services/vehicle.service';

describe('AppComponent', () => {
  const vehicleServiceMock = {
    getVehicles: () => of([]),
  };
  const loadingServiceMock = {
    isLoading$: of(false),
  };
  const authServiceMock = {
    user$: of(null),
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CommonModule, RouterTestingModule],
      declarations: [AppComponent],
      providers: [
        { provide: VehicleService, useValue: vehicleServiceMock },
        { provide: LoadingService, useValue: loadingServiceMock },
        { provide: AuthService, useValue: authServiceMock },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it('should initialize with an empty vehicles list', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app.vehicles).toEqual([]);
  });

  it('should render the main layout', () => {
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('main')).toBeTruthy();
    expect(compiled.querySelector('router-outlet')).toBeTruthy();
  });
});
