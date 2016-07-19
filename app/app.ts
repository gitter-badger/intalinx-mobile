import {Inject, OpaqueToken, Component, ViewChild} from '@angular/core';
import {disableDeprecatedForms, provideForms} from '@angular/forms';
import {ionicBootstrap, Platform, Config, MenuController, Nav} from 'ionic-angular';
import {StatusBar} from 'ionic-native';
import {PLATFORM_PIPES, provide} from '@angular/core';
import {TRANSLATE_PROVIDERS, TranslateService, TranslateLoader, TranslateStaticLoader, TranslatePipe} from 'ng2-translate/ng2-translate';
import {HTTP_PROVIDERS, Http} from '@angular/http';

import {LoginPage} from './pages/login/login';
import {AppConfig} from './utils/appconfig';
import {Util} from './utils/util';
import {SSO} from './utils/sso';
import {DateUtil} from './utils/dateutil';
import {XmlUtil} from './utils/xmlutil';

@Component({
    templateUrl: 'build/app.html',
    pipes: [
        TranslatePipe
    ]
})
class IntaLinx {

    // make HelloIonicPage the root (or first) page
    rootPage: any = LoginPage;

    menus: any[] = [];
    showMenu: any;

    user: any = {
        'userAvatar': null
    };
    
    constructor(private platform: Platform, private config: Config, private appConfig: AppConfig, private menu: MenuController, private translate: TranslateService) {
        this.initializeApp();
    }

    initializeApp() {
        this.platform.ready().then(() => {
            // Okay, so the platform is ready and our plugins are available.
            // Here you can do any higher level native things you might need.
            StatusBar.styleDefault();
        });

        // initialize translate library
        let userLang = navigator.language.toLowerCase();
        
        this.appConfig.set('USER_LANG', userLang);
        this.translate.use(userLang);
        
        this.user.userAvatar = this.appConfig.get('USER_DEFAULT_AVATAR_IMAGE_URL');
        this.getBackButtonText().then(message => {
            this.config.set('ios', 'backButtonText', message);
        });
    }

    getBackButtonText() {
        return new Promise(resolve => {
            this.translate.get('app.action.back').subscribe(message => {
                resolve(message);
            });
        });
    }

    initializeMenu(that) {
        return function(menus) {
            that.menus = menus;
        };
    }

    initializeUser(that) {
        return function(user) {
            that.user = user;
        };
    }
    
    redirectLoginPage(that, loginPage) {
        return function() {
            that.nav.setRoot(loginPage);
        };
    }

    openPage(item) {
        // close the menu when clicking a link from the menu
        this.menu.close();
        if (this.showMenu) {
            this.showMenu(item);
        }
    }
}

ionicBootstrap(IntaLinx, [
    disableDeprecatedForms(),
    provideForms(),
    HTTP_PROVIDERS,
    { 
        provide: TranslateLoader,
        useFactory: (http: Http) => new TranslateStaticLoader(http, 'assets/i18n', '.json'),
        deps: [Http]
    },
    {
        provide: PLATFORM_PIPES, 
        useValue: TranslatePipe, 
        multi: true
    },
    SSO,
    TranslateService,
    AppConfig,
    Util,
    DateUtil,
    XmlUtil
]);