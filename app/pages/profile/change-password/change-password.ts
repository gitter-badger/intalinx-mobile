// Third party library.
import {Injectable, Component} from '@angular/core';
import {NavController, ViewController, Platform} from 'ionic-angular';
import {NgForm} from '@angular/common';
import {TranslatePipe} from 'ng2-translate/ng2-translate';

// Utils.
import {Util} from '../../../utils/util';

// Services.
import {UserService} from '../../../providers/user-service';

@Component({
    templateUrl: 'build/pages/profile/change-password/change-password.html',
    providers: [
        UserService,
        Util
    ],
    pipes: [TranslatePipe]
})
export class ChangePasswordPage {
    private user: any;
    private isDisabled: boolean;

    constructor(private nav: NavController,
        private view: ViewController,
        private userService: UserService,
        private platform: Platform) {


        this.user = {
            oldPassword: '',
            newPassword: '',
            confirmPassword: ''
        };
    }

    updateProfile() {
        this.isDisabled = true;
        this.userService.updateProfile(this.user).then(data => {
            if (data === 'true') {
                this.nav.pop();
            }
        });
    }

    changePassword() {
        if (this.user.oldPassword && this.user.newPassword && this.user.confirmPassword) {
            this.isDisabled = null;
        } else {
            this.isDisabled = true;
        }
    }
}