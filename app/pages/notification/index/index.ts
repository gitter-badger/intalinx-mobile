// Third party library.
import {Injectable, Component, ViewChild} from '@angular/core';
import {NavController, Content} from 'ionic-angular';
import {TranslatePipe} from 'ng2-translate/ng2-translate';

// Utils.
import {Util} from '../../../utils/util';

// Services.
import {NotificationService} from '../../../providers/notification-service';
import {ShareService} from '../../../providers/share-service';

// Pages.
import {DetailPage} from '../detail/detail';

@Component({
    templateUrl: 'build/pages/notification/index/index.html',
    providers: [
        NotificationService, 
        Util
    ],
    pipes: [
        TranslatePipe
    ]
})
export class NotificationIndexPage {
    @ViewChild(Content) pageContent: Content;

    private notificationListForTop: any;
    private isLoadCompleted: boolean;
    private isScrollToTopButtonVisible: boolean;

    constructor(private share: ShareService, 
                private nav: NavController, 
                private notificationService: NotificationService) {
        this.getNotificationListForTop();
        this.getNotReadNotificationCountBySelf();
    }
    
    onPageLoaded (): void {
        this.isLoadCompleted = false;
    }

    openDetail(notification): void {
        this.nav.push(DetailPage, {
            'notification': notification
        });
    }

    doRefresh(refresher): void {
        let isRefresh = true;
        this.getNotificationListForTop(refresher, isRefresh);
        this.getNotReadNotificationCountBySelf();
    }

    doInfinite(infiniteScroll): void {
        let position = this.notificationListForTop.length;
        let isNeedRegistNotExistsReadStatus = false;
        this.notificationService.getNotificationListForTop(position, isNeedRegistNotExistsReadStatus).then((data: any) => {
            if (data && data.lenght > 0) {
                this.notificationListForTop = this.notificationListForTop.concat(data);
            }
            infiniteScroll.complete();
        });
    }

    getNotificationListForTop(refresher?, isRefresh?): void {
        let position = 0;
        let isNeedRegistNotExistsReadStatus = true;
        this.notificationService.getNotificationListForTop(position, isNeedRegistNotExistsReadStatus).then((data: any) => {
            this.notificationListForTop = data;
            this.isLoadCompleted = true;
            this.isScrollToTopButtonVisible = false;
            if (isRefresh) {
                refresher.complete();
            }
        });
    }
    
    getNotReadNotificationCountBySelf(): void {
        this.notificationService.getNotReadNotificationCountBySelf().then((data: any) => {
            if (data) {
                this.share.notificationNewInformationCount = data;
            }
        });
    }
    
    ngAfterViewInit(): void {
        this.pageContent.addScrollListener(this.onPageScroll(this));
    }
    
    scrollToIndexPageTop(): void {
        this.pageContent.scrollToTop();
    }
    
    onPageScroll(that): any {
        return function() {
            if (this.scrollTop > 200) {
                that.isScrollToTopButtonVisible = true;
            } else {
                that.isScrollToTopButtonVisible = false;
            }
        }       
    }
}