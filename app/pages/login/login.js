import {Page, IonicApp, NavController, Alert} from 'ionic-angular';

import {NgForm} from 'angular2/common';

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
    static get parameters() {
        return [[IonicApp], [NavController], [UserService]];
    }

    constructor(app, nav, userService) {
        this.nav = nav;
        this.app = app;
        this.userService = userService;

        this.user = {
            loginId: "",
            password: ""
            // rememberMe: false
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
        this.userService.authenticate(this.user).then(authenticationResult => {
            if (authenticationResult) {
                this.redirectToPortal();
            } else {
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
}