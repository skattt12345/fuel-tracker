import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';

import { InstituteSettingsComponent } from './institute-settings.component';

describe('InstituteSettingsComponent', () => {
  let component: InstituteSettingsComponent;
  let fixture: ComponentFixture<InstituteSettingsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FormsModule],
      declarations: [InstituteSettingsComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(InstituteSettingsComponent);
    component = fixture.componentInstance;
    component.vehicle = {
      id: 1,
      name: 'Test Vehicle',
      plate: 'AO 0000 AA',
      mileage: 0,
      fuelLeft: 0,
      consumption: 10,
      isInstitute: false,
      linearNorm: 0,
      warmupRate: 0,
      history: [],
    };
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
