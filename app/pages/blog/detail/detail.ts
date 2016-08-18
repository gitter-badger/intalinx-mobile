// Third party library.
import {Component, ViewChild, ViewChildren, Directive, ElementRef, Renderer, QueryList} from '@angular/core';
import {NavController, NavParams, Content, Slides} from 'ionic-angular';
import {Transfer} from 'ionic-native';
import {TranslateService} from 'ng2-translate/ng2-translate';

// Utils.
import {Util} from '../../../utils/util';

// Services.
import {BlogService} from '../../../providers/blog-service';
import {ShareService} from '../../../providers/share-service';

// Pages.
import {AddCommentPage} from '../add-comment/add-comment';
import {DownloadDirective} from '../../../shared/components/download/download';

@Directive({
    selector: 'img',
    host: {
        '(click)': 'onClick()'
    }
})
export class Img {
    constructor() {

    }
    onClick() {
        console.log("img init")
    }
}

@Component({
    templateUrl: 'build/pages/blog/detail/detail.html',
    providers: [BlogService, Util, DownloadDirective],
    directives: [DownloadDirective, Img]
})
export class BlogDetailPage {
    @ViewChild(Content) pageContent: Content;
    @ViewChildren(Img) images: QueryList<Img>;

    private community: any;
    private id: string;
    private readStatus: string;
    private newReplyFlag: string;
    private sendData: any;
    private title: string;
    private content: string;
    private createDate: string;
    private createUserName: string;
    private createUserAvatar: string;
    private status: string;
    private readCount: string;
    private isLoadCompleted: boolean;
    private isScrollToTopButtonVisible: boolean;

    private comments: any;
    private commentCount: string;
    private attachFilesForDownload: any;
    private attachImagesForDisplay: any;

    private pageLoadTime: number;
    // private images: any;
    private sendDataToImageSlidesPage: any;
    private isShowImageSlides: boolean = false;

    constructor(private nav: NavController, private params: NavParams, private elementRef: ElementRef, private renderer: Renderer, private blogService: BlogService, private share: ShareService, private downloadDirective: DownloadDirective) {
        this.community = this.params.get('community');
        this.id = this.community.communityID;
        this.readStatus = this.community.readStatus;
        this.newReplyFlag = this.community.newReplyFlag;

        this.sendData = {
            'id': this.id,
            'isRefreshFlag': false,
            'unrepliedCommentcontent': ''
        };

        this.getCommunityDetailByCommunityID();
        this.getReplyContentListByCommunityID();
    }

    addComment(): void {
        this.nav.push(AddCommentPage, { 'sendData': this.sendData });
    }

    getCommunityDetailByCommunityID(): void {
        this.blogService.getCommunityDetailByCommunityID(this.id).then((data: any) => {
            this.title = data.title;
            this.createDate = data.createDate;
            this.createUserName = data.createUserName;
            this.createUserAvatar = data.createUserAvatar;
            this.status = data.status;
            this.readCount = data.readCount;
            this.attachImagesForDisplay = data.attachImagesForDisplay;
            this.attachFilesForDownload = data.attachFilesForDownload;
            this.content = data.content;
            // this.content = data.content.replace('<img', '<img (click)=\'clickToShowImageSlidesthat()\'');
            this.isLoadCompleted = true;
            this.isScrollToTopButtonVisible = false;
            if (this.status === 'PUBLISH' && this.newReplyFlag === 'TRUE') {
                this.updateNewReplyFlag();
            }
        });
    }

    getReplyContentListByCommunityID(): void {
        let position = 0;
        this.blogService.getReplyContentListByCommunityID(this.id, position).then((data: any) => {
            if (data) {
                this.comments = data.replyContents;
                this.commentCount = data.cursor.maxRows;
            }
        });
    }

    doInfinite(infiniteScroll): void {
        let position: number;
        if (this.comments) {
            position = this.comments.length;
        } else {
            position = 0;
        }

        this.blogService.getReplyContentListByCommunityID(this.id, position).then((data: any) => {
            if (data && data.replyContents[0]) {
                this.comments = this.comments.concat(data.replyContents);
            }
            infiniteScroll.complete();
        });
    }

    // afterContentLoaded(): void {
    //     this.images = document.querySelectorAll('.contents img');
    //     this.images.forEach(image => {
    //         image.addEventListener('click', this.showImageSlides(this));
    //     });
    // }

    ionViewLoaded(): void {
        this.pageLoadTime = new Date().getTime();
    }

    ionViewWillEnter(): void {
        let isRefreshFlag = this.sendData.isRefreshFlag;
        if (isRefreshFlag === true) {
            this.getReplyContentListByCommunityID();
        }
    }

    ionViewDidEnter(): void {
        let isRefreshFlag = this.sendData.isRefreshFlag;
        if (isRefreshFlag === true) {
            this.pageContent.scrollToBottom();
            this.sendData.unrepliedCommentcontent = '';
        }
    }

    ionViewWillLeave(): void {
        this.sendData.isRefreshFlag = false;
    }

    ionViewWillUnload(): void {
        let now = new Date().getTime();
        let pageLoadingTime = now - this.pageLoadTime;
        if (this.status === 'PUBLISH' && this.readStatus === 'NOT_READ' && pageLoadingTime >= 3000) {
            this.updateReplyStatus();
        }
        this.isLoadCompleted = false;
        this.isScrollToTopButtonVisible = false;
    }

    updateReplyStatus(): void {
        let readStatus = 'READ';
        this.blogService.updateReplyStatus(this.id, readStatus).then((data: string) => {
            if (data === 'true') {
                this.community.readStatus = readStatus;
                let blogNewInformationCount = this.share.blogNewInformationCount;
                this.share.blogNewInformationCount = blogNewInformationCount - 1;
            }
        });
    }

    updateNewReplyFlag(): void {
        let newReplyFlag = 'FALSE';
        this.blogService.updateNewReplyFlag(this.id, newReplyFlag).then((data: string) => {
            if (data === 'true') {
                this.community.newReplyFlag = newReplyFlag;
            }
        });
    }

    ngAfterViewInit(): void {
        this.pageContent.addScrollListener(this.onPageScroll(this));

    }

    ngAfterContentInit(): void {
        //  this.images.forEach(image => {
        //     debugger
        //     // image.addElementLi('click', this.showImageSlides(this));
        // });
        //     this.images = document.querySelectorAll('.contents img');
        //     this.images.forEach(image => {
        //         image.addEventListener('click', this.showImageSlides(this));
        //     });
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

    showImageSlides(that): any {
        return function () {
            that.images = document.querySelectorAll('.contents img');
            // that.nav.push(ImageSlidesPage, { 'images': that.images });
            that.isShowImageSlides = true;
        };
    }

    // clickToShowImageSlidesthat(): any {
    //     this.images = document.querySelectorAll('.contents img');
    //     // this.nav.push(ImageSlidesPage, { 'images': this.images });
    //     this.isShowImageSlides = true;
    // }

    downloadAttachFile() {
        alert('cant download');
    }

    backToBlogDetail() {
        this.isShowImageSlides = false;
    }
}

@Component({
    template: `
    <ion-content>
        <ion-slides [options]="imageSlideOptions">
            <ion-slide *ngFor="let image of images" (click)="backToBlogDetail()">
                <img src="{{image.src}}" />
            </ion-slide>
        </ion-slides>
    </ion-content>
  `
})
class ImageSlidesPage {
    private images: any;
    private imageSlideOptions: any;
    constructor(private nav: NavController, private params: NavParams) {
        this.images = this.params.get('images');
        this.imageSlideOptions = {
            initialSlide: 1,
            loop: false,
            direction: 'horizontal'
        }
    }

    backToBlogDetail() {
        setTimeout(() => {
            this.nav.pop();
        }, 500);
    }
}