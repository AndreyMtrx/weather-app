import {effect, Injectable, Signal, signal, untracked} from '@angular/core';
import {Observable, of} from 'rxjs';

import {HttpClient} from '@angular/common/http';
import {CurrentConditions} from './current-conditions/current-conditions.type';
import {ConditionsAndZip} from './conditions-and-zip.type';
import {City, Forecast, List} from './forecasts-list/forecast.type';
import {LOCATIONS, LocationService} from './location.service';
import {first, tap} from 'rxjs/operators';
import {LocalStorageService} from './local-storage.service';

export const CONDITIONS : string = "conditions";
export const FORECAST : string = "forecast";

@Injectable({
  providedIn: 'root',
})
export class WeatherService {
  static URL = 'http://api.openweathermap.org/data/2.5';
  static APPID = '5a4b2d457ecbef9eb2a71e480b947604';
  static ICON_URL = 'https://raw.githubusercontent.com/udacity/Sunshine-Version-2/sunshine_master/app/src/main/res/drawable-hdpi/';
  static cacheDuration = 7200;

  private currentConditions = signal<ConditionsAndZip[]>([]);

  constructor(private http: HttpClient, private locationService: LocationService, private localStorageService: LocalStorageService) {
    effect(() => {
      locationService.locations().forEach(zipcode => {
        untracked(() => {
          if (!this.currentConditions().some(condition => condition.zip === zipcode)) {
            this.addCurrentConditions(zipcode);
          }
        })
      });

      untracked(() => {
        this.currentConditions().forEach(condition => {
          if (!locationService.locations().includes(condition.zip)) {
            this.removeCurrentConditions(condition.zip);
          }
        });
      });
    }, { allowSignalWrites: true });
  }

  private addCurrentConditions(zipcode: string): void {
    const localCurrentCondition = this.localStorageService.getItem(CONDITIONS + zipcode);

    if (localCurrentCondition) {
      this.currentConditions.update(conditions => [...conditions, { zip: zipcode, data: localCurrentCondition.data }]);
      return;
    }

    const url = `${WeatherService.URL}/weather?zip=${zipcode},us&units=imperial&APPID=${WeatherService.APPID}`;
    this.http.get<CurrentConditions>(url)
        .subscribe(data => {
          this.localStorageService.setItem(CONDITIONS + zipcode, { zip: zipcode, data }, WeatherService.cacheDuration);
          this.currentConditions.update(conditions => [...conditions, { zip: zipcode, data }]);
        });
  }

  private removeCurrentConditions(zipcode: string) {
    this.currentConditions.update(conditions => {
      for (let i in conditions) {
        if (conditions[i].zip === zipcode)
          conditions.splice(+i, 1);
          this.localStorageService.removeItem(CONDITIONS + zipcode)
          this.localStorageService.removeItem(FORECAST + zipcode);
      }
      return conditions;
    })
  }

  getCurrentConditions(): Signal<ConditionsAndZip[]> {
    return this.currentConditions.asReadonly();
  }

  getForecast(zipcode: string): Observable<Forecast> {
    const localForecast = this.localStorageService.getItem(FORECAST + zipcode);

    if (localForecast) {
      return of(localForecast);
    }

    return this.http.get<Forecast>(`${WeatherService.URL}/forecast/daily?zip=${zipcode},us&units=imperial&cnt=5&APPID=${WeatherService.APPID}`)
        .pipe(
            tap(forecast => this.localStorageService.setItem(FORECAST + zipcode, { ...forecast }, WeatherService.cacheDuration))
        );
  }

  getWeatherIcon(id): string {
    if (id >= 200 && id <= 232)
      return WeatherService.ICON_URL + "art_storm.png";
    else if (id >= 501 && id <= 511)
      return WeatherService.ICON_URL + "art_rain.png";
    else if (id === 500 || (id >= 520 && id <= 531))
      return WeatherService.ICON_URL + "art_light_rain.png";
    else if (id >= 600 && id <= 622)
      return WeatherService.ICON_URL + "art_snow.png";
    else if (id >= 801 && id <= 804)
      return WeatherService.ICON_URL + "art_clouds.png";
    else if (id === 741 || id === 761)
      return WeatherService.ICON_URL + "art_fog.png";
    else
      return WeatherService.ICON_URL + "art_clear.png";
  }
}
