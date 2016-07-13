import {Page, IonicApp, Modal, NavController, NavParams, Alert, ViewController, Platform} from 'ionic-angular';

import {TranslatePipe} from 'ng2-translate/ng2-translate';

import {BlogService} from '../../../providers/blog-service';

import {Util} from '../../../utils/util';

import {DetailPage} from '../detail/detail';

@Page({
    templateUrl: 'build/pages/blog/add-comment/add-comment.html',
    providers: [
        BlogService,
        Util
    ],
    pipes: [TranslatePipe]
})
export class AddCommentPage {
    static get parameters() {
        return [[IonicApp], [NavController], [NavParams], [BlogService], [ViewController], [Platform], [Util]];
    }

    constructor(app, nav, params, blogService, view, platform, util) {
        this.app = app;
        this.nav = nav;
        this.view = view;
        this.platform = platform;
        this.blogService = blogService;
        this.util = util;
        this.params = params;
        this.sendData = this.params.get("sendData");
        this.id = this.sendData.id;

        this.comment = {
            communityID: this.id,
            content: this.sendData.unrepliedCommentcontent
        }
    }

    saveComment() {
        this.isDisabled = true;
        this.blogService.saveComment(this.comment).then(data => {
            if (data == "true") {
                this.sendData.isRefreshFlag = true;
                this.nav.pop();
            } else {
                this.isDisabled = null;
            }
        });
    }

    onPageWillLeave() {
        this.sendData.unrepliedCommentcontent = this.comment.content;
    }

    onPageWillEnter() {
        this.changeContent();
    }

    changeContent() {
        if (this.comment.content && this.util.deleteEmSpaceEnSpaceNewLineInCharacter(this.comment.content) != "") {
            this.isDisabled = null;
        } else {
            this.isDisabled = true;
        }
        this.autoResizeContent();
    }

    autoResizeContent() {
        let textarea = document.querySelector(".add-comment textarea");
        if (textarea.scrollHeight > 0) {
            textarea.style.height = textarea.scrollHeight + "px";
        } 
    }
}
