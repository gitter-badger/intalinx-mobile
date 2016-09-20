// Third party library.
import {Component, ViewChild} from '@angular/core';
import {NavController, Content} from 'ionic-angular';

// Utils.
import {Util} from '../../../utils/util';

// Services.
import {NotificationService} from '../../../providers/notification-service';
import {ShareService} from '../../../providers/share-service';

// Pages.
import {NotificationDetailPage} from '../detail/detail';

@Component({
    templateUrl: 'build/pages/notification/index/index.html',
    providers: [
        NotificationService,
        Util
    ]
})

export class NotificationIndexPage {
    @ViewChild(Content) pageContent: Content;

    private notificationListForTop: any;
    private isLoadCompleted: boolean;
    private isScrollToTopButtonVisible: boolean;
    private keyWord: string;
    private isFirstTimeLoad: boolean;

    constructor(private share: ShareService,
        private nav: NavController,
        private notificationService: NotificationService) {
        this.keyWord = null;
        this.getNotificationListForTop();
        this.getNotReadNotificationCountBySelf();
        this.isFirstTimeLoad = true;
    }

    ionViewLoaded(): void {
        this.isLoadCompleted = false;
    }

    openDetail(notification): void {
        this.nav.push(NotificationDetailPage, {
            'notification': notification
        });
    }

    doRefresh(refresher): void {
        let isRefresh = true;
        this.keyWord = null;
        this.isFirstTimeLoad = true;
        this.getNotificationListForTop(refresher, isRefresh);
        this.getNotReadNotificationCountBySelf();
    }

    doInfinite(infiniteScroll): void {
        let position: number;
        if (this.notificationListForTop) {
            position = this.notificationListForTop.length;
        } else {
            position = 0;
        }

        let isNeedRegistNotExistsReadStatus = false;
        this.notificationService.getNotificationListForTop(position, isNeedRegistNotExistsReadStatus, this.keyWord).then((data: any) => {
            if (data && data.lenght > 0) {
                this.notificationListForTop = this.notificationListForTop.concat(data);
            }
            infiniteScroll.complete();
        });
    }

    getNotificationListForTop(refresher?, isRefresh?): void {
        let position = 0;
        let isNeedRegistNotExistsReadStatus = true;
        this.notificationService.getNotificationListForTop(position, isNeedRegistNotExistsReadStatus, this.keyWord).then((data: any) => {
            this.notificationListForTop = data;
            this.isLoadCompleted = true;
            this.isScrollToTopButtonVisible = false;
            if (isRefresh) {
                refresher.complete();
            }
            if (this.isFirstTimeLoad) {
                this.pageContent.scrollTo(0, 46, 0);
                this.isFirstTimeLoad = false;
            }
        });
    }

    getNotReadNotificationCountBySelf(): void {
        this.notificationService.getNotReadNotificationCountBySelf().then((data: string) => {
            if (data) {
                this.share.notificationNewInformationCount = Number(data);
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
        return function () {
            if (this.scrollTop > 200) {
                that.isScrollToTopButtonVisible = true;
            } else {
                that.isScrollToTopButtonVisible = false;
            }
        }
    }

    serachNotifications(event: any): void {
        this.keyWord = event.target.value;
        this.getNotificationListForTop();
    }
}