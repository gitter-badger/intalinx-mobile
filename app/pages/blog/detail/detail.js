import {Page, NavController, NavParams} from 'ionic-angular';
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
        return [[NavController], [NavParams], [BlogService]];
    }

    constructor(nav, params, blogService) {
        this.nav = nav;
        this.params = params;
        this.id = this.params.get("id");
        this.blogService = blogService;
        this.sendData = {
            "id": this.id,
            "isRefreshFlag": false,
            "unrepliedCommentcontent": ""
        }
        
        this.userAvatarImageUrl = this.nav.config.get("USER_AVAtar_IMAGE_URL");
        this.userAvatarImageType = this.nav.config.get("USER_AVATAR_IMAGE_TYPE");

        this.blogService.getCommunityDetailByCommunityID(this.id).then(data => {
            this.title = data.title;
            this.content = data.content;
            this.createDate = data.createDate;
            this.createUserName = data.createUserName;
            this.status = data.status;
            
            if (this.status == "PUBLISH") {
                this.blogService.updateReplyStatus(this.id, "READ");
            }
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
        });
        infiniteScroll.complete();
    }

    onPageWillEnter() {
        let isRefreshFlag = this.sendData.isRefreshFlag;
        if (isRefreshFlag == true) {
            this.getReplyContentListByCommunityID();
        }
    }

    onPageDidEnter() {
        let isRefreshFlag = this.sendData.isRefreshFlag;
        if (isRefreshFlag == true) {
            this.sendData.unrepliedCommentcontent = "";
        }
    }

    onPageWillLeave() {
        this.sendData.isRefreshFlag = false;
    }
}
