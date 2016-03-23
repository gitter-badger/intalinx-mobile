import {Page, NavController, NavParams} from 'ionic-angular';
import {Component} from 'angular2/core';

import {TranslatePipe} from 'ng2-translate/ng2-translate';

import {BlogService} from '../../../providers/blog/blog-service/blog-service';
import {AddCommentPage} from '../comment/add'; 

/*
  Generated class for the DetailPage page.

  See http://ionicframework.com/docs/v2/components/#navigation for more info on
  Ionic pages and navigation.
*/
@Page({
    templateUrl: 'build/pages/blog/detail/detail.html',
    providers: [BlogService],
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
        
        // this.blog = new Blog("", "お待ちください。");
        this.blogService.getCommunityDetailByCommunityID(this.id).then(data => {
            this.title = data.CommunityOutput.title;
            this.content = data.CommunityOutput.content;
            this.createDate = data.CommunityOutput.createDate;//.substring(0, 7);
        });

        this.blogService.getReplyContentListByCommunityID(this.id).then(data => {
            this.comments = data;
            this.commentCount = data.length;
        });
    }
    
    addComment() {
        this.nav.push(AddCommentPage, {
            "id": this.id,
            "title": this.title
        });
    }
}

