import {Page, IonicApp, Platform, NavController, MenuController} from 'ionic-angular';
import {TranslatePipe} from 'ng2-translate/ng2-translate';

import {Util} from '../../utils/util';

import {AppsService} from '../../providers/apps-service/apps-service'; 
import {UserService} from '../../providers/user-service/user-service';
import {BlogService} from '../../providers/blog/blog-service/blog-service'; 
import {NotificationService} from '../../providers/notification/notification-service/notification-service';
import {ScheduleService} from '../../providers/schedule/schedule-service/schedule-service';
import {AboutService} from '../../providers/about-service/about-service';

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
        this.app.initializeMenu(data);
        // set root to blog.
        this.nav.setRoot(BlogIndexPage);

        // when the app is runing as a native app. remove about page.
        if (!platform.is('cordova')) {
            data.pop();
        } else {
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
