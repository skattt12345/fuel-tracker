// Базовий інтерфейс для списку та швидких розрахунків
export interface Vehicle {
  id?: number;
  name: string;
  plate: string;
  mileage: number;
  fuelLeft: number;
  consumption: number;
  fuelType?: 'ДП' | 'A-95';

  // Нові поля для інституту
  isInstitute?: boolean; // Перемикач: Інститут чи ні
  linearNorm?: number; // Hl - лінійна норма (л/100км)
  warmupRate?: number; // Робота двигуна на місці (л/хв)
  ageBonus?: number; // Відсоток за стаж (напр. 3, 5, 7 або 9%)

  history?: VehicleHistoryRecord[];
}

// Структура одного запису в історії (щоб не було any)
export interface VehicleHistoryRecord {
  vehicleName?: string; // Назва авто (напр. Audi A6)
  vehiclePlate?: string;
  firebaseId?: string;
  date: string;
  time: string;
  sheetNumber?: string;
  routeNumber?: string;
  mileageBefore: number;
  mileageAfter: number;
  distance: number;
  fuelAdded: number;
  fuelUsed: number;
  fuelLeft: number;
  fuelType?: 'ДП' | 'A-95'; // Тип палива

  createdBy?: string; // Ім'я водія
  createdByUid?: string | null; // Його унікальний ID з Firebase
  createdAt?: string; // Дата створення в форматі ISO
}

// Розширений інтерфейс для "Паспорта авто" (Пункт 7)
export interface VehicleDetailed extends Vehicle {
  vin?: string; // VIN-код
  year?: number; // Рік випуску
  engineSize?: string; // Об'єм двигуна (напр. 2.0 TDI)
  weightEmpty?: number; // Маса без навантаження (кг)
  weightFull?: number; // Повна маса (кг)
  assignedDriver?: string; // Закріплений водій (Прізвище)
  notes?: string; // Додаткові примітки
  documentUrl?: string; // Посилання на скан техпаспорта (на майбутнє)
}
