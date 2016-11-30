// Third party library.
import {Component} from '@angular/core';
import {TranslateService} from 'ng2-translate/ng2-translate';
import {Platform, NavController} from 'ionic-angular';
import {InAppBrowser} from 'ionic-native';

// Utils.
import {Util} from '../../utils/util';

// Config.
import {AppConfig} from '../../app/app.config';

// Services.
import {ShareService} from '../../providers/share-service';
import {AppsService} from '../../providers/apps-service';
import {UserService} from '../../providers/user-service';
import {BlogService} from '../../providers/blog-service';
import {NotificationService} from '../../providers/notification-service';
import {ScheduleService} from '../../providers/schedule-service';
import {AboutService} from '../../providers/about-service';

import {InfoPage} from '../info/info';
import {ProfileIndexPage} from '../profile/index/index';
import {ScheduleIndexPage} from '../schedule/index/index';
import {AboutPage} from '../about/about';
import {DevicesPage} from '../schedule/devices/devices';

@Component({
    selector: 'page-portal',
    templateUrl: 'portal.html',
    providers: [
        AppsService,
        UserService,
        BlogService,
        NotificationService,
        ScheduleService,
        AboutService
    ]
})

export class PortalPage {
    version: string = 'latest';
    latestVersion: string = 'latest';

    components = {
        'portal': PortalPage,
        'info': InfoPage,
        'profile': ProfileIndexPage,
        'schedule': ScheduleIndexPage,
        'about': AboutPage,
        'devices': DevicesPage
    };

    constructor(private translate: TranslateService, private platform: Platform, private nav: NavController, private appConfig: AppConfig, private util: Util, private share: ShareService, private appsService: AppsService, private aboutService: AboutService, private userService: UserService) {
        this.initializeUser().then(() => {
            this.loadApplications();
            this.checkUpdate();
        });
        if (!this.share.showMenu) {
            this.share.showMenu = this.showMenu(this);
        }
    }

    checkUpdate(): void {
        // check latest version from http://pgyer.com/.
        if (this.platform.is('cordova') && !this.appConfig.get('IS_TABLET')) {
            this.aboutService.getVersion().then(data => {
                this.version = data;
                this.aboutService.getLatestVersion().then(data => {
                    this.latestVersion = data;
                    if (this.latestVersion !== this.version) {
                        this.translate.get(['app.message.info.versionTooOld']).subscribe(message => {
                            this.util.presentModal(message['app.message.info.versionTooOld'], 'info');
                        });
                    }
                });
            });
        }
    }

    loadApplications() {
        return this.appsService.load().then((data: any) => {
            let menuIdNeedToRemove = [];

            // remove about page for web browser.
            if (!this.platform.is('cordova')) {
                menuIdNeedToRemove.push('about');
            }
            // remove notification, calendar, profile for real device.
            if (this.appConfig.get('IS_TABLET')) {
                menuIdNeedToRemove.push('blog');
                menuIdNeedToRemove.push('notification');
                menuIdNeedToRemove.push('survey');
                menuIdNeedToRemove.push('schedule');
                menuIdNeedToRemove.push('profile');
                menuIdNeedToRemove.push('about');
            } else if (this.platform.is('mobile')) {
                menuIdNeedToRemove.push('devices');
            }
            // remove unnecessary menu.
            for (let index = 0; index < data.length; index++) {
                let currentValue = data[index];
                for (let i = 0; i < menuIdNeedToRemove.length; i++) {
                    if (currentValue.componentsId === menuIdNeedToRemove[i]) {
                        data.splice(index, 1);
                        menuIdNeedToRemove.splice(i, 1);
                        index--;
                        break;
                    }
                }
            }

            this.share.initializeMenu(data);

            // set root page.
            if (!this.appConfig.get('IS_TABLET')) {
                // set root to blog.
                this.nav.setRoot(InfoPage);
            } else {
                // set root to devices on tablet
                this.nav.setRoot(DevicesPage);
            }
        });
    }

    initializeUser() {
        return new Promise(resolve => {
            this.userService.getUserDetails().then(data => {
                this.share.initializeUser(data);
                resolve();
            });
        });
    }

    showMenu(that) {
        return function (menu) {
            if (menu.componentsId === 'biznavi') {
                that.util.getSAMLart().then((samlart: string) => {
                    // sso for biznavi.
                    let baseURL = that.appConfig.get('BASE_URL');
                    let baseURLChina = that.appConfig.get('BASE_URL_CHINA');
                    let url = that.appConfig.get('BIZNAVI_URL_JAPAN') + samlart;
                    if (baseURL === baseURLChina) {
                        url = that.appConfig.get('BIZNAVI_URL_CHINA') + samlart;
                    }
                    if (that.platform.is('cordova')) {
                        InAppBrowser.open(url, '_system');
                    } else {
                        window.open(url, '_blank');
                    }
                });
            } else {
                that.nav.setRoot(that.components[menu.componentsId]);
            }
        };
    }
}
