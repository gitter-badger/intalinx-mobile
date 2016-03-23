import {Page, IonicApp, NavController, MenuController} from 'ionic-angular';
import {TranslatePipe} from 'ng2-translate/ng2-translate';

import {AppsService} from '../../providers/apps-service/apps-service'; 
import {UserService} from '../../providers/user-service/user-service'; 

import {BlogIndexPage} from '../blog/index/index';
import {ProfilePage} from '../profile/profile';

/*
  Generated class for the PortalPage page.

  See http://ionicframework.com/docs/v2/components/#navigation for more info on
  Ionic pages and navigation.
*/
@Page({
  templateUrl: 'build/pages/portal/portal.html',
  providers: [
      AppsService,
      UserService
  ],
  pipes: [TranslatePipe]
})
export class PortalPage {
  static get parameters() {
    return [[IonicApp], [NavController], [MenuController], [AppsService], [UserService]];
  }

  constructor(app, nav, menu, appsService, userService) {
    this.app = app;
    this.nav = nav;
    this.appsService = appsService;
    this.userService = userService;
    
    this.components = {
        "portal": PortalPage,
        "blog" : BlogIndexPage,
        "profile" : ProfilePage
    }
    
    if (!this.app.showMenu) {
        this.app.showMenu = this.showMenu(this);
    }
    
    this.appsService.load().then(data => {
        this.app.initializeMenu(data);
    })
    
    this.userService.getUserDetail().then(data => {
        this.app.initializeUser(data);
    })
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
