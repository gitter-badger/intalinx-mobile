import {Page, NavController, NavParams} from 'ionic-angular';
import {Component} from 'angular2/core';

import {TranslatePipe} from 'ng2-translate/ng2-translate';

import {BlogService} from '../../../providers/blog/blog-service/blog-service';
import {AddCommentPage} from '../add-comment/add-comment';
import {Util} from '../../../utils/util';

/*
  Generated class for the DetailPage page.

  See http://ionicframework.com/docs/v2/components/#navigation for more info on
  Ionic pages and navigation.
*/
@Page({
    templateUrl: 'build/pages/blog/detail/detail.html',
    providers: [BlogService, Util],
    pipes: [TranslatePipe]
})
export class DetailPage {

    static get parameters() {
        return [[NavController], [NavParams], [BlogService], [Util]];
    }

    constructor(nav, params, blogService, util) {
        this.nav = nav;
        this.params = params;
        this.id = this.params.get("id");
        this.blogService = blogService;

        this.blogService.getCommunityDetailByCommunityID(this.id).then(data => {
            this.title = data.title;
            this.content = data.content;
            this.createDate = data.createDate;
        });

        let position = 0;
        this.blogService.getReplyContentListByCommunityID(this.id, position).then(data => {
            if (data) {
                this.comments = data.replyContents;
                this.commentCount = data.cursor.maxRows;
            }
        });
    }

    doInfinite(infiniteScroll) {
        setTimeout(() => {
            let position = this.comments.length;
            this.blogService.getReplyContentListByCommunityID(this.id, position).then(data => {
                if (data && data.replyContents[0]) {
                    this.comments = this.comments.concat(data.replyContents);
                }
            });
            infiniteScroll.complete();
        }, 1000);
    }

    addComment() {
        this.nav.push(AddCommentPage, {
            "id": this.id,
            "title": this.title
        });
    }

}

