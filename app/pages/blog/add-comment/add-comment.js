import {Page, IonicApp, Modal, NavController, NavParams, Alert} from 'ionic-angular';

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
        return [[IonicApp], [NavController], [NavParams], [BlogService]];
    }

    constructor(app, nav, params, blogService) {
        this.app = app;
        this.nav = nav;
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
        if (this.comment.content == null || this.comment.content.replace(" ", "").replace("　", "") == "") {
            this.app.translate.get(["app.blog.message.error.title", "app.blog.message.error.noContent", "app.action.ok"]).subscribe(message => {
                let title = message['app.blog.message.error.title'];
                let ok = message['app.action.ok'];
                let content = message['app.blog.message.error.noContent'];

                let alert = Alert.create({
                    title: title,
                    subTitle: content,
                    buttons: [ok]
                });
                this.nav.present(alert);
            });
        } else {
            this.blogService.insertReplyContent(this.comment).then(data => {
                if (data == "true") {
                    this.sendData.isRefreshFlag = true;
                    this.nav.pop();
                } else {
                    this.app.translate.get(["app.blog.message.error.title", "app.message.error.systemError", "app.action.ok"]).subscribe(message => {
                        let title = message['app.blog.message.error.title'];
                        let ok = message['app.action.ok'];
                        let content = message['app.message.error.systemError'];

                        let alert = Alert.create({
                            title: title,
                            subTitle: content,
                            buttons: [ok]
                        });
                        this.nav.present(alert);
                    });
                }
            })
        }
    }

    onPageWillLeave() {
        this.sendData.unrepliedCommentcontent = this.comment.content;
    }
}
