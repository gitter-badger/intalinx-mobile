import {Page, IonicApp, NavController, Content} from 'ionic-angular';
import {ViewChild} from '@angular/core';

import {TranslatePipe} from 'ng2-translate/ng2-translate';

import {NotificationService} from '../../../providers/notification/notification-service/notification-service';

import {DetailPage} from '../detail/detail';

import {Util} from '../../../utils/util';


@Page({
    templateUrl: 'build/pages/notification/index/index.html',
    providers: [NotificationService, Util],
    pipes: [TranslatePipe],
    queries: {
        pageContent: new ViewChild(Content)
    }
})
export class NotificationIndexPage {

    static get parameters() {
        return [[IonicApp], [NavController], [NotificationService]];
    }

    constructor(app, nav, notificationService) {
        this.app = app;
        this.nav = nav;
        this.notificationService = notificationService;
        this.userAvatarImageUrl = this.app.config.get("USER_AVATAR_IMAGE_URL");
        this.userAvatarDefaultImage = this.app.config.get("USER_AVATAR_DEFAULT_IMAGE");
        
        this.getNotificationListForTop();
        this.getNotReadNotificationCountBySelf();
    }
    
    onPageLoaded () {
        this.isLoadCompleted = false;
    }

    openDetail(notification) {
        this.nav.push(DetailPage, {
            "notification": notification
        });
    }

    doRefresh(refresher) {
        let isRefresh = true;
        this.getNotificationListForTop(refresher, isRefresh);
        this.getNotReadNotificationCountBySelf();
    }

    doInfinite(infiniteScroll) {
        let position = this.notificationListForTop.length;
        let isNeedRegistNotExistsReadStatus = false;
        this.notificationService.getNotificationListForTop(position, isNeedRegistNotExistsReadStatus).then(data => {
            if (data && data[0]) {
                this.notificationListForTop = this.notificationListForTop.concat(data);
            }
            infiniteScroll.complete();
        });
    }

    getNotificationListForTop(refresher, isRefresh) {
        let position = 0;
        let isNeedRegistNotExistsReadStatus = true;
        this.notificationService.getNotificationListForTop(position, isNeedRegistNotExistsReadStatus).then(data => {
            this.notificationListForTop = data;
            this.isLoadCompleted = true;
            this.isScrollToTopButtonVisible = false;
            if (isRefresh) {
                refresher.complete();
            }
        });
    }
    
    getNotReadNotificationCountBySelf() {
        this.notificationService.getNotReadNotificationCountBySelf().then(data => {
            if (data) {
                this.app.notificationNewInformationCount = data;
            }
        });
    }
    
    loadImageError(event){
        let img = event.currentTarget;
        img.src = this.userAvatarImageUrl + this.userAvatarDefaultImage;
    }
    
    ngAfterViewInit() {
        this.pageContent.addScrollListener(this.onPageScroll(this));
    }
    
    scrollToIndexPageTop() {
        this.pageContent.scrollToTop();
    }
    
    onPageScroll(that) {
        return function() {
            if (this.scrollTop > 200) {
                that.isScrollToTopButtonVisible = true;
            } else {
                that.isScrollToTopButtonVisible = false;
            }
        }       
    }
}