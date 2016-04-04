import {Page, NavController} from 'ionic-angular';

import {NgForm} from 'angular2/common';

import {TranslatePipe} from 'ng2-translate/ng2-translate';
import {Util} from '../../utils/util';

import {UserService} from '../../providers/user-service/user-service';

@Page({
    templateUrl: 'build/pages/profile/profile.html',
    providers: [
        UserService,
        Util
    ],
    pipes: [TranslatePipe]
})
export class ProfilePage {
    static get parameters() {
        return [[NavController], [UserService]];
    }

    constructor(nav, userService) {
        this.nav = nav;
        this.userService = userService;

        this.user = {
            oldPassword: "",
            newPassword: "",
            confirmPassword: ""
        }
    }

    updateProfile() {
        if (this.userService.updateProfile(this.user)) {
            this.nav.pop();
        }
    }
}