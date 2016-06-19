import {Injectable, Inject} from '@angular/core';
import {Http, Headers, RequestOptions} from '@angular/http';
import {Observable} from 'rxjs/Observable';
import 'rxjs/Rx';
import {IonicApp, Platform} from 'ionic-angular';
import {Util} from '../../utils/util';
import {AppVersion} from 'ionic-native';

/*
  Generated class for the AppsService provider.

  See https://angular.io/docs/ts/latest/guide/dependency-injection.html
  for more info on providers and Angular 2 DI.
*/
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
        return AppVersion.getVersionCode();
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
            
            let baseUrl = "http://www.pgyer.com/apiv1/app/install?";
            var parameters = "uKey=3ef865272b876a357bd12b1a0c3b6adc";
            parameters += "&_api_key=61b73e850a3cc863a5d34dfe6d8bed85";
            
            if (this.platform.is('android')) {
                parameters += "&aKey=" + this.app.config.get("PGYER").ANDROID.aKey;
            } else if (this.platform.is('android')) {
                parameters += "&aKey=" + this.app.config.get("PGYER").IOS.aKey;
            } else {
                // parameters += "&aKey=" + this.app.config.get("PGYER").IOS.aKey;
            }
            parameters += "&password=intasect2016";
            
            resolve(baseUrl + parameters);
        });
    }
}

