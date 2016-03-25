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
            data.forEach(function(element) {
                var publishDate = new Date(element.publishStartDate.replace("T", " "));
                var now = new Date();
                var publishedMinutes = parseInt((now.getTime() - publishDate.getTime()) / (60 * 1000));
                if (publishedMinutes >= 60 * 24 * 365) {
                    // 一年前の場合
                    var years = parseInt(publishedMinutes / (60 * 24 * 365));
                    element.publishStartDate = years + "年前";
                } else if (publishedMinutes >= 60 * 24 * 30) {
                    // 一か月前の場合
                    var months = parseInt(publishedMinutes / (60 * 24 * 30));
                    element.publishStartDate = months + "月前";
                } else if (publishedMinutes >= 60 * 24) {
                    // 一日前の場合
                    var days = parseInt(publishedMinutes / (60 * 24));
                    element.publishStartDate = days + "日前";
                } else if (publishedMinutes >= 60) {
                    // 一時間後、一日以内
                    var hours = parseInt(publishedMinutes / 60);
                    element.publishStartDate = hours + "時前";
                } else {
                    //　一時間以内
                    element.publishStartDate = publishedMinutes + "分前";
                }
            }, this);
            this.communityListForTop = data;
        });
        
    }

    openDetail(community) {
        this.nav.push(DetailPage, {
            "id": community.communityID
        });
    }
}
