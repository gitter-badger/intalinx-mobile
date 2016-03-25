import {App, IonicApp, Platform, MenuController} from 'ionic-angular';
// import {App, IonicApp, Platform, MenuController, NavController, NavParams} from 'ionic-angular';
import {provide} from 'angular2/core';
import {Http} from 'angular2/http';
import {TranslateService, TranslateLoader, TranslateStaticLoader, TranslatePipe} from 'ng2-translate/ng2-translate';
import {LoginPage} from './pages/login/login';

@App({
    templateUrl: 'build/app.html', //'<ion-nav [root]="rootPage"></ion-nav>',
    config: {}, //http://ionicframework.com/docs/v2/api/config/Config/
    providers: [
        provide(TranslateLoader, {
            useFactory: (http) => {
                return new TranslateStaticLoader(http, 'assets/i18n', '.json');
            },
            deps: [Http]
        }),
        TranslateService
    ],
    pipes: [TranslatePipe]
})
export class IntaLinx {
    static get parameters() {
        return [[IonicApp], [Platform], [TranslateService], [MenuController]];
    }
    
    initializeTranslate() {
        let userLang = navigator.language.split('-')[0];
        userLang = /(ja|zh-cn)/gi.test(userLang) ? userLang : 'zh-cn';
        this.translate.use(userLang);
    }

    constructor(app, platform, translate, menu) {
        // set up our app
        this.app = app;
        
        // set up translate
        this.translate = translate;
        this.app.translate = this.translate;
        // initialize translate library
        this.initializeTranslate();
        
        this.platform = platform;
        this.menu = menu;

        let user = {};
        let menus = [];
        this.user = user;
        this.menus = menus;

        // initiallize menu and pass this object to change the model
        this.app.initializeMenu = this.initializeMenu(this);
        this.app.initializeUser = this.initializeUser(this);        

        //
        this.initializeApp();

        this.rootPage = LoginPage;
    }

    initializeApp() {
        this.platform.ready().then(() => {
            // The platform is now ready. Note: if this callback fails to fire, follow
            // the Troubleshooting guide for a number of possible solutions:
            //
            // Okay, so the platform is ready and our plugins are available.
            // Here you can do any higher level native things you might need.
            //
            // First, let's hide the keyboard accessory bar (only works natively) since
            // that's a better default:
            //
            //
            // For example, we might change the StatusBar color. This one below is
            // good for light backgrounds and dark text;
            if (window.StatusBar) {
                window.StatusBar.styleDefault();
            }
        });
    }

    initializeMenu(that) {
        return function(menus) {
            that.menus = menus;
        }
    }

    initializeUser(that) {
        return function(user) {
            that.user = user;
        }
    }

    openPage(item) {
        // close the menu when clicking a link from the menu
        this.menu.close();
        if (this.app.showMenu) {
            this.app.showMenu(item);
        }
    }
}
