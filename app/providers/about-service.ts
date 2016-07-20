// Third party library.
import {Http, Headers, RequestOptions} from '@angular/http';
import {Platform} from 'ionic-angular';
import {AppVersion} from 'ionic-native';

// Config.
import {AppConfig} from '../appconfig';

// Utils.
import {Util} from '../utils/util';

export class AboutService {

    constructor(private http: Http, private platform: Platform, private util: Util, private appConfig: AppConfig) {
    }

    getVersion(): any {
        return AppVersion.getVersionNumber();
    }

    getLatestVersion(): any {
        return new Promise<string>(resolve => {
            // Get app version from pgyer.
            let url = 'http://www.pgyer.com/apiv1/app/view';
            let headers = new Headers({ 'Content-Type': 'application/x-www-form-urlencoded' });
            var parameters = 'uKey=3ef865272b876a357bd12b1a0c3b6adc';
            parameters += '&_api_key=61b73e850a3cc863a5d34dfe6d8bed85';
            parameters += '&aKey=c6a2b64fb666d2535a6c280daf70f806';

            this.http.post(url, parameters, {
                headers: headers
            })
                .map(res => res.json())
                .subscribe(data => {
                    resolve(data.data.appVersion);
                }, error => {
                    this.util.presentSystemErrorModal();
                });
        });
    }

    getUpgradeUrl(): any {
        return new Promise<string>(resolve => {
            let url = '';
            if (this.platform.is('android')) {
                url = this.appConfig.get('PGYER_ANDROID_URL');
            } else if (this.platform.is('ios')) {
                url = this.appConfig.get('PGYER_IOS_URL');
            } else {
                // parameters += '&aKey=' + this.app.config.get('PGYER').IOS.aKey;
            }
            resolve(url);
        });
    }
}

