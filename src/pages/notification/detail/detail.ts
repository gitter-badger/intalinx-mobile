// Third party library.
import {Component, ViewChild,  Directive, HostListener, ViewContainerRef, ElementRef, Renderer, OnDestroy} from '@angular/core';
import {NavController, NavParams, ViewController, Content} from 'ionic-angular';
import {NotificationService} from '../../../providers/notification-service';
import {FormsModule} from '@angular/forms';
import {DynamicComponentModule} from 'angular2-dynamic-component/index';

// Utils.
import {Util} from '../../../utils/util';

// Services.
import {ShareService} from '../../../providers/share-service';

// Pages.
// import {InnerContent} from '../../../shared/components/innercontent/innercontent';
import {ImageSlidesPage} from '../../../shared/components/image-slides/image-slides';

@Component({
    selector: 'page-notification-detail',
    templateUrl: 'detail.html',
    providers: [
        NotificationService,
        Util
    ]
    // ,
    // directives: [InnerContent]
})

export class NotificationDetailPage implements OnDestroy {
    @ViewChild(Content) pageContent: Content;

    public notification: any;
    public id: string;
    public readStatus: string;
    // The detail data of event.
    public title: string;
    public content: any;
    public createUserId: string;
    public publishStartDate: string;
    public createUserAvatar: string;
    public createUserName: string;
    public status: string;
    public readCount: string;
    public isLoadCompleted: boolean;
    public isScrollToTopButtonVisible: boolean;
    // The number of milliseconds between midnight, January 1, 1970.
    public pageLoadTime: number;
    public attachFilesForDownload: any;
    public attachImagesForDisplay: any;
    public hasAttachFilesForDownload: boolean = false;

    public clickListener: Function;

    public outerDynamicModules = [DynamicComponentModule];
    public outerDynamicContext = {
        innerDynamicContext: {},
        innerDynamicTemplate: ``,
        innerDynamicModules: [
            FormsModule
        ]
    };
    public outerDynamicTemplate = `
        <DynamicComponent [componentContext]='innerDynamicContext' 
                          [componentModules]='innerDynamicModules'
                          [componentTemplate]='innerDynamicTemplate'>         
        </DynamicComponent>
   `;

    dynamicCallback(event) {
        this.clickListener = this.renderer.listen(this.elementRef.nativeElement, 'click', (event) => {
            let currentImage = event.target;
            if (currentImage.parentElement.parentElement.parentElement.className === 'contents selectable') {
                let images = currentImage.ownerDocument.querySelectorAll('.contents img');
                let sendData = {
                    'currentImage': currentImage,
                    'images': images
                };
                this.nav.push(ImageSlidesPage, { 'sendData': sendData });
            }
        })
    }

    ngOnDestroy() {
        this.clickListener();
    }

    constructor(public elementRef: ElementRef, 
        public renderer: Renderer,
        public nav: NavController,
        public params: NavParams,
        public notificationService: NotificationService,
        public view: ViewController,
        public share: ShareService) {
        this.notification = this.params.get('notification');
        this.id = this.notification.notificationID;
        this.readStatus = this.notification.readStatus;

        this.getNotificationDetailByNotificationID();
    }

    getNotificationDetailByNotificationID(): void {
        this.notificationService.getNotificationDetailByNotificationID(this.id).then((data: any) => {
            this.title = data.title;
            // this.content = [data.content, [Img]];
            this.outerDynamicContext.innerDynamicTemplate = data.content;
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

    ionViewDidLoad(): void {
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