import {Page, IonicApp, Modal, NavController, NavParams, Alert, ViewController} from 'ionic-angular';

import {NgForm} from 'angular2/common';

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
        return [[IonicApp], [NavController], [NavParams], [BlogService], [ViewController]];
    }

    constructor(app, nav, params, blogService, view) {
        this.app = app;
        this.nav = nav;
        this.view = view;
        this.blogService = blogService;
        this.params = params;
        this.sendData = this.params.get("sendData");
        this.id = this.sendData.id;

        this.comment = {
            communityID: this.id,
            content: this.sendData.unrepliedCommentcontent
        }
    }

    saveComment() {
        this.blogService.saveComment(this.comment).then(data => {
            if (data == "true") {
                this.sendData.isRefreshFlag = true;
                this.nav.pop();
            }
        });
    }

    onPageWillLeave() {
        this.sendData.unrepliedCommentcontent = this.comment.content;
    }
    
    onPageWillEnter() {
        this.app.translate.get(["app.action.back"]).subscribe(message => {
            let title = message['app.action.back']; 
            this.view.setBackButtonText(title);
        });
    }
}
