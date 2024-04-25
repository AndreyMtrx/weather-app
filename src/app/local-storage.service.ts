import {Injectable} from '@angular/core';

@Injectable({
    providedIn: 'root',
})
export class LocalStorageService {
    setItem(key: string, value: any, expirationTimeInSeconds?: number): void {
        const now = new Date();
        const item = {
            value: value,
            expirationTime: expirationTimeInSeconds ? now.getTime() + expirationTimeInSeconds * 1000 : null
        };
        localStorage.setItem(key, JSON.stringify(item));
    }

    getItem(key: string): any {
        const item = localStorage.getItem(key);
        if (item !== null) {
            const parsedItem = JSON.parse(item);
            if (parsedItem && (!parsedItem.expirationTime || new Date().getTime() < parsedItem.expirationTime)) {
                return parsedItem.value;
            } else {
                this.removeItem(key);
                return null;
            }
        } else {
            return null;
        }
    }

    removeItem(key: string): void {
        localStorage.removeItem(key);
    }
}
