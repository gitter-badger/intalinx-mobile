// Third party library.
import {Injectable} from '@angular/core';
import {Storage, LocalStorage, SqlStorage} from 'ionic-angular';

// Config.
import {AppConfig} from '../appconfig';

@Injectable()
export class StorageUtil {

    storage: Storage = new Storage(SqlStorage);

    constructor(private appConfig: AppConfig) {

    }

    set(key, value) {
        return this.storage.set(key, value);
    }

    get(key) {
        return this.storage.get(key);
    }

    remove(key) {
        this.storage.remove(key);
    }
}