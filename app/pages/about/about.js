import {Page, IonicApp, Platform, NavController, Content} from 'ionic-angular';

import {TranslatePipe} from 'ng2-translate/ng2-translate';

import {Util} from '../../utils/util';
import { HTTP_PROVIDERS } from '@angular/http';
import {AboutService} from '../../providers/about-service/about-service';
/*
  Generated class for the InformationPage page.

  See http://ionicframework.com/docs/v2/components/#navigation for more info on
  Ionic pages and navigation.
*/
@Page({
  templateUrl: 'build/pages/about/about.html',
  providers: [Util, 
             AboutService,
             HTTP_PROVIDERS],
  pipes: [TranslatePipe]
})

export class AboutPage {
  static get parameters() {
    return [[NavController], [IonicApp], [Platform], [Util], [AboutService]];
  }

  constructor(nav, app, platform, util, aboutService) {
    this.nav = nav;
    this.app = app;
    this.platform = platform;
    this.util = util;
    this.aboutService = aboutService;
    
    this.versionInfos = { //getVersionInfos
        "version": "The version number",
        "copyright": "@copyright",
        "latestVersion": "the latest version number"
    };
    this.getVersionInfos();
    
    // this.app.version = "test";
    // this.app.latestVersion = "";
    this.infos = "I don't know who I am ~o(╯□╰)o~";
    this.isIOS = "I'm not IOS!";
    this.isAndroid = "I'm not Android!";
    this.isWeb = "I'm not visited by Browser!";
    this.isApp = true;
    
    this.isLatestVersion = false;
    this.showIosUpgrade = false;
    this.showAndroidUpgrade = false;
    this.confirmPlatform();
    this.isShowUpgrade = false;
    if(this.showIosUpgrade || this.showAndroidUpgrade) {
        this.isShowUpgrade=true;
    }
    this.upgrade = {
        iosURL: "ios upgrade url",
        androidURL: "anfroid upgrade url"
    };
    
  }
  
  confirmPlatform() {
      this.infos = this.platform.platforms();
      this.infos.forEach(function(element) {
          if(element.includes("web") || element.includes("core")) {
              this.isApp = false;
          }
      }, this);
     /////////////////////////////////////////
    // the next line is use to test mobile app
    // this.isApp = true;
      if (this.platform.is('ios')) {
          this.isIOS = "Yes, I'm IOS!";
          if(this.isApp && !this.isLatestVersion) {
              this.showIosUpgrade = true;
          }
      }
      
      if (this.platform.is('android')) {
          this.isAndroid = "Yes, I'm Android!";
          if(this.isApp && !this.isLatestVersion) {
              this.showAndroidUpgrade = true;
          }
      }
      
      if (this.platform.is('windows')) {
          this.isWeb = "Yes, I'm Windows!";
      }
  }
  
  getVersionInfos() {
      debugger
      this.aboutService.getVersionInfos().then(data => {
           debugger
          this.versionInfos = data;
      });
  }
}
