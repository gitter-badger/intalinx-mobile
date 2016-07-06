import {Injectable, Inject} from '@angular/core';
import {Http, Headers, RequestOptions} from '@angular/http';
import {Observable} from 'rxjs/Observable';
import 'rxjs/Rx';
import {IonicApp, Platform} from 'ionic-angular';
import {Util} from '../../utils/util';
import {AppVersion} from 'ionic-native';

export class AboutService {

    static get parameters() {
        return [[Http], [IonicApp], [Platform], [Util]];
    }

    constructor(http, app, platform, util) {
        this.http = http;
        this.app = app;
        this.platform = platform;
        this.infoData = null;
        this.util = util;
    }
    
    getVersion() {
        return AppVersion.getVersionNumber();
    }

    getLatestVersion() {
        return new Promise(resolve => {
            // Get app version from pgyer.
            let url = "http://www.pgyer.com/apiv1/app/view";
            let headers = new Headers({ 'Content-Type': 'application/x-www-form-urlencoded' });
            var parameters = "uKey=3ef865272b876a357bd12b1a0c3b6adc";
            parameters += "&_api_key=61b73e850a3cc863a5d34dfe6d8bed85";
            parameters += "&aKey=c6a2b64fb666d2535a6c280daf70f806";

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

    getUpgradeUrl() {
        return new Promise(resolve => {
            let url = "";
            if (this.platform.is('android')) {
                url = this.app.config.get("PGYER").ANDROID.url;
            } else if (this.platform.is('ios')) {
                url = this.app.config.get("PGYER").ANDROID.url;
            } else {
                // parameters += "&aKey=" + this.app.config.get("PGYER").IOS.aKey;
            }
            resolve(url);
        });
    }
}

