// Third party library.
import {Injectable} from '@angular/core';
import {Http} from '@angular/http';
import {Platform} from 'ionic-angular';
import {AppVersion} from 'ionic-native';

// Config.
import {AppConfig} from '../app/app.config';

// Utils.
import {Util} from '../utils/util';

@Injectable()
export class AboutService {

    constructor(private http: Http, private platform: Platform, private util: Util, private appConfig: AppConfig) {
    }

    getVersion(): any {
        return AppVersion.getVersionNumber();
    }

    getLatestVersion(): any {
        return new Promise<string>(resolve => {
            // Get app version from pgyer.
            //let url = 'http://www.pgyer.com/apiv1/app/viewGroup';
            //let headers = new Headers({ 'Content-Type': 'application/x-www-form-urlencoded' });
            //let parameters = 'aId=3faa45a6bbc5cb46c195ba94b01ac85a';
            //parameters += '&_api_key=61b73e850a3cc863a5d34dfe6d8bed85';

            //this.http.post(url, parameters, {
            //    headers: headers
            // })
            let url = 'https://intasect.github.io/version.json';
            this.http.get(url)
                .map(res => res.json())
                .subscribe(data => {
                    resolve(data.version);
                }, error => {
                    this.util.presentSystemErrorModal();
                });
        });
    }

    getUpgradeUrl(): any {
        return new Promise<string>(resolve => {
            let url = '';
            if (this.appConfig.get('BASE_URL') === this.appConfig.get('BASE_URL_JAPAN')) {
                url = this.appConfig.get('DOWNLOAD_URL_JAPAN');
            } else {
                url = this.appConfig.get('DOWNLOAD_URL_CHINA');
            }
            resolve(url);
        });
    }
}

