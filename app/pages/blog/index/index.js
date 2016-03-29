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

        // this.communityListForTopAll = [];
        this.blogService.getCommunityListForTop().then(data => {
            this.communityListForTop = data;
        });

        // // 初期表示のブログ数
        // var firstDisplayCommunityCount = 10;
        // // プルアップする時、追加表示のブログ数
        // this.secondAddDisplayCommunityCount = 3;

        // this.communityListForTop = [];
        // this.firstDisplayCount = this.communityListForTopAll.length;

        // this.leftDisplayCount = 0;
        // if (this.communityListForTopAll.length > firstDisplayCommunityCount) {
        //     this.firstDisplayCount = firstDisplayCommunityCount;
        //     this.leftDisplayCount = this.communityListForTopAll.length - firstDisplayCommunityCount;
        // }
        // for (var i = 0; i < this.firstDisplayCount; i++) {
        //     this.communityListForTop.push(this.communityListForTopAll[i]);
        // }
        // this.displayedCount = this.firstDisplayCount;

    }
    
    openDetail(community) {
        this.nav.push(DetailPage, {
            "id": community.communityID
        });
    }
   }

    // doRefresh(refresher) {

    //     setTimeout(() => {
    //         // var object = new BlogIndexPage(this.nav, this.blogService);
    //         // console.log(object);
    //         // this.communityListForTop = object.communityListForTop;
    //         this.constructor(this.nav, this.blogService);
    //         refresher.complete();
    //     }, 5000);
    // }

    // doInfinite(infiniteScroll) {
    //     setTimeout(() => {
    //         var nextDisplayCount = this.secondAddDisplayCommunityCount;
    //         if (this.leftDisplayCount < this.secondAddDisplayCommunityCount) {
    //             nextDisplayCount = this.leftDisplayCount;
    //         }
    //         for (var i = 0; i < nextDisplayCount; i++) {
    //             this.communityListForTop.push(this.communityListForTopAll[this.displayedCount]);
    //             this.leftDisplayCount--;
    //             this.displayedCount++;
    //         }

    //         infiniteScroll.complete();
    //     }, 500);
    // }
    
//     class Blog {
//     constructor(
//         public communityID:string,
//         public name:string) { }
// }