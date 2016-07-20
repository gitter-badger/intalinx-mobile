import {Injectable} from '@angular/core';
import {Component} from '@angular/core';
import {NgForm}    from '@angular/forms';
import {NavController, NavParams} from 'ionic-angular';
import {Popover, Alert, Storage, LocalStorage} from 'ionic-angular';
import {TranslateService} from 'ng2-translate/ng2-translate';
import {UserService} from '../../providers/user-service';


import {PortalPage} from '../portal/portal';

@Component({
    templateUrl: 'build/pages/login/login.html',
    providers: [
        UserService
    ]
})
@Injectable()
export class LoginPage {
    constants: any = {
        LOGIN_ID_STORAGE_NAME: 'loginID'
    };

    local: any = new Storage(LocalStorage);

    public user: any = {
        loginID: '', 
        password: '', 
        rememberLoginID: false
    };

    isDisabled: boolean = true;

    constructor(private nav: NavController, private userService: UserService, private translate: TranslateService) {
    }

    ngOnInit() {
        // If use already logged on, then redirect to portal page.
        this.loggedOn();
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
                if (this.user.rememberLoginID) {
                    this.local.set(this.constants.LOGIN_ID_STORAGE_NAME, this.user.loginID);
                } else {
                    this.local.remove(this.constants.LOGIN_ID_STORAGE_NAME);
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
    
    onPageWillEnter() {
        this.isDisabled = true;
    }
    
    onPageDidEnter() {
        this.local.get(this.constants.LOGIN_ID_STORAGE_NAME).then(value => {
            if (value != null) {
                this.user.loginID = value;
                this.user.rememberLoginID = true;
            }
        });
    }
    
    changeUser(): void {
        if (this.user.loginID && this.user.password) {
            this.isDisabled = null;
        } else {
            this.isDisabled = true;
        }
    }

    presentPopover(event) {
        
    }
}