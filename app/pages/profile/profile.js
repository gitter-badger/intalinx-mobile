import {IonicApp, Page, NavController, ViewController, Platform} from 'ionic-angular';

import {NgForm} from '@angular/common';

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
        return [[IonicApp], [NavController], [UserService], [ViewController], [Platform]];
    }

    constructor(app, nav, userService, view, platform) {
        this.app = app;
        this.nav = nav;
        this.userService = userService;
        this.view = view;
        this.platform = platform;

        this.user = {
            oldPassword: "",
            newPassword: "",
            confirmPassword: ""
        }
    }

    updateProfile() {
        this.isDisabled = true;
        this.userService.updateProfile(this.user).then(data => {
            if (data == "true") {
                this.nav.pop();
            }
        });
    }

    onPageWillEnter() {
        if (this.platform.is('ios')) {
            this.app.translate.get(["app.action.back"]).subscribe(message => {
                let title = message['app.action.back'];
                this.view.setBackButtonText(title);
            });
        }
        this.isDisabled = true;
    }
    
    changePassword() {
        if (this.user.oldPassword && this.user.newPassword && this.user.confirmPassword) {
            this.isDisabled = null;
        } else {
            this.isDisabled = true;
        }
        
    }
}