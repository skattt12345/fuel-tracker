import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { AuthService } from 'src/app/services/Auth/auth.service';

import { HistoryTableComponent } from './history-table.component';

describe('HistoryTableComponent', () => {
  let component: HistoryTableComponent;
  let fixture: ComponentFixture<HistoryTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [HistoryTableComponent],
      providers: [
        {
          provide: AuthService,
          useValue: {
            isAdmin$: of(false),
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(HistoryTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
