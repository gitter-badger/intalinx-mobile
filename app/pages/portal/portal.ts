// Third party library.
import {Injectable, Component} from '@angular/core';
import {TranslateService} from 'ng2-translate/ng2-translate';
import {Platform, NavController, MenuController} from 'ionic-angular';

// Utils.
import {Util} from '../../utils/util';

// Services.
import {ShareService} from '../../providers/share-service';
import {AppsService} from '../../providers/apps-service'; 
import {UserService} from '../../providers/user-service';
import {BlogService} from '../../providers/blog-service'; 
import {NotificationService} from '../../providers/notification-service';
import {ScheduleService} from '../../providers/schedule-service';
import {AboutService} from '../../providers/about-service';

import {BlogIndexPage} from '../blog/index/index';
import {ProfileIndexPage} from '../profile/index/index';
import {NotificationIndexPage} from '../notification/index/index';
import {ScheduleIndexPage} from '../schedule/index/index';
import {AboutPage} from '../about/about';
import {DevicesPage} from '../schedule/devices/devices';

@Component({
    templateUrl: 'build/pages/portal/portal.html',
    providers: [
        AppsService,
        UserService,
        BlogService,
        NotificationService,
        ScheduleService,
        AboutService
    ]
})
@Injectable()
export class PortalPage {
    version: string = 'latest';
    latestVersion: string = 'latest';

    components = {
        'portal': PortalPage,
        'notification' : NotificationIndexPage,
        'blog' : BlogIndexPage,
        'profile' : ProfileIndexPage,
        'schedule': ScheduleIndexPage,
        'about': AboutPage,
        'devices': DevicesPage
    };

    constructor(private translate: TranslateService, private platform: Platform, private nav: NavController, private util: Util, private share: ShareService, private appsService: AppsService, private aboutService: AboutService, private userService: UserService) {
        this.checkUpdate();
        this.loadApplications();
        this.initializeUser();
        if (!this.share.showMenu) {
            this.share.showMenu = this.showMenu(this);
        }
    }

    checkUpdate() {
        // check latest version from http://pgyer.com/.
        if (this.platform.is('cordova')) {
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
        this.appsService.load().then((data: any) => {
            let menuIdNeedToRemove = [];
            
            // remove about page for real device.
            if (!this.platform.is('cordova')) {
                menuIdNeedToRemove.push('about');
            }
            // remove notification, calendar, profile for real device.
            if (this.platform.is('tablet')) {
                menuIdNeedToRemove.push('notification');
                menuIdNeedToRemove.push('schedule');
                menuIdNeedToRemove.push('profile');
            } else if (this.platform.is('mobile')) {
                menuIdNeedToRemove.push('devices');
            }

            // remove unnecessary menu.
            data.forEach(function(currentValue, index, array){
                for (let i = 0; i < menuIdNeedToRemove.length; i++) {
                    if (currentValue.componentsId === menuIdNeedToRemove[i]) {
                        data.splice(index, 1);
                        menuIdNeedToRemove.splice(i, 1);
                        break;
                    }
                }
            });

            this.share.initializeMenu(data);

            // set root page.
            if (!this.platform.is('tablet')) {
                // set root to blog.
                this.nav.setRoot(BlogIndexPage);
            } else {
                // set root to devices on tablet
                this.nav.setRoot(DevicesPage);
            }
        });
    }

    initializeUser() {
        this.userService.getUserDetails().then(data => {
            this.share.initializeUser(data);
        });
    }
  
    showMenu(that) {
        return function(menu) {
            if (menu.isPush) {
                that.nav.push(that.components[menu.componentsId]);
            } else {
                that.nav.setRoot(that.components[menu.componentsId]);
            }
        };
    }
}
