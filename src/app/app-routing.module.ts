import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { VehicleListComponent } from './components/vehicle-list/vehicle-list.component';
import { VehicleDetailComponent } from './components/vehicle-detail/vehicle-detail.component';
import { VehicleHistoryComponent } from './components/vehicle-history/vehicle-history.component';
import { AuthComponent } from './components/auth/auth.component';
import { AuthGuard } from './services/Auth/auth.guard';
import { VehicleAllHistoryComponent } from './components/vehicle-all-history/vehicle-all-history.component';

const routes: Routes = [
  { path: 'login', component: AuthComponent }, // Шлях для логіна
  {
    path: '',
    component: VehicleListComponent,
    canActivate: [AuthGuard],
    pathMatch: 'full',
  }, // Головна сторінка
  {
    path: 'vehicle/:id',
    component: VehicleDetailComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'vehicle/:id/history',
    component: VehicleHistoryComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'statistics',
    component: VehicleAllHistoryComponent,
  },
  // завжди знизу
  { path: '**', redirectTo: 'login' }, // Якщо шлях невідомий — на логін
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
