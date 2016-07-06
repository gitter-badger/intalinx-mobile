import {Page, IonicApp, Platform, NavController, MenuController} from 'ionic-angular';
import {TranslatePipe} from 'ng2-translate/ng2-translate';

import {Util} from '../../utils/util';

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
import {FacilitiesPage} from '../schedule/facilities/facilities';

@Page({
  templateUrl: 'build/pages/portal/portal.html',
  providers: [
      AppsService,
      UserService,
      BlogService,
      NotificationService,
      ScheduleService,
      AboutService,
      Util
  ],
  pipes: [TranslatePipe]
})
export class PortalPage {
  static get parameters() {
    return [[IonicApp], [Platform], [NavController], [MenuController], [AppsService], [AboutService], [UserService], [Util]];
  }

  constructor(app, platform, nav, menu, appsService, aboutService, userService, util) {
    this.app = app;
    this.nav = nav;
    this.appsService = appsService;
    this.userService = userService;
    this.aboutService = aboutService;
    this.util = util;
    this.version = "latest";
    this.latestVersion = "latest";

    this.components = {
        "portal": PortalPage,
        "notification" : NotificationIndexPage,
        "blog" : BlogIndexPage,
        "profile" : ProfileIndexPage,
        "schedule": ScheduleIndexPage,
        "about": AboutPage,
        "facilities": FacilitiesPage
    }
    
    if (!this.app.showMenu) {
        this.app.showMenu = this.showMenu(this);
    }
    
    this.appsService.load().then(data => {
        // check latest version from http://pgyer.com/.
        if (platform.is('cordova')) {
            this.aboutService.getVersion().then(data => {
                this.version = data;
                this.aboutService.getLatestVersion().then(data => {
                    this.latestVersion = data;
                    if (this.latestVersion != this.version) {
                        this.app.translate.get(["app.message.info.versionTooOld"]).subscribe(message => {
                            this.util.presentModal(message["app.message.info.versionTooOld"], "info");
                        });
                    }
                });
            });
        }

        let menuIdNeedToRemove = [];
        // remove about page for real device.
        if (!platform.is('cordova')) {
            menuIdNeedToRemove.push("about");
        }
        // remove notification, calendar, profile for real device.
        if (platform.is('tablet')) {
            menuIdNeedToRemove.push("notification");
            menuIdNeedToRemove.push("schedule");
            menuIdNeedToRemove.push("profile");
        } else {
            menuIdNeedToRemove.push("facilities");
        }

        // remove unnecessary menu.
        data.forEach(function(currentValue, index, array){
            for(let i = 0; i < menuIdNeedToRemove.length; i++) {
                if (currentValue.componentsId === menuIdNeedToRemove[i]) {
                    data.splice(index, 1);
                    menuIdNeedToRemove.splice(i, 1);
                    break;
                }
            }
        })

        this.app.initializeMenu(data);
        if (!platform.is('tablet')) {
            // set root to blog.
            this.nav.setRoot(BlogIndexPage);
        } else {
            // set root to facilities on tablet
            this.nav.setRoot(FacilitiesPage);
        }

    });
    
    this.userService.getUserDetailsFromUser().then(data => {
        this.app.initializeUser(data);
    });
  }
  
  showMenu(that) {
      return function(menu) {
          if (menu.isPush) {
              that.nav.push(that.components[menu.componentsId]);
          } else {
              that.nav.setRoot(that.components[menu.componentsId]);
          }
      }
  }
}
