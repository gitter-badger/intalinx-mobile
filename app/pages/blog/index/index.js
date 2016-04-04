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
        this.getCommunityListForTop();
        refresher.complete();
    }

    doInfinite(infiniteScroll) {
        let position = this.communityListForTop.length;
        let isNeedRegistNotExistsReply = false;
        this.blogService.getCommunityListForTop(position, isNeedRegistNotExistsReply).then(data => {
            if (data && data[0]) {
                this.communityListForTop = this.communityListForTop.concat(data);
            }
            infiniteScroll.complete();
        });
    }

    getCommunityListForTop() {
        let position = 0;
        let isNeedRegistNotExistsReply = true;
        this.blogService.getCommunityListForTop(position, isNeedRegistNotExistsReply).then(data => {
            this.communityListForTop = data;
        });
    }
}