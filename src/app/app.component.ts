import {Component, ViewChild} from '@angular/core';
import {Platform, Config, MenuController, Nav} from 'ionic-angular';
import {TranslateService} from 'ng2-translate/ng2-translate';
import {StatusBar, GoogleAnalytics, ScreenOrientation} from 'ionic-native';

// Config.
import {AppConfig} from './app.config';

// Services.
import {ShareService} from '../providers/share-service';

import {Util} from '../utils/util';

// Pages.
import {LoginPage} from '../pages/login/login';
import {PortalPage} from '../pages/portal/portal';

@Component({
    selector: 'page-app',
    templateUrl: 'app.html',
})
export class MyApp {
    @ViewChild(Nav) nav: Nav;

    public menus;
    // make HelloIonicPage the root (or first) page
    public rootPage: any;
    public user: any = {
        'userAvatar': null
    };

    constructor(public translate: TranslateService,
        public platform: Platform,
        public config: Config,
        public menu: MenuController,
        public appConfig: AppConfig,
        public util: Util,
        public share: ShareService) {
        this.platform.ready().then(() => {
            this.initializeApp();
        });
    }

    initializeApp() {
        // initialize translate library
        let userLang = navigator.language.toLowerCase();
        this.appConfig.set('USER_LANG', userLang);
        this.translate.use(userLang);

        // set default server.
        if (userLang.indexOf('zh') >= 0) {
            this.appConfig.set('BASE_URL', this.appConfig.get('BASE_URL_CHINA'));
            this.appConfig.set('GOOGLE_ANALYTICS_TRACK_ID', this.appConfig.get('GOOGLE_ANALYTICS_TRACK_ID_CHINA'));
        } else {
            this.appConfig.set('BASE_URL', this.appConfig.get('BASE_URL_JAPAN'));
            this.appConfig.set('GOOGLE_ANALYTICS_TRACK_ID', this.appConfig.get('GOOGLE_ANALYTICS_TRACK_ID_JAPAN'));
        }

        if (this.platform.is('cordova')) {
            // Okay, so the platform is ready and our plugins are available.
            // Here you can do any higher level native things you might need.
            StatusBar.backgroundColorByHexString('#7B1FA2');

            // Google Analytics
            if (typeof GoogleAnalytics !== undefined && this.appConfig.get('GOOGLE_ANALYTICS_TRACK_ID')) {
                GoogleAnalytics.startTrackerWithId(this.appConfig.get('GOOGLE_ANALYTICS_TRACK_ID'));
            }
            if (this.appConfig.get('IS_TABLET')) {
                if (typeof ScreenOrientation !== undefined) {
                    ScreenOrientation.lockOrientation('landscape');
                }
            }
        }

        this.user.userAvatar = this.appConfig.get('USER_DEFAULT_AVATAR_IMAGE_URL');
        this.getBackButtonText().then(message => {
            this.config.set('ios', 'backButtonText', message);
        });

        this.share.initializeMenu = this.initializeMenu(this);
        this.share.initializeUser = this.initializeUser(this);
        this.share.redirectLoginPage = this.redirectLoginPage(this, LoginPage);
        this.share.nav = this.nav;
        this.share.platform = this.platform;
        this.share.nav.viewDidEnter.subscribe((args) => {
            GoogleAnalytics.trackView(args.component.name);
        });

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
            that.share.user = user;
        };
    }

    redirectLoginPage(that, loginPage) {
        return function () {
            return that.share.nav.setRoot(loginPage);
        };
    }

    openPage(item) {
        // close the menu when clicking a link from the menu
        this.menu.close();
        // navigate to the new page if it is not the current page
        if (this.share.showMenu) {
            this.share.showMenu(item);
        }
    }

    logout() {
        this.menu.close();
        this.translate.get('app.message.warning.logout').subscribe(message => {
            let content = message;
            let okHandler = function (that) {
                return function () {
                    that.util.logout().then(() => {
                        that.share.nav.setRoot(LoginPage);
                    });
                };
            };
            this.util.presentConfirmModal(content, 'warning', okHandler(this));
        });
    }
}
