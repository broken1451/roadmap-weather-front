import { Routes } from '@angular/router';

export const routes: Routes = [
    
    {
        path: 'home',
        title: 'Home',
        loadComponent: () => import('./weather/weather.component').then(m => m.WeatherComponent)
    },
    {
        path: '**',
        redirectTo: 'home',
        pathMatch: 'full'
    }
];
