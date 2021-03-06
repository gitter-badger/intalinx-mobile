import {Page, IonicApp, Modal, NavController, NavParams, Alert, ViewController, Platform} from 'ionic-angular';

import {NgForm} from '@angular/common';

import {TranslatePipe} from 'ng2-translate/ng2-translate';

import {BlogService} from '../../../providers/blog/blog-service/blog-service';

import {Util} from '../../../utils/util';

import {DetailPage} from '../detail/detail';

/*
  Generated class for the AddCommentPage page.

  See http://ionicframework.com/docs/v2/components/#navigation for more info on
  Ionic pages and navigation.
*/
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
        if (this.platform.is('ios')) {
            this.app.translate.get(["app.action.back"]).subscribe(message => {
                let title = message['app.action.back'];
                this.view.setBackButtonText(title);
            });
        }
        if (this.comment.content && this.util.deleteEmSpaceEnSpaceNewLineInCharacter(this.comment.content) != "") {
            this.isDisabled = null;
        } else {
            this.isDisabled = true;
        }
    }
    
    onPageDidEnter () {
        let height = document.getElementById("addComment").offsetHeight;
        document.getElementsByTagName("textarea")[0].style.height = (height - 32)  + "px";
    }

    changeContent() {
        if (this.comment.content && this.util.deleteEmSpaceEnSpaceNewLineInCharacter(this.comment.content) != "") {
            this.isDisabled = null;
        } else {
            this.isDisabled = true;
        }
    }
}
