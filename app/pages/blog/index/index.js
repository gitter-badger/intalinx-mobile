import {Page, IonicApp, NavController} from 'ionic-angular';

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
        return [[IonicApp], [NavController], [BlogService]];
    }

    constructor(app, nav, blogService) {
        this.app = app;
        this.nav = nav;
        this.blogService = blogService;
        this.userAvatarImageUrl = this.app.config.get("USER_AVATAR_IMAGE_URL");
        this.userAvatarDefaultImage = this.app.config.get("USER_AVATAR_DEFAULT_IMAGE");
        
        this.getCommunityListForTop();
        this.getBlogNewInformationCount();
    }
    
    onPageWillEnter() {
        this.isLoadCompleted = false;
    }

    openDetail(community) {      
        this.nav.push(DetailPage, {
            "community": community
        });
    }

    doRefresh(refresher) {
        let isRefresh = true;
        this.getCommunityListForTop(isRefresh);
        this.getBlogNewInformationCount();
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

    getCommunityListForTop(isRefresh) {
        let position = 0;
        let isNeedRegistNotExistsReply = true;
        this.blogService.getCommunityListForTop(position, isNeedRegistNotExistsReply).then(data => {
            this.communityListForTop = data;
            this.isLoadCompleted = true;
            if (isRefresh) {
                let infiniteScroll = this.app.getComponent("blogIndexInfiniteScroll");
                infiniteScroll._highestY = 0;
                let refresher = this.app.getComponent("blogIndexRefresher");
                refresher.complete();
            }
        });
    }
    
    getBlogNewInformationCount() {
        this.blogService.getNotReadCommunityCountBySelf().then(data => {
            if (data) {
                this.app.blogNewInformationCount = data;
            }
        });
    }
    
    loadImageError(event){
        let img = event.currentTarget;
        img.src = this.userAvatarImageUrl + this.userAvatarDefaultImage;
    }
}