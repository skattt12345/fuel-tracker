import { Injectable } from '@angular/core';
import { BehaviorSubject, asapScheduler } from 'rxjs';
import { observeOn } from 'rxjs/operators'; // Переконайся, що цей імпорт є

@Injectable({ providedIn: 'root' })
export class LoadingService {
  private loadingCount = 0;
  private _isLoading$ = new BehaviorSubject<boolean>(false);

  // Цей рядок "лікує" помилку NG0100 (ExpressionChangedAfterItHasBeenCheckedError)
  // Він каже Angular: "змінюй стан лоадера в наступному циклі перевірки"
  isLoading$ = this._isLoading$.asObservable().pipe(observeOn(asapScheduler));

  show() {
    this.loadingCount++;
    this._isLoading$.next(true);
  }

  hide() {
    this.loadingCount--;
    if (this.loadingCount <= 0) {
      this.loadingCount = 0;
      this._isLoading$.next(false);
    }
  }

  // Додай цей метод про всяк випадок (для аварійного скидання)
  forceHide() {
    this.loadingCount = 0;
    this._isLoading$.next(false);
  }
}
