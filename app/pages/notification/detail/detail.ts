// Third party library.
import {Component, ViewChild,  Directive, HostListener, ViewContainerRef} from '@angular/core';
import {NavController, NavParams, ViewController, Content} from 'ionic-angular';
import {NotificationService} from '../../../providers/notification-service';

// Utils.
import {Util} from '../../../utils/util';

// Services.
import {ShareService} from '../../../providers/share-service';

// Pages.
import {InnerContent} from '../../../shared/components/innercontent/innercontent';
import {ImageSlidesPage} from '../../../shared/components/image-slides/image-slides';

@Directive({
    selector: 'img'
})
export class Img {
    private images: any;
    constructor(private nav: NavController, private elementRef: ViewContainerRef) {
    }
    @HostListener('click', [])
    onClick() {
        let currentImage = this.elementRef.element.nativeElement;
        if (currentImage.parentElement.parentElement.className === 'contents selectable') {
            let images = currentImage.ownerDocument.querySelectorAll('.contents img');
            let sendData = {
                'currentImage': currentImage,
                'images': images
            };
            this.nav.push(ImageSlidesPage, { 'sendData': sendData });
        }
    }
}

@Component({
    templateUrl: 'build/pages/notification/detail/detail.html',
    providers: [
        NotificationService,
        Util
    ],
    directives: [InnerContent]
})

export class NotificationDetailPage {
    @ViewChild(Content) pageContent: Content;

    private notification: any;
    private id: string;
    private readStatus: string;
    // The detail data of event.
    private title: string;
    private content: any;
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
    private attachFilesForDownload: any;
    private attachImagesForDisplay: any;
    private hasAttachFilesForDownload: boolean = false;

    constructor(private nav: NavController,
        private params: NavParams,
        private notificationService: NotificationService,
        private view: ViewController,
        private share: ShareService) {
        this.notification = this.params.get('notification');
        this.id = this.notification.notificationID;
        this.readStatus = this.notification.readStatus;

        this.getNotificationDetailByNotificationID();
    }

    getNotificationDetailByNotificationID(): void {
        this.notificationService.getNotificationDetailByNotificationID(this.id).then((data: any) => {
            this.title = data.title;
            this.content = [data.content, [Img]];
            this.createUserId = data.createUser;
            this.publishStartDate = data.publishStartDate;
            this.createUserAvatar = data.createUserAvatar;
            this.createUserName = data.createUserName;
            this.status = data.status;
            this.readCount = data.readCount;
            this.attachImagesForDisplay = data.attachImagesForDisplay;
            this.attachFilesForDownload = data.attachFilesForDownload;
            if (data.attachFilesForDownload.length > 0) {
                this.hasAttachFilesForDownload = true;
            }
            this.isLoadCompleted = true;
            this.isScrollToTopButtonVisible = false;

        });
    }

    ionViewLoaded(): void {
        this.pageLoadTime = new Date().getTime();
    }

    ionViewWillUnload(): void {
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
                this.share.notificationNewInformationCount = notificationNewInformationCount - 1;
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
        return function () {
            if (this.scrollTop > 200) {
                that.isScrollToTopButtonVisible = true;
            } else {
                that.isScrollToTopButtonVisible = false;
            }
        };
    }

    showImageSlides(event): any {
        let currentImage = event.currentTarget;
        let images = document.querySelectorAll('.contents img');
        let sendData = {
            'currentImage': currentImage,
            'images': images
        };
        this.nav.push(ImageSlidesPage, { 'sendData': sendData });
    }
}