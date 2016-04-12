import {Page, IonicApp, NavController, NavParams} from 'ionic-angular';
import {Component} from 'angular2/core';

import {TranslatePipe} from 'ng2-translate/ng2-translate';

import {BlogService} from '../../../providers/blog/blog-service/blog-service';
import {AddCommentPage} from '../add-comment/add-comment';
import {Util} from '../../../utils/util';

@Page({
    templateUrl: 'build/pages/blog/detail/detail.html',
    providers: [BlogService, Util],
    pipes: [TranslatePipe]
})
export class DetailPage {

    static get parameters() {
        return [[IonicApp], [NavController], [NavParams], [BlogService]];
    }

    constructor(app, nav, params, blogService) {
        this.app = app;
        this.nav = nav;
        this.params = params;
        
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
            let infiniteScroll = this.app.getComponent("blogDetailInfiniteScroll");
            infiniteScroll._highestY = 0;
            this.getReplyContentListByCommunityID();
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
    
    loadImageError(event){
        let img = event.currentTarget;
        img.src = this.userAvatarImageUrl + this.userAvatarDefaultImage;
    }
    
    ngAfterViewInit() {
        this.pageContent = this.app.getComponent('detail');
    }
    
    scrollToDetailPageTop() {
        this.pageContent.scrollToTop();
    }
}
