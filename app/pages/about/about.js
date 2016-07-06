import {Page, IonicApp, Platform, NavController, Content} from 'ionic-angular';

import {TranslatePipe} from 'ng2-translate/ng2-translate';

import {Util} from '../../utils/util';
import { HTTP_PROVIDERS } from '@angular/http';
import {AboutService} from '../../providers/about-service/about-service';

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
        this.upgradeUrl = "";
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

  openUpgradeUrl() {
      if (this.version == this.latestVersion) {
          return false;
      }
  }
}
