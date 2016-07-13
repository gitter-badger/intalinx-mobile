import {Http} from '@angular/http';
import {IonicApp, NavController, Alert} from 'ionic-angular';
import {Util} from '../utils/util';
import {SSO} from '../utils/sso';

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
        
        this.userAvatarImageUrl = this.app.config.get("USER_AVATAR_IMAGE_URL");
        this.userAvatarDefaultImage = this.app.config.get("USER_AVATAR_DEFAULT_IMAGE");
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

    getUserDetails() {
        return new Promise(resolve => {
            this.util.getRequestXml('./assets/requests/get_user_details.xml').then(req => {
                let objRequest = this.util.parseXml(req);
                req = this.util.xml2string(objRequest);
                this.util.callCordysWebservice(req).then(data => {
                    let objResponse = this.util.parseXml(data);
                    let userOutput = this.util.selectXMLNode(objResponse, ".//*[local-name()='User']");
                    let originalUser = this.util.xml2json(userOutput).User;
                    let userAvatar = originalUser.ContactInformation.address;
                    if (!userAvatar) {
                        userAvatar = this.userAvatarImageUrl + this.userAvatarDefaultImage;
                    }
                    let user = {
                        "userId": originalUser.UserName,
                        "userName": originalUser.Description,
                        "email": originalUser.ContactInformation.email,
                        "phone": originalUser.ContactInformation.phone,
                        "fax": originalUser.ContactInformation.fax,
                        "userAvatar": userAvatar,
                        "company": originalUser.ContactInformation.company
                    }
                    resolve(user);
                });
            });
        });
    }

    setUserDetails(user) {
        return new Promise(resolve => {
            this.util.getRequestXml('./assets/requests/set_user_details.xml').then(req => {
                let objRequest = this.util.parseXml(req);
                this.util.setNodeText(objRequest, ".//*[local-name()='Description']", user.userName);
                this.util.setNodeText(objRequest, ".//*[local-name()='email']", user.email);
                this.util.setNodeText(objRequest, ".//*[local-name()='phone']", user.phone);
                this.util.setNodeText(objRequest, ".//*[local-name()='fax']", user.fax);
                this.util.setNodeText(objRequest, ".//*[local-name()='address']", user.userAvatar);
                this.util.setNodeText(objRequest, ".//*[local-name()='company']", user.company);
                req = this.util.xml2string(objRequest);

                this.util.callCordysWebservice(req).then(data => {
                    resolve(user);
                });
            });
        });
    }

    changeUserAvatar(userAvatar) {
        return new Promise(resolve => {
            this.getUserDetails().then(user => {
                user.userAvatar = userAvatar;
                this.setUserDetails(user).then(user => {
                    resolve(user);
                });
            });
        });
    }
    
    getUserId() {
        if (this.user) {
            return Promise.resolve(this.user.userId);
        }
        return new Promise(resolve => {
            this.getUserDetails().then(user => {
                resolve(user.userId);
            });
        });
    }
}