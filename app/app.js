import {App, IonicApp, Platform, MenuController} from 'ionic-angular';
// import {App, IonicApp, Platform, MenuController, NavController, NavParams} from 'ionic-angular';
import {provide} from '@angular/core';
import {Http} from '@angular/http';
import {TranslateService, TranslateLoader, TranslateStaticLoader, TranslatePipe} from 'ng2-translate/ng2-translate';
import {LoginPage} from './pages/login/login';

@App({
    templateUrl: 'build/app.html', //'<ion-nav [root]="rootPage"></ion-nav>',
    config: {
        "BASE_URL": "http://192.168.11.29/home/intalinxcloud/",
        "GATEWAY_URL": "com.eibus.web.soap.Gateway.wcp",
        "PRE_LOGIN_INFO_URL": "com.eibus.sso.web.authentication.PreLoginInfo.wcp",
        "SAMLART_NAME": "SAMLart",
        "SAML_ARTIFACT_STORAGE_NAME": "defaultinst_SAMLart",
        "CHECK_NAME": "defaultinst_ct",
        "USER_AVATAR_IMAGE_URL": "img/",
        "USER_AVATAR_DEFAULT_IMAGE": "default",
        "PGYER" : {
            "ANDROID" : {
                "url" : "https://www.pgyer.com/MMHC"
            },
            "IOS" : {
                "url" : "https://www.pgyer.com/MMHB"
            }
        }
    }, 
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

    constructor(app, platform, translate, menu) {
        // set up our app
        this.app = app;
        // TODO: need to be change with another safety way!
        this.app.config = this.app._config;
        
        // set up translate
        this.translate = translate;
        this.app.translate = this.translate;
        // initialize translate library
        let userLang = navigator.language.toLowerCase();
        this.app.userLang = userLang;
        this.translate.use(userLang);
        
        this.platform = platform;
        this.menu = menu;
        
        this.userAvatarImageUrl = this.app.config.get("USER_AVATAR_IMAGE_URL");
        this.userAvatarDefaultImage = this.app.config.get("USER_AVATAR_DEFAULT_IMAGE");

        let user = {
            "userAvatar": this.userAvatarImageUrl + this.userAvatarDefaultImage
        };
        let menus = [];
        this.app.user = user;
        this.menus = menus;     
        
        this.app.redirectLoginPage = this.redirectLoginPage(this);
        // initiallize menu and pass this object to change the model
        this.app.initializeMenu = this.initializeMenu(this);
        this.app.initializeUser = this.initializeUser(this);        

        //
        this.initializeApp();

        this.rootPage = LoginPage;
        
        // initiallize new information count of blog system
        this.app.blogNewInformationCount = "";

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
            // navigator.splashscreen.hide();
        });
    }

    initializeMenu(that) {
        return function(menus) {
            that.menus = menus;
        }
    }

    initializeUser(that) {
        return function(user) {
            that.app.user = user;
        }
    }
    
    redirectLoginPage(that) {
        return function() {
            that.app.getComponent('nav').setRoot(LoginPage);
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
