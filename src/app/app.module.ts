import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { environment } from '../environments/environment';

// Компоненти
import { VehicleListComponent } from './components/vehicle-list/vehicle-list.component';
import { VehicleDetailComponent } from './components/vehicle-detail/vehicle-detail.component';
import { HeaderComponent } from './components/header/header.component';
import { VehicleHistoryComponent } from './components/vehicle-history/vehicle-history.component';
import { LoaderComponent } from './components/loader/loader.component';
import { AuthComponent } from './components/auth/auth.component';

// Нові модулі Firebase (Modular SDK) - САМЕ ЦЬОГО НЕ ВИСТАЧАЛО
import { provideFirebaseApp, initializeApp } from '@angular/fire/app';
import { provideAuth, getAuth } from '@angular/fire/auth';
import { provideFirestore, getFirestore } from '@angular/fire/firestore';

// Старі модулі (залишаємо для сумісності, якщо потрібно)
import { AngularFireModule } from '@angular/fire/compat';
import { AngularFireAuthModule } from '@angular/fire/compat/auth';
import { AngularFireDatabaseModule } from '@angular/fire/compat/database';
import { VehicleInfoComponent } from './components/vehicle-info/vehicle-info.component';
import { VehicleAllHistoryComponent } from './components/vehicle-all-history/vehicle-all-history.component';
import { HistoryTableComponent } from './components/shared/history-table/history-table.component';
import { InstituteSettingsComponent } from './components/institute-settings/institute-settings.component';

@NgModule({
  declarations: [
    AppComponent,
    VehicleListComponent,
    VehicleDetailComponent,
    HeaderComponent,
    VehicleHistoryComponent,
    LoaderComponent,
    AuthComponent,
    VehicleInfoComponent,
    VehicleAllHistoryComponent,
    HistoryTableComponent,
    InstituteSettingsComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    ReactiveFormsModule,

    // 1. Ініціалізація Firebase App (Новий стиль)
    provideFirebaseApp(() => initializeApp(environment.firebase)),

    // 2. Надаємо Auth та Firestore для DI (Dependency Injection)
    provideAuth(() => getAuth()),
    provideFirestore(() => getFirestore()),

    // Старий стиль (можна залишити, щоб нічого не зламалося в інших частинах)
    AngularFireModule.initializeApp(environment.firebase),
    AngularFireAuthModule,
    AngularFireDatabaseModule,
  ],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
