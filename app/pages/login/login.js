import {Page, IonicApp, NavController, Alert, Storage, LocalStorage} from 'ionic-angular';

import {NgForm} from '@angular/common';

import {TranslatePipe} from 'ng2-translate/ng2-translate';

import {UserService} from '../../providers/user-service/user-service';
import {Util} from '../../utils/util';
import {PortalPage} from '../portal/portal';

@Page({
    templateUrl: 'build/pages/login/login.html',
    providers: [
        UserService,
        Util
    ],
    pipes: [TranslatePipe]
})
export class LoginPage {
    
    static get constants() {
        return {
            LOGIN_ID_STORAGE_NAME: "loginId"
        }
    }
    
    static get parameters() {
        return [[IonicApp], [NavController], [UserService]];
    }

    constructor(app, nav, userService) {
        this.nav = nav;
        this.app = app;
        this.userService = userService;
        this.local = new Storage(LocalStorage);

        this.user = {
            loginId: "",
            password: "",
            rememberLoginId: false
        }
    }

    ngOnInit() {
        // If use already logged on, then redirect to portal page.
        this.loggedOn();
    }

    loggedOn() {
        this.userService.loggedOn().then(isLoggedOn => {
            if (isLoggedOn) {
                this.redirectToPortal();
            }
        });
    }

    login() {
        this.isDisabled = true;
        this.userService.authenticate(this.user).then(authenticationResult => {
            if (authenticationResult) {
                if (this.user.rememberLoginId) {
                    this.local.set(LoginPage.constants.LOGIN_ID_STORAGE_NAME, this.user.loginId);
                } else {
                    this.local.remove(LoginPage.constants.LOGIN_ID_STORAGE_NAME);
                }
                this.redirectToPortal();
            } else if (!authenticationResult) {
                this.app.translate.get(["app.login.message.error.title", "app.login.message.error.idOrPasswordNotCorrect", "app.action.ok"]).subscribe(message => {
                    let title = message['app.login.message.error.title'];
                    let ok = message['app.action.ok'];
                    let content = message['app.login.message.error.idOrPasswordNotCorrect'];

                    let alert = Alert.create({
                        title: title,
                        subTitle: content,
                        buttons: [ok]
                    });
                    this.nav.present(alert);
                });
            }
        });
    }

    redirectToPortal() {
        this.nav.setRoot(PortalPage);
    }
    
    onPageWillEnter() {
        this.isDisabled = true;
    }
    
    onPageDidEnter() {
        this.local.get(LoginPage.constants.LOGIN_ID_STORAGE_NAME).then(value => {
            if (value != null) {
                this.user.loginId = value;
                this.user.rememberLoginId = true;
            }
        });
    }
    
    changeUser() {
        if (this.user.loginId && this.user.password) {
            this.isDisabled = null;
        } else {
            this.isDisabled = true;
        }
    }
}