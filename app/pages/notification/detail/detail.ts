// Third party library.
import {Injectable, Component, ViewChild} from '@angular/core';
import {NavController, NavParams, ViewController, Platform, Content} from 'ionic-angular';
import {TranslatePipe} from 'ng2-translate/ng2-translate';
import {NotificationService} from '../../../providers/notification-service';

// Utils.
import {Util} from '../../../utils/util';

// Services.
import {ShareService} from '../../../providers/share-service';

@Component({
    templateUrl: 'build/pages/notification/detail/detail.html',
    providers: [
        NotificationService,
        Util
    ],
    pipes: [
        TranslatePipe
    ]
})
@Injectable()
export class DetailPage {
    @ViewChild(Content) pageContent: Content;

    private notification: any;
    private id: string;
    private readStatus: string;
    // The detail data of event.
    private title: string;
    private content: string;
    private createUserId: string;
    private publishStartDate: string;
    private createUserAvatar: string;
    private createUserName: string;
    private status: string;
    private readCount: string;
    private isLoadCompleted: boolean;
    private isScrollToTopButtonVisible: boolean;
    // The number of milliseconds between midnight, January 1, 1970.
    private pageLoadTime: number;

    constructor(private nav: NavController, 
                private params: NavParams, 
                private notificationService: NotificationService, 
                private view: ViewController, 
                private platform: Platform, 
                private share: ShareService) {
        this.getNotificationDetailByNotificationID();
        this.notification = this.params.get('notification'); 
        this.id = this.notification.notificationID;
        this.readStatus = this.notification.readStatus;     
    }

    getNotificationDetailByNotificationID(): void {
        this.notificationService.getNotificationDetailByNotificationID(this.id).then((data: any) => {
            this.title = data.title;
            this.content = data.content;
            this.createUserId = data.createUser;
            this.publishStartDate = data.publishStartDate;
            this.createUserAvatar = data.createUserAvatar;
            this.createUserName = data.createUserName;
            this.status = data.status;
            this.readCount = data.readCount;
            this.isLoadCompleted = true;
            this.isScrollToTopButtonVisible = false;

        });
    }

    onPageLoaded(): void {
        this.pageLoadTime = new Date().getTime();
    }

    onPageWillUnload(): void {
        let now = new Date().getTime();
        let pageLoadingTime = now - this.pageLoadTime;
        if (this.status === 'PUBLISH' && this.readStatus === 'NOT_READ' && pageLoadingTime >= 3000) {
            this.updateReadStatus();
        }
        this.isLoadCompleted = false;
        this.isScrollToTopButtonVisible = false;
    }

    updateReadStatus(): void {
        let readStatus = 'READ';
        this.notificationService.updateReadStatus(this.id, readStatus).then((data: string) => {
            if (data === 'true') {
                this.notification.readStatus = readStatus;
                let notificationNewInformationCount = Number(this.share.notificationNewInformationCount);
                this.share.notificationNewInformationCount = String(notificationNewInformationCount - 1);
            }
        });
    }

    ngAfterViewInit(): void {
        this.pageContent.addScrollListener(this.onPageScroll(this));
    }

    scrollToDetailPageTop(): void {
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
