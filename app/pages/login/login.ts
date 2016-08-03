// Third party library.
import {Component} from '@angular/core';
import {NavController, ViewController, Alert} from 'ionic-angular';

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
        autoLogin: false,
        server: this.appConfig.get('BASE_URL')
    };

    servers: any = [
        {
            id: 'iscsys',
            url : this.appConfig.get('BASE_URL_JAPAN'),
            name: ''
        },
        {
            id: 'intalinx_cn',
            url : this.appConfig.get('BASE_URL_CHINA'),
            name: ''
        }
    ];

    isDisabled: boolean = true;

    constructor(private nav: NavController, private appConfig: AppConfig, private userService: UserService, private translate: TranslateService, private util: Util) {
        // set default server.
        this.translate.get(['app.login.iscsys', 'app.login.intalinx_cn']).subscribe(message => {
            this.servers.forEach(element => {
                element.name = message['app.login.' + element.id];
            });
        });
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
        this.appConfig.set('BASE_URL', this.user.server);
        this.userService.authenticate(this.user.loginID, this.user.password).then(authenticationResult => {
            if (authenticationResult) {
                if (this.user.autoLogin) {
                    this.userService.enableAutoLogin(this.user.loginID, this.user.password, this.user.server);
                } else {
                    this.userService.disableAutoLogin();
                }
                this.redirectToPortal();
            } else if (!authenticationResult) {
                this.isDisabled = null;
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
        if (this.user.loginID && this.user.password && this.user.server) {
            this.isDisabled = null;
        } else {
            this.isDisabled = true;
        }
    }
}