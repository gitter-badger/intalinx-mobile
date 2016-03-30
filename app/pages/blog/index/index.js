import {Page, NavController} from 'ionic-angular';

import {TranslatePipe} from 'ng2-translate/ng2-translate';

import {BlogService} from '../../../providers/blog/blog-service/blog-service';

import {DetailPage} from '../detail/detail';

import {Util} from '../../../utils/util';

/*
  Generated class for the BlogIndexPage page.

  See http://ionicframework.com/docs/v2/components/#navigation for more info on
  Ionic pages and navigation.
*/


@Page({
    templateUrl: 'build/pages/blog/index/index.html',
    providers: [BlogService, Util],
    pipes: [TranslatePipe]
})
export class BlogIndexPage {

    static get parameters() {
        return [[NavController], [BlogService]];
    }

    constructor(nav, blogService) {
        this.nav = nav;
        this.blogService = blogService;

        this.getCommunityListForTop();
    }

    openDetail(community) {
        this.nav.push(DetailPage, {
            "id": community.communityID
        });
    }

    doRefresh(refresher) {

        setTimeout(() => {
            // var object = new BlogIndexPage(this.nav, this.blogService);
            // console.log(object);
            // this.communityListForTop = object.communityListForTop;
            // this.constructor(this.nav, this.blogService);
            this.getCommunityListForTop();
            refresher.complete();
        }, 1000);
    }

    doInfinite(infiniteScroll) {

        setTimeout(() => {
            let position = this.communityListForTop.length;
            this.blogService.getCommunityListForTop(position).then(data => {
                if (data && data[0]) {
                    this.communityListForTop = this.communityListForTop.concat(data);
                }
                infiniteScroll.complete();
            });
        }, 1000);

    }

    getCommunityListForTop() {
        let position = 0;
        this.blogService.getCommunityListForTop(position).then(data => {
            this.communityListForTop = data;
        });
    }
}