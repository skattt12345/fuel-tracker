import { Component, ElementRef, HostListener, OnInit } from '@angular/core';
import { Vehicle } from 'src/app/models/vehicle';
import { AuthService } from 'src/app/services/Auth/auth.service';
import { VehicleService } from 'src/app/services/vehicle.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css'],
})
export class HeaderComponent implements OnInit {
  isMenuOpen = false;
  isDarkMode = false;
  isModalOpen = false;

  vehicles: Vehicle[] = [];

  // Ініціалізуємо форму через функцію, щоб легко очищати
  newVehicle: Vehicle = this.getEmptyVehicle();

  constructor(
    private vehicleService: VehicleService,
    public authService: AuthService,
    private el: ElementRef, // Додай це сюди
  ) {}

  ngOnInit(): void {
    // Тема
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
      this.setDarkTheme(true);
    }

    // Підписка на машини
    this.vehicleService.getVehicles().subscribe((data) => {
      this.vehicles = data;
    });
  }

  private getEmptyVehicle(): Vehicle {
    return {
      id: 0, // Тимчасово, реальний ID буде згенеровано при додаванні
      name: '',
      plate: '',
      mileage: 0,
      fuelLeft: 0,
      consumption: 10,
      fuelType: 'ДП',
      history: [],
      isInstitute: false,
      linearNorm: 0, // зазвичай дорівнює базовому розходу
      warmupRate: 0.006, // Додаємо порожню історію відразу
    };
  }

  openAddModal() {
    this.isModalOpen = true;
    document.body.style.overflow = 'hidden';
  }

  closeModal() {
    this.isModalOpen = false;
    document.body.style.overflow = 'auto';
    this.isMenuOpen = false; // Закриваємо мобільне меню при відкритті модалки
  }
  closeMenu() {
    this.isMenuOpen = false;
  }
  @HostListener('document:click', ['$event'])
  clickout(event: Event) {
    // Якщо меню відкрите і ми клікнули ПОЗА межами елемента цього компонента
    if (this.isMenuOpen && !this.el.nativeElement.contains(event.target)) {
      this.isMenuOpen = false;
    }
  }

  async saveNewVehicle() {
    // Валідація
    if (!this.newVehicle.name || !this.newVehicle.plate) {
      alert('Будь ласка, заповніть марку та держ. номер!');
      return;
    }
    if (!this.newVehicle.isInstitute) {
      this.newVehicle.linearNorm = this.newVehicle.consumption;
    }
    // Розрахунок наступного ID
    const nextId =
      this.vehicles.length > 0
        ? Math.max(...this.vehicles.map((v) => Number(v.id) || 0)) + 1
        : 1;

    try {
      const vehicleToAdd: Vehicle = {
        ...this.newVehicle,
        id: nextId,
      };

      await this.vehicleService.createVehicle(vehicleToAdd, nextId);

      // Ми НЕ робимо push вручну, бо subscribe у нас реактивний!

      this.closeModal();
      this.newVehicle = this.getEmptyVehicle(); // Очищення через функцію

      // Можна додати невелике сповіщення замість alert
      console.log(`Машину ${vehicleToAdd.name} успішно додано.`);
    } catch (error) {
      console.error('Firebase Error:', error);
      alert('Помилка при збереженні в базу даних.');
    }
  }

  toggleTheme() {
    this.setDarkTheme(!this.isDarkMode);
  }

  private setDarkTheme(isDark: boolean) {
    this.isDarkMode = isDark;
    const theme = isDark ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }

  closeOnOverlayClick(event: MouseEvent): void {
    // Додаткова перевірка, щоб закривати тільки по фону
    if ((event.target as HTMLElement).classList.contains('modal-overlay')) {
      this.closeModal();
    }
  }

  logout() {
    if (confirm('Вийти з системи?')) {
      this.authService.logout();
      this.isMenuOpen = false;
    }
  }
}
