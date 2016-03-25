import {Injectable, Inject} from 'angular2/core';
import {Http} from 'angular2/http';
import {Observable} from 'rxjs/Observable';
import 'rxjs/Rx';

import {IonicApp} from 'ionic-angular';

import {Util} from '../../utils/util';

/*
  Generated class for the UserService provider.

  See https://angular.io/docs/ts/latest/guide/dependency-injection.html
  for more info on providers and Angular 2 DI.
*/
export class UserService {
    
    static get parameters() {
        return [[Http], [IonicApp]];
    }

    constructor(http, app) {
        this.http = http;
        this.app = app;
    }

    initSSO() {
        return new Promise(resolve => {
            let url = this.app.config.get("BASE_URL") + this.app.config.get("PRE_LOGIN_INFO_URL");
            this.http.post(url)
                .map(res => res.text())
                .subscribe(data => {
                    this.data = Util.xml2json(data);
                    resolve(this.data);
                });
        });
        /*
        $.ajax({
            url: _baseURL + BizNaviUtil.constants.PRE_LOGIN_INFO_URL,
            cache: false,
            async: false
        }).then(function(xml) {
            var samlArtifactCookieName = BizNaviUtil.getNodeText(xml, ".//*[local-name()='SamlArtifactCookieName']");
            var baseUrlPath = BizNaviUtil.getNodeText(xml, ".//*[local-name()='BaseUrlPath']");
            var samlArtifactCookiePath = BizNaviUtil.getNodeText(xml, ".//*[local-name()='SamlArtifactCookiePath']");
            var checkName = BizNaviUtil.getNodeText(xml, ".//*[local-name()='CheckName']");
            BizNaviUtil.sso._obj = {
                baseUrlPath: baseUrlPath,
                samlArtifactCookieName: samlArtifactCookieName,
                samlArtifactCookiePath: samlArtifactCookiePath,
                checkName: checkName,
                useSamlCookieArtifact: (!samlArtifactCookieName) ? false : true,
                useSamlUrlArtifact: (!samlArtifactCookieName) ? true : false,
            };
        });
        */
    }

    authenticate(user) {
        this.initSSO();



        return true;
    }

    getUserDetail() {
        if (this.data) {
            // already loaded data
            return Promise.resolve(this.data);
        }

        // don't have the data yet
        return new Promise(resolve => {
            // We're using Angular Http provider to request the data,
            // then on the response it'll map the JSON data to a parsed JS object.
            // Next we process the data and resolve the promise with the new data.
            this.http.get('./mocks/userservice/getuserdetail.json')
                .map(res => res.json())
                .subscribe(data => {
                    // we've got back the raw data, now generate the core schedule data
                    // and save the data for later reference
                    this.data = data;
                    resolve(this.data);
                });
        });
    }

    updateProfile(profile) {
        return true;
    }
}

