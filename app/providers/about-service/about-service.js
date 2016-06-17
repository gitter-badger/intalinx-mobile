import {Injectable, Inject} from '@angular/core';
import {Http} from '@angular/http';
import {Observable} from 'rxjs/Observable';
import 'rxjs/Rx';
import {IonicApp} from 'ionic-angular';
import {Util} from '../../utils/util';

/*
  Generated class for the AppsService provider.

  See https://angular.io/docs/ts/latest/guide/dependency-injection.html
  for more info on providers and Angular 2 DI.
*/
export class AboutService {

    static get parameters() {
        return [[Http], [IonicApp], [Util]];
    }

    constructor(http, app, util) {
        this.http = http;
        this.app = app;
        this.infoData = null;
        this.util = util;
    }
    
    getVersionInfos() {
        if (this.infoData) {
            // already loaded data
            return Promise.resolve(this.infoData);
        }
        return new Promise(resolve => {
            // let url = "http://www.pgyer.com/apiv1/app/view";
            // let paras = {
            //     "aKey": "fc3b14ea79e4eb9e731c64f72a71ff2c",
            //     "uKey": "61b73e850a3cc863a5d34dfe6d8bed85",
            //     "_api_key": "61b73e850a3cc863a5d34dfe6d8bed85"
            // }
             
            // let url = "http://www.pgyer.com/apiv1/app/builds";
            // 自分がアップロードしたすべてのアプリケーションを取得するapi
            let url = "http://www.pgyer.com/apiv1/user/listMyPublished";
            let headers = new Headers({ 'Content-Type': 'application/x-www-form-urlencoded' });
            debugger
            var parameters = new FormData();
            parameters.append("uKey", "3ef865272b876a357bd12b1a0c3b6adc");
            parameters.append("page", "1");
            parameters.append("_api_key", "61b73e850a3cc863a5d34dfe6d8bed85");
            // JSON.stringify(data)
            this.http.post(url, parameters, {
                headers: headers
            })
                .map(res => res.json())
                .subscribe(data => {
                    debugger
                    resolve(data);
                }, error => {
                    this.util.presentSystemErrorModal();
                });
        });
    }
}

