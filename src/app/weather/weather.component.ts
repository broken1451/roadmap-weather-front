import { CommonModule } from '@angular/common';
import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { WeatherResponse } from '@interfaces/weather.interfaces';
import { WeatherService } from '@services/weather.service';

@Component({
  selector: 'app-weather',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  templateUrl: './weather.component.html',
  styleUrl: './weather.component.scss'
})
export class WeatherComponent implements OnInit, OnDestroy {

  public readonly weatherService = inject(WeatherService);
  private fb = inject(FormBuilder);
  public countryCode: string = '';
  public Type: string = '';
  public weatherData: WeatherResponse | null = null;

  public celciusFarenheit: { [key: string]: string }[] =[
    {
      value: 'C', viewValue: 'Celcius'
    },
    {
      value: 'F', viewValue: 'Farhenheit'
    }
  ]


  public form: FormGroup = this.fb.group({
    code: ['', [Validators.maxLength(4), Validators.minLength(2)]],
    grade: ['C']
  })

  get formsValue(){
    return this.form.controls;
  }

  constructor() { 
    this.weatherData = JSON.parse(localStorage.getItem('weather')!);
    this.form.controls['code'].valueChanges.subscribe( (value) =>{

      if (value.length == 0) {
        localStorage.removeItem('weather');
        this.weatherData = null;

      }

      if (value.length < 2) {
        return;
      }

      this.countryCode = value.toUpperCase();
      localStorage.setItem('countryCode', this.countryCode);
      console.log (value);
    })
  }

  ngOnInit(): void {
    // debugger
    // console.log ('hola');
    this.weatherService.getWeatherRedis(localStorage.getItem('countryCode')!).subscribe({
      error: (error) => {
        this.weatherData = null;
        localStorage.removeItem('countryCode'); 
        localStorage.removeItem('weather'); 
        console.log (error);
      }
    })
    window.addEventListener('beforeunload', this.handleRefresh);
  }

  ngOnDestroy(): void {
    window.removeEventListener('beforeunload', this.handleRefresh);
  }

  handleRefresh(event: BeforeUnloadEvent) {
    // Aquí puedes agregar la lógica que necesites ejecutar antes del refresh
    console.log('La página se está refrescando');
    
  }

  celsiusToFahrenheit(type: string): any {
    this.Type = type;
    this.weatherData = JSON.parse(localStorage.getItem('weather')!);
    switch (type) {
      case 'C':
        if (this.weatherData) {
          this.weatherData.currentConditions.temp = Math.round((this.weatherData.currentConditions.temp - 32) * 5/9);
          this.weatherData.currentConditions.feelslike =  Math.round((this.weatherData.currentConditions.feelslike - 32) * 5/9);
          this.weatherData.days.forEach((day)=>{
            if (day.tempmax !== undefined) {
              day.tempmax = Math.round((day.tempmax - 32) * 5/9);
            }
            if (day.tempmin !== undefined) {
              day.tempmin = Math.round((day.tempmin - 32) * 5/9);
            }
            return day;
          });

          localStorage.setItem('weather', JSON.stringify(this.weatherData));
        }
        return   this.weatherData;

      case 'F':
        // celsius = (fahrenheit - 32) * 5/9;
        if (this.weatherData) {
            this.weatherData.currentConditions.temp = Math.round((this.weatherData.currentConditions.temp * 9/5) + 32);
            this.weatherData.currentConditions.feelslike = Math.round((this.weatherData.currentConditions.feelslike * 9/5) + 32);
            this.weatherData.days.forEach((day)=>{
              if (day.tempmax !== undefined) {
                day.tempmax = Math.round((day.tempmax * 9/5) + 32);
              }
              if (day.tempmin !== undefined) {
                day.tempmin = Math.round((day.tempmin * 9/5) + 32);
              }
              return day;
            });
            localStorage.setItem('weather', JSON.stringify(  this.weatherData));
        }
        return  this.weatherData;
    }
  }


  checkWeather(){
  
    this.weatherService.getWeatherByCode(this.countryCode).subscribe({
      next: (data) =>{ 
         this.weatherData = data;
       },
       error: (error) => {
        this.weatherData = null;
        localStorage.removeItem('weather'); 
      }

    });
  }

}
