import {computed, Injectable, signal} from '@angular/core';
import {WeatherService} from "./weather.service";
import {Observable, Subject} from 'rxjs';
import {LocalStorageService} from './local-storage.service';

export const LOCATIONS : string = "locations";

@Injectable({
  providedIn: 'root',
})
export class LocationService {
  private locations$ = signal<Array<string>>([]);
  public locations = computed(this.locations$);

  constructor(private localStorageService: LocalStorageService) {
    let locations = localStorageService.getItem(LOCATIONS);

    if (locations) {
      this.locations$.set(locations);
    }
  }

  addLocation(zipcode: string) {
    this.locations$.update(locations => [...locations, zipcode]);
    this.localStorageService.setItem(LOCATIONS, this.locations$());
  }

  removeLocation(zipcode: string) {
    let index = this.locations$().indexOf(zipcode);
    if (index !== -1) {
      this.locations$.update(locations => [...locations.filter(location => location !== zipcode)]);
      this.localStorageService.setItem(LOCATIONS, this.locations$());
    }
  }
}
