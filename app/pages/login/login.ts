// Third party library.
import {Injectable, Component} from '@angular/core';
import {NavController, ViewController, Popover, Alert} from 'ionic-angular';

// Utils.
import {Util} from '../../utils/util';

// Config.
import {AppConfig} from '../../appconfig';

// Services.
import {TranslateService} from 'ng2-translate/ng2-translate';
import {UserService} from '../../providers/user-service';

// Pages.
import {PortalPage} from '../portal/portal';

@Component({
    templateUrl: 'build/pages/login/login.html',
    providers: [
        UserService
    ]
})
export class LoginPage {
    public user: any = {
        loginID: '', 
        password: '', 
        autoLogin: false
    };

    isDisabled: boolean = true;

    constructor(private nav: NavController, private userService: UserService, private translate: TranslateService, private util: Util) {
    }

    loggedOn() {
        this.userService.loggedOn().then((isLoggedOn: boolean) => {
            if (isLoggedOn) {
                this.redirectToPortal();
            }
        });
    }

    login() {
        this.isDisabled = true;
        this.userService.authenticate(this.user.loginID, this.user.password).then(authenticationResult => {
            if (authenticationResult) {
                if (this.user.autoLogin) {
                    this.userService.enableAutoLogin(this.user.loginID, this.user.password);
                } else {
                    this.userService.disableAutoLogin();
                }
                this.redirectToPortal();
            } else if (!authenticationResult) {
                this.translate.get(['app.login.message.error.title', 'app.login.message.error.idOrPasswordNotCorrect', 'app.action.ok']).subscribe(message => {
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
    
    ionViewWillEnter() {
        this.isDisabled = true;
    }
    
    ionViewDidEnter() {
        // If use already logged on, then redirect to portal page.
        this.loggedOn();
    }
    
    changeUser(): void {
        if (this.user.loginID && this.user.password) {
            this.isDisabled = null;
        } else {
            this.isDisabled = true;
        }
    }

    presentPopover(event) {
        let popover = Popover.create(ServerInfoPage);
        this.nav.present(popover, {
            ev: event
        });
    }
}

@Component({
  template: `
    <ion-list>
      <ion-item>{{ server }}</ion-item>
    </ion-list>
  `
})
export class ServerInfoPage {
    private server: string;
    constructor(private viewCtrl: ViewController, private appConfig: AppConfig) {
        this.server = this.appConfig.get('BASE_URL');
    }

    close() {
        this.viewCtrl.dismiss();
    }
}