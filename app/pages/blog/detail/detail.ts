// Third party library.
import {Component, ViewChild, Directive, HostListener, ViewContainerRef} from '@angular/core';
import {NavController, NavParams, Content} from 'ionic-angular';
import {TranslateService} from 'ng2-translate/ng2-translate';

// Utils.
import {Util} from '../../../utils/util';

// Services.
import {BlogService} from '../../../providers/blog-service';
import {ShareService} from '../../../providers/share-service';

// Pages.
import {AddCommentPage} from '../add-comment/add-comment';
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
        } else if (currentImage.parentElement.parentElement.className === 'comment-content selectable') {
            let images = currentImage.parentElement.querySelectorAll('img');
            let sendData = {
                'currentImage': currentImage,
                'images': images
            };
            this.nav.push(ImageSlidesPage, { 'sendData': sendData });
        }
    }
}

@Component({
    templateUrl: 'build/pages/blog/detail/detail.html',
    providers: [BlogService, Util],
    directives: [InnerContent]
})
export class BlogDetailPage {
    @ViewChild(Content) pageContent: Content;
    private community: any;
    private id: string;
    private readStatus: string;
    private newReplyFlag: string;
    private sendData: any;
    private title: string;
    private content: any;
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
    private hasAttachFilesForDownload: boolean = false;

    private pageLoadTime: number;
    private images: any;
    private sendDataToImageSlidesPage: any;

    constructor(private nav: NavController, private params: NavParams, private util: Util, private translate: TranslateService, private blogService: BlogService, private share: ShareService) {
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
            this.content = [data.content, [Img]];
            this.createDate = data.createDate;
            this.createUserName = data.createUserName;
            this.createUserAvatar = data.createUserAvatar;
            this.status = data.status;
            this.readCount = data.readCount;
            this.attachImagesForDisplay = data.attachImagesForDisplay;
            this.attachFilesForDownload = data.attachFilesForDownload;
            if (data.attachFilesForDownload.length > 0) {
                this.hasAttachFilesForDownload = true;
            }
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
                for (let i = 0; i < data.replyContents.length; i++) {
                    data.replyContents[i].content = [data.replyContents[i].content, [Img]];
                }
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
                for (let i = 0; i < data.replyContents.length; i++) {
                    data.replyContents[i].content = [data.replyContents[i].content, [Img]];
                }
                this.comments = this.comments.concat(data.replyContents);
            }
            infiniteScroll.complete();
        });
    }

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

    showCommentImageSlides(event): any {
        let currentImage = event.currentTarget;
        let images = currentImage.parentElement.querySelectorAll('img');
        let sendData = {
            'currentImage': currentImage,
            'images': images
        };
        this.nav.push(ImageSlidesPage, { 'sendData': sendData });
    }
}