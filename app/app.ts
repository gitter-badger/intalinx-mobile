// Third party library.
import {Component, ViewChild} from '@angular/core';
import {disableDeprecatedForms, provideForms} from '@angular/forms';
import {ionicBootstrap, Platform, Config, MenuController, NavController} from 'ionic-angular';
import {PLATFORM_PIPES, provide} from '@angular/core';
import {HTTP_PROVIDERS, Http} from '@angular/http';
import {TRANSLATE_PROVIDERS, TranslateService, TranslateLoader, TranslateStaticLoader, TranslatePipe} from 'ng2-translate/ng2-translate';
import {StatusBar, GoogleAnalytics} from 'ionic-native';

// Config.
import {AppConfig} from './appconfig';

// Utils.
import {Util} from './utils/util';
import {AlertUtil} from './utils/alertutil';
import {CordysUtil} from './utils/cordysutil';
import {DateUtil} from './utils/dateutil';
import {XmlUtil} from './utils/xmlutil';
import {StorageUtil} from './utils/storageutil';

// Services.
import {ShareService} from './providers/share-service';

// Pages.
import {LoginPage} from './pages/login/login';
import {PortalPage} from './pages/portal/portal';

@Component({
    templateUrl: 'build/app.html',
    pipes: [
        TranslatePipe
    ]
})
class IntaLinx {
    @ViewChild('nav') nav: NavController;
    // make LoginPage the root (or first) page
    private rootPage: any;
    private menus: any[] = [];
    private user: any = {
        'userAvatar': null
    };

    constructor(private translate: TranslateService, private platform: Platform, private config: Config, private menu: MenuController, private appConfig: AppConfig, private util: Util, private share: ShareService) {
        this.platform.ready().then(() => {
            this.initializeApp();
        });
    }
    
    initializeApp() {
        // Okay, so the platform is ready and our plugins are available.
        // Here you can do any higher level native things you might need.
        StatusBar.styleDefault();

        // Google Analytics
        if (typeof GoogleAnalytics !== undefined && this.appConfig.get('GOOGLE_ANALYTICS_TRACK_ID')) {
            GoogleAnalytics.startTrackerWithId(this.appConfig.get('GOOGLE_ANALYTICS_TRACK_ID'));
        }

        // initialize translate library
        let userLang = navigator.language.toLowerCase();
        this.appConfig.set('USER_LANG', userLang);
        this.translate.use(userLang);

        this.user.userAvatar = this.appConfig.get('USER_DEFAULT_AVATAR_IMAGE_URL');
        this.getBackButtonText().then(message => {
            this.config.set('ios', 'backButtonText', message);
        });

        this.share.initializeMenu = this.initializeMenu(this);
        this.share.initializeUser = this.initializeUser(this);
        this.share.redirectLoginPage = this.redirectLoginPage(this, LoginPage);
        this.share.nav = this.nav;

        // auto login.
        this.util.loggedOn().then((isLoggedOn: boolean) => {
            if (isLoggedOn) {
                this.rootPage = PortalPage;
            } else {
                this.rootPage = LoginPage;
            }
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
        return function (menus) {
            that.menus = menus;
        };
    }

    initializeUser(that) {
        return function (user) {
            that.user = user;
        };
    }

    redirectLoginPage(that, loginPage) {
        return function () {
            that.rootPage = loginPage;
        };
    }

    openPage(item) {
        // close the menu when clicking a link from the menu
        this.menu.close();
        if (this.share.showMenu) {
            this.share.showMenu(item);
        }
    }

    logout() {
        this.menu.close();
        this.util.logout().then(() => {
            this.share.nav.setRoot(LoginPage);
        });
    }
}

ionicBootstrap(IntaLinx, [
    // disableDeprecatedForms(),
    // provideForms(),
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
    TranslateService,
    AppConfig,
    Util,
    AlertUtil,
    CordysUtil,
    DateUtil,
    XmlUtil,
    StorageUtil,
    ShareService
]);