import {Page, NavController} from 'ionic-angular';

import {NgForm} from 'angular2/common';

import {TranslatePipe} from 'ng2-translate/ng2-translate';

import {UserService} from '../../providers/user-service/user-service';
import {PortalPage} from '../portal/portal';

@Page({
    templateUrl: 'build/pages/login/login.html',
    providers: [
        UserService
    ],
    pipes: [TranslatePipe]
})
export class LoginPage {
    static get parameters() {
        return [[NavController], [UserService]];
    }

    constructor(nav, userService) {
        this.nav = nav;
        this.userService = userService;

        this.user = {
            loginId: "",
            password: "",
            rememberMe: false
        }
    }

    login() {
        if (this.userService.authenticate(this.user)) {
            this.nav.setRoot(PortalPage, {
                "loginId": this.user.loginId
            });
        }
    }
}