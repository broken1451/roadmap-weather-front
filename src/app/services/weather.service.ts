import { HttpClient } from '@angular/common/http';
import { computed, inject, Injectable, signal } from '@angular/core';

import { catchError, Observable, tap } from 'rxjs';

import { WeatherResponse } from '@interfaces/weather.interfaces';
import { environment } from '@enviroments/environment';


@Injectable({
  providedIn: 'root'
})
export class WeatherService {
    
  private readonly httpClient = inject(HttpClient);
  private _weather = signal<WeatherResponse | null | undefined >(null);
  public weather = computed(() => this._weather());

  constructor() { }

  getWeatherByCode(code: string): Observable<WeatherResponse | any> {
    return this.httpClient.get<WeatherResponse>(`${environment.apiUrl}/api/weather/getWeather/${code}`).pipe(
      tap((weather) => {
        console.log (weather);
        this._weather.set(weather);
        localStorage.setItem('weather', JSON.stringify(weather));
      }),
      catchError( (error) =>{
        console.log (error);
        this._weather.set(null);
        return error;
      })
    )
  }

  getWeatherRedis(code: string) {
    console.log (code);
    return this.httpClient.get<WeatherResponse>(`${environment.apiUrl}/api/weather/${code}`).pipe(
      tap((weather) => {
        console.log (weather);
        this._weather.set(weather);
        localStorage.setItem('weather', JSON.stringify(weather));
      }),
      catchError( (error) =>{
        console.log (error);
        return error;
      })
    )
  }

 


}
