import {Page, NavController, NavParams} from 'ionic-angular';

import {NgForm} from 'angular2/common';

import {TranslatePipe} from 'ng2-translate/ng2-translate';

import {BlogService} from '../../../providers/blog/blog-service/blog-service';

@Page({
    templateUrl: 'build/pages/blog/comment/add.html',
    providers: [
        BlogService
    ],
    pipes: [TranslatePipe]
})
export class AddCommentPage {
    static get parameters() {
        return [[NavController], [NavParams], [BlogService]];
    }

    constructor(nav, params, blogService) {
        this.nav = nav;
        this.blogService = blogService;
        this.params = params;
        this.id = this.params.get("id");
        this.title = this.params.get("title");

        this.comment = {
            id: this.id,
            content: ""
        }
    }

    saveComment() {
        if (this.blogService.saveComment(this.comment)) {
            this.nav.pop();
        }
    }
}