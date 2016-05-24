import {Page, IonicApp, NavController, NavParams, ViewController, Platform, Content} from 'ionic-angular';
import {Component, ViewChild} from '@angular/core';

import {TranslatePipe} from 'ng2-translate/ng2-translate';

import {BlogService} from '../../../providers/blog/blog-service/blog-service';
import {AddCommentPage} from '../add-comment/add-comment';
import {Util} from '../../../utils/util';

@Page({
    templateUrl: 'build/pages/blog/detail/detail.html',
    providers: [BlogService, Util],
    pipes: [TranslatePipe],
    queries: {
        pageContent: new ViewChild(Content),
        blogDetailInfiniteScroll: new ViewChild('blogDetailInfiniteScroll')
    }
})
export class DetailPage {

    static get parameters() {
        return [[IonicApp], [NavController], [NavParams], [BlogService], [ViewController], [Platform]];
    }

    constructor(app, nav, params, blogService, view, platform) {
        this.app = app;
        this.nav = nav;
        this.params = params;
        this.view = view;
        this.platform = platform;

        this.community = this.params.get("community");
        this.id = this.community.communityID;
        this.readStatus = this.community.readStatus;
        this.newReplyFlag = this.community.newReplyFlag;

        this.blogService = blogService;
        this.sendData = {
            "id": this.id,
            "isRefreshFlag": false,
            "unrepliedCommentcontent": ""
        }

        this.userAvatarImageUrl = this.app.config.get("USER_AVATAR_IMAGE_URL");
        this.userAvatarDefaultImage = this.app.config.get("USER_AVATAR_DEFAULT_IMAGE");

        this.blogService.getCommunityDetailByCommunityID(this.id).then(data => {
            this.title = data.title;
            this.content = data.content;
            this.createUserId = data.createUser;
            this.createDate = data.createDate;
            this.createUserName = data.createUserName;
            this.status = data.status;
            this.readCount = data.readCount;
            this.isLoadCompleted = true;
            this.isScrollToTopButtonVisible = false;

        });
        this.getReplyContentListByCommunityID();
    }

    addComment() {
        this.nav.push(AddCommentPage, { "sendData": this.sendData });
    }

    getReplyContentListByCommunityID() {
        let position = 0;
        this.blogService.getReplyContentListByCommunityID(this.id, position).then(data => {
            if (data) {
                this.comments = data.replyContents;
                this.commentCount = data.cursor.maxRows;
            }
        });
    }

    doInfinite(infiniteScroll) {
        let position = this.comments.length;
        this.blogService.getReplyContentListByCommunityID(this.id, position).then(data => {
            if (data && data.replyContents[0]) {
                this.comments = this.comments.concat(data.replyContents);
            }
            infiniteScroll.complete();
        });
    }

    onPageLoaded() {
        this.pageLoadTime = new Date().getTime();
    }

    onPageWillEnter() {
        let isRefreshFlag = this.sendData.isRefreshFlag;
        if (isRefreshFlag == true) {
            let infiniteScroll = blogDetailInfiniteScroll;
            infiniteScroll._highestY = 0;
            this.getReplyContentListByCommunityID();
        }
        if (this.platform.is('ios')) {
            this.app.translate.get(["app.action.back"]).subscribe(message => {
                let title = message['app.action.back'];
                this.view.setBackButtonText(title);
            });
        }
    }

    onPageDidEnter() {
        let isRefreshFlag = this.sendData.isRefreshFlag;
        if (isRefreshFlag == true) {
            this.sendData.unrepliedCommentcontent = "";
        }

        let blogNewInformationCount = Number(this.app.blogNewInformationCount);

        if (this.status == "PUBLISH" && this.newReplyFlag == "TRUE") {
            this.updateNewReplyFlag();
        }
    }

    onPageWillLeave() {
        this.sendData.isRefreshFlag = false;
    }

    onPageWillUnload() {
        let now = new Date().getTime();
        let pageLoadingTime = now - this.pageLoadTime;
        if (this.status == "PUBLISH" && this.readStatus == "NOT_READ" && pageLoadingTime >= 3000) {
            this.updateReplyStatus();
        }
        this.isLoadCompleted = false;
        this.isScrollToTopButtonVisible = false;
    }

    updateReplyStatus() {
        let readStatus = "READ";
        this.blogService.updateReplyStatus(this.id, readStatus).then(data => {
            if (data == "true") {
                this.community.readStatus = readStatus;
                let blogNewInformationCount = Number(this.app.blogNewInformationCount);
                this.app.blogNewInformationCount = blogNewInformationCount - 1;
            }
        });
    }

    updateNewReplyFlag() {
        let newReplyFlag = "FALSE";
        this.blogService.updateNewReplyFlag(this.id, newReplyFlag).then(data => {
            if (data == "true") {
                this.community.newReplyFlag = newReplyFlag;
            }
        });
    }

    loadImageError(event) {
        let img = event.currentTarget;
        img.src = this.userAvatarImageUrl + this.userAvatarDefaultImage;
    }

    ngAfterViewInit() {
        this.pageContent.addScrollListener(this.onPageScroll(this));
    }

    scrollToDetailPageTop() {
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
