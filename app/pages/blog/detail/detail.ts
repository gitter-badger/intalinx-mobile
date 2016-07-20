// Third party library.
import {Injectable, Component, ViewChild} from '@angular/core';
import {NavController, NavParams, Content} from 'ionic-angular';
import {TranslateService} from 'ng2-translate/ng2-translate';

// Utils.
import {Util} from '../../../utils/util';

// Services.
import {BlogService} from '../../../providers/blog-service';
import {ShareService} from '../../../providers/share-service';

// Pages.
import {AddCommentPage} from '../add-comment/add-comment';

@Component({
    templateUrl: 'build/pages/blog/detail/detail.html',
    providers: [BlogService, Util],
})
export class DetailPage {
    @ViewChild(Content) pageContent: Content;

    private community: any;
    private id: string;
    private readStatus: string;
    private newReplyFlag: string;
    private sendData = {
        'id': this.id,
        'isRefreshFlag': false,
        'unrepliedCommentcontent': ''
    };
    private title: string;
    private content: string;
    private createUserId: string;
    private createDate: string;
    private createUserName: string;
    private createUserAvatar: string;
    private status: string;
    private readCount: string;
    private isLoadCompleted: boolean;
    private isScrollToTopButtonVisible: boolean;

    private comments: any;
    private commentCount: string;

    private pageLoadTime: number;

    constructor(private nav: NavController, private params: NavParams, private blogService: BlogService, private share: ShareService) {
        this.community = this.params.get('community');
        this.id = this.community.communityID;
        this.readStatus = this.community.readStatus;
        this.newReplyFlag = this.community.newReplyFlag;

        // this.sendData = {
        //     'id': this.id,
        //     'isRefreshFlag': false,
        //     'unrepliedCommentcontent': ''
        // }

        this.getCommunityDetailByCommunityID();
        this.getReplyContentListByCommunityID();
    }

    addComment(): void {
        this.nav.push(AddCommentPage, { 'sendData': this.sendData });
    }

    getCommunityDetailByCommunityID(): void {
        this.blogService.getCommunityDetailByCommunityID(this.id).then((data: any) => {
            this.title = data.title;
            this.content = data.content;
            this.createUserId = data.createUser;
            this.createDate = data.createDate;
            this.createUserName = data.createUserName;
            this.createUserAvatar = data.createUserAvatar;
            this.status = data.status;
            this.readCount = data.readCount;
            this.isLoadCompleted = true;
            this.isScrollToTopButtonVisible = false;

        });
    }

    getReplyContentListByCommunityID(): void {
        let position = 0;
        this.blogService.getReplyContentListByCommunityID(this.id, position).then((data: any) => {
            debugger;
            if (data) {
                this.comments = data.replyContents;
                this.commentCount = data.cursor.maxRows;
            }
        });
    }

    doInfinite(infiniteScroll): void {
        let position = this.comments.length;
        this.blogService.getReplyContentListByCommunityID(this.id, position).then((data: any) => {
            if (data && data.replyContents[0]) {
                this.comments = this.comments.concat(data.replyContents);
            }
            infiniteScroll.complete();
        });
    }

    onPageLoaded(): void {
        this.pageLoadTime = new Date().getTime();
    }

    onPageWillEnter(): void {
        let isRefreshFlag = this.sendData.isRefreshFlag;
        if (isRefreshFlag === true) {
            this.getReplyContentListByCommunityID();
        }
    }

    onPageDidEnter(): void {
        let isRefreshFlag = this.sendData.isRefreshFlag;
        if (isRefreshFlag === true) {
            this.pageContent.scrollToBottom();
            this.sendData.unrepliedCommentcontent = '';
        }

        if (this.status === 'PUBLISH' && this.newReplyFlag === 'TRUE') {
            this.updateNewReplyFlag();
        }
    }

    onPageWillLeave(): void {
        this.sendData.isRefreshFlag = false;
    }

    onPageWillUnload(): void {
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
                let blogNewInformationCount = Number(this.share.blogNewInformationCount);
                this.share.blogNewInformationCount = (blogNewInformationCount - 1).toString();
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
        return function() {
            if (this.scrollTop > 200) {
                that.isScrollToTopButtonVisible = true;
            } else {
                that.isScrollToTopButtonVisible = false;
            }
        };  
    }
}
