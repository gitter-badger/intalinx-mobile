// Third party library.
import {Component} from '@angular/core';
import {Platform, NavController, Content} from 'ionic-angular';
import {TranslateService} from 'ng2-translate/ng2-translate';

// Utils.
import {Util} from '../../utils/util';

// Services.
import {AboutService} from '../../providers/about-service';

@Component({
    selector: 'page-about',
    templateUrl: 'about.html',
    providers: [
        AboutService
    ]
})

export class AboutPage {

    private version: string = 'latest';
    private latestVersion: string = 'latest';
    private upgradeUrl: string = '';

    constructor(private nav: NavController, private platform: Platform, private util: Util, private aboutService: AboutService, private translate: TranslateService) {
        this.getVersionInfo();
        this.getUpgradeUrl();
    }

    getVersionInfo(): void {
        this.aboutService.getVersion().then(data => {
            this.version = data;
        });

        this.aboutService.getLatestVersion().then(data => {
            this.latestVersion = data;
        });
    }

    getUpgradeUrl(): void {
        this.aboutService.getUpgradeUrl().then(data => {
            this.upgradeUrl = data;
        });
    }

    openUpgradeUrl(): boolean {
        if (this.version === this.latestVersion) {
            return false;
        }
    }
}
