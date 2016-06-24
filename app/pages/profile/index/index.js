import {Page, IonicApp, NavController, ViewController, Platform} from 'ionic-angular';

import {TranslatePipe} from 'ng2-translate/ng2-translate';

import {ChangePasswordPage} from '../change-password/change-password';
import {ChangeAvatarPage} from '../change-avatar/change-avatar';

import {UserService} from '../../../providers/user-service/user-service';
import {Util} from '../../../utils/util';

@Page({
    templateUrl: 'build/pages/profile/index/index.html',
    providers: [
        UserService,
        Util
    ],
    pipes: [TranslatePipe]
})
export class ProfileIndexPage {
    static get parameters() {
        return [[IonicApp], [NavController], [UserService], [ViewController], [Platform]];
    }

    constructor(app, nav, userService, view, platform) {
        this.app = app;
        this.nav = nav;
        this.userService = userService;
        this.view = view;
        this.platform = platform;

        this.userAvatarImageUrl = this.app.config.get("USER_AVATAR_IMAGE_URL");
        this.userAvatarDefaultImage = this.app.config.get("USER_AVATAR_DEFAULT_IMAGE");

        this.user = {
            "userAvatar": this.userAvatarImageUrl + this.userAvatarDefaultImage
        };
    }

    onPageWillEnter() {
        this.isLoadCompleted = false;
        this.userService.getUserDetailsFromUser().then(data => {
            this.user = data;
            this.app.user.userAvatar = data.userAvatar;
            this.isLoadCompleted = true;
        });
        if (this.platform.is('ios')) {
            this.app.translate.get(["app.action.back"]).subscribe(message => {
                let title = message['app.action.back'];
                this.view.setBackButtonText(title);
            });
        }
    }

    openChangeAvatar(user) {
        this.nav.push(ChangeAvatarPage, {
            "user": user
        });
    }

    openChangePassword() {
        this.nav.push(ChangePasswordPage);
    }
}
