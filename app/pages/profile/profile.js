import {IonicApp, Page, NavController, ViewController} from 'ionic-angular';

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
        return [[IonicApp], [NavController], [UserService], [ViewController]];
    }

    constructor(app, nav, userService, view) {
        this.app = app;
        this.nav = nav;
        this.userService = userService;
        this.view = view;

        this.user = {
            oldPassword: "",
            newPassword: "",
            confirmPassword: ""
        }
    }

    updateProfile() {
        this.userService.updateProfile(this.user).then(data => {
            if (data == "true") {
                this.nav.pop();
            }
        });
    }
    
    onPageWillEnter() {
        this.app.translate.get(["app.action.back"]).subscribe(message => {
            let title = message['app.action.back']; 
            this.view.setBackButtonText(title);
        });
    }
}