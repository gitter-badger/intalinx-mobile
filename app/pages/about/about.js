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
        this.version = "latest";
        this.latestVersion = "latest";
        this.upgradeUrl = "latest";
        this.getVersionInfo();
        this.getUpgradeUrl();
    }  
  
  
  getVersionInfo() {
      this.aboutService.getVersion().then(data => {
          this.version = data;
      });
      
      this.aboutService.getLatestVersion().then(data => {
          this.latestVersion = data;
      });
      
  }

  getUpgradeUrl() {
      this.aboutService.getUpgradeUrl().then(data => {
          this.upgradeUrl = data;
      });
  }
}
