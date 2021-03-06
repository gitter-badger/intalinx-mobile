import {Injectable, Inject} from '@angular/core';
import {Http} from '@angular/http';
import {Observable} from 'rxjs/Observable';
import 'rxjs/Rx';

import {IonicApp, NavController, Alert} from 'ionic-angular';

import {Util} from '../../utils/util';
import {SSO} from '../../utils/sso';

/*
  Generated class for the UserService provider.

  See https://angular.io/docs/ts/latest/guide/dependency-injection.html
  for more info on providers and Angular 2 DI.
*/
export class UserService {

    static get parameters() {
        return [[Http], [IonicApp], [NavController], [Util]];
    }

    constructor(http, app, nav, util) {
        this.http = http;
        this.app = app;
        this.nav = nav;
        this.sso = null;
        this.util = util;
    }

    initializeSSO() {
        return new Promise(resolve => {
            let url = this.app.config.get("BASE_URL") + this.app.config.get("PRE_LOGIN_INFO_URL");
            this.util.callCordysWebserviceWithUrl(url, null).then(data => {
                let xmlConfigData = this.util.parseXml(data);
                this.sso = new SSO(this.util, this.app.config);
                resolve(this.sso);
            });
        });
    }

    getSSO() {
        if (!this.sso) {
            return this.initializeSSO();
        } else {
            return Promise.resolve(this.sso);
        }
    }

    loggedOn() {
        return new Promise(resolve => {
            this.getSSO()
                .then(sso => {
                    resolve(sso.loggedOn());
                });
        });
    }

    authenticate(user) {
        return new Promise(resolve => {
            this.getSSO()
                .then(sso => {
                    return sso.authenticate(user.loginId, user.password);
                })
                .then(authenticationResult => {
                    if (authenticationResult || !authenticationResult) {
                        resolve(authenticationResult);
                    } else {
                        this.app.translate.get(["app.blog.message.error.title", "app.message.error.systemError", "app.action.ok"]).subscribe(message => {
                            let title = message['app.blog.message.error.title'];
                            let ok = message['app.action.ok'];
                            let content = message['app.message.error.systemError'];

                            let alert = Alert.create({
                                title: title,
                                subTitle: content,
                                buttons: [ok]
                            });
                            this.nav.present(alert);
                        });
                    }
                });
        });
    }

    getUserDetail() {
        if (this.data) {
            return Promise.resolve(this.data);
        }
        return new Promise(resolve => {
            this.util.getRequestXml('./assets/requests/get_user_details.xml').then(req => {
                let objRequest = this.util.parseXml(req);
                req = this.util.xml2string(objRequest);
                
                this.util.callCordysWebservice(req).then(data => {
                    let objResponse = this.util.parseXml(data);

                    let userOutput = this.util.selectXMLNode(objResponse, ".//*[local-name()='user']");
                    let user = this.util.xml2json(userOutput).user;
                    
                    let userId = this.util.getUserIdFromAuthUserDn(user.authuserdn);

                    let userAvatarUrl = this.util.getUserAvatarUrlByUserId(userId);
                    let returnData = {
                        "userAvatar": userAvatarUrl,
                        "userName": user.description,
                        "userId": userId
                    }
                    resolve(returnData);
                });
            });
        });
    }

    updateProfile(user) {
        return new Promise(resolve => {
            if (this.validateUserPassword(user.newPassword, user.confirmPassword)) {
            
            this.util.getRequestXml('./assets/requests/set_password.xml').then(req => {
                let objRequest = this.util.parseXml(req);
                this.util.setNodeText(objRequest, ".//*[local-name()='OldPassword']", user.oldPassword);
                this.util.setNodeText(objRequest, ".//*[local-name()='NewPassword']", user.newPassword);
                req = this.util.xml2string(objRequest);

                this.util.callCordysWebservice(req).then(data => {
                    
                    resolve("true");
                });                    
            });
            }
        });
    }

    validateUserPassword(newPassword, confirmPassword) {
        let passwordEmptyFault = newPassword == "" && confirmPassword == "";
        let arePasswordsSame = newPassword == confirmPassword;
        if (passwordEmptyFault) {
            this.app.translate.get(["app.profile.message.error.title", "app.profile.message.error.emptyPassword", "app.action.ok"]).subscribe(message => {
                let title = message['app.profile.message.error.title'];
                let ok = message['app.action.ok'];
                let content = message['app.profile.message.error.emptyPassword'];

                let alert = Alert.create({
                    title: title,
                    subTitle: content,
                    buttons: [ok]
                });
                this.nav.present(alert);
            });
        } else if (!arePasswordsSame) {
            this.app.translate.get(["app.profile.message.error.title", "app.profile.message.error.mismatchPassword", "app.action.ok"]).subscribe(message => {
                let title = message['app.profile.message.error.title'];
                let ok = message['app.action.ok'];
                let content = message['app.profile.message.error.mismatchPassword'];

                let alert = Alert.create({
                    title: title,
                    subTitle: content,
                    buttons: [ok]
                });
                this.nav.present(alert);
            });      
        } 
        return !passwordEmptyFault && arePasswordsSame;
    }
}