import {Page, NavController} from 'ionic-angular';

import {TranslatePipe} from 'ng2-translate/ng2-translate';

import {BlogService} from '../../../providers/blog/blog-service/blog-service'; 

import {DetailPage} from '../detail/detail';

/*
  Generated class for the BlogIndexPage page.

  See http://ionicframework.com/docs/v2/components/#navigation for more info on
  Ionic pages and navigation.
*/
@Page({
    templateUrl: 'build/pages/blog/index/index.html',
    providers: [BlogService],
    pipes: [TranslatePipe]
})
export class BlogIndexPage {
    static get parameters() {
        return [[NavController], [BlogService]];
    }

    constructor(nav, blogService) {
        this.nav = nav;
        this.blogService = blogService;
        
        // this.blogService.list().then(data => {
        //     this.blogs = data;
        // });
        this.blogService.getCommunityListForTop().then(data => {
            this.communityListForTop = data;
        });
    }

    openDetail(community) {
        this.nav.push(DetailPage, {
            "id": community.communityID
        });
    }
}
