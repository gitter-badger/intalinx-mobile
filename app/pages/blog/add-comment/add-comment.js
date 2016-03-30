import {Page, NavController, NavParams} from 'ionic-angular';

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
        return [[NavController], [NavParams], [BlogService], [Util]];
    }

    constructor(nav, params, blogService, util) {
        this.nav = nav;
        this.blogService = blogService;
        this.params = params;
        this.id = this.params.get("id");
        this.reply = this.params.get("reply");
        this.util = util;
        this.isSaveReply = false;

        this.comment = {
            communityID: this.id,
            content: ""
        }
    }

    saveComment() {
        if (this.comment.content == null || this.comment.content.replace(" ", "").replace("　", "") == "") {
            alert("コメントを入力してください！");
        } else {
            this.blogService.insertReplyContent(this.comment).then(data => {
                if (data == "true") {
                    this.isSaveReply = true;
                    this.nav.pop();
                    // this.nav.popTo(DetailPage, {
                    //     "id": this.id,
                    //     "reply": this.reply,
                    //     "isSaveReply": this.isSaveReply
                    // });
                } else {
                    alert("システムエラーが発生しました。大変お迷惑かかりましたが、システム管理者に連絡してください！");
                }
            })
        }
    }
}
