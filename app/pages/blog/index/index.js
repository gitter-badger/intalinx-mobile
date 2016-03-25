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

        // this.communityListForTopAll = [];
        // this.blogService.getCommunityListForTop().then(data => {
        //     this.communityListForTopAll = data;
        // });
        this.communityListForTopAll = this.initData();
        
        // 初期表示のブログ数
        var firstDisplayCommunityCount = 10;
        // プルアップする時、追加表示のブログ数
        this.secondAddDisplayCommunityCount = 3;
        
        this.communityListForTop = [];
        this.firstDisplayCount = this.communityListForTopAll.length;

        this.leftDisplayCount = 0;
        if (this.communityListForTopAll.length > firstDisplayCommunityCount) {
            this.firstDisplayCount = firstDisplayCommunityCount;
            this.leftDisplayCount = this.communityListForTopAll.length - firstDisplayCommunityCount;
        }
        for (var i = 0; i < this.firstDisplayCount; i++) {
            this.communityListForTop.push(this.communityListForTopAll[i]);
        }
        this.displayedCount = this.firstDisplayCount;

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
            this.constructor(this.nav, this.blogService);
            refresher.complete();
        }, 5000);
    }
    
    doInfinite(infiniteScroll) {
        setTimeout(() => {
            var nextDisplayCount = this.secondAddDisplayCommunityCount;
            if (this.leftDisplayCount < this.secondAddDisplayCommunityCount) {
                nextDisplayCount = this.leftDisplayCount;
            }
            for (var i = 0; i < nextDisplayCount; i++) {
                this.communityListForTop.push(this.communityListForTopAll[this.displayedCount]);
                this.leftDisplayCount--;
                this.displayedCount++;
            }

            infiniteScroll.complete();
        }, 500);
    }
    
    initData() {
        return [
            {
                "communityID": "833e705a-11c4-4f2d-9b0f-2097579f7914",
                "title": "1タイトルcommunity0224",
                "createUser": "",
                "publishStartDate": "2016-02-23T19:14:52.0",
                "readStatus": "NOT_READ",
                "readStatusOrder": "1",
                "newReplyFlag": "FALSE",
                "newReplyFlagOrder": "0",
                "isAlreadyExists": "TRUE"
            },
            {
                "communityID": "5f90c3e5-febe-4cce-949b-4766b0778443",
                "title": "2AED講習2回目（リスケ分）",
                "createUser": "",
                "publishStartDate": "2016-02-16T16:08:41.0",
                "readStatus": "NOT_READ",
                "readStatusOrder": "1",
                "newReplyFlag": "FALSE",
                "newReplyFlagOrder": "0",
                "isAlreadyExists": "TRUE"
            },
            {
                "communityID": "a5f96af3-3a40-4f2e-9f1b-62f92762fd11",
                "title": "3【4F朝会】ビジネスマナーの基本-挨拶（2/15）",
                "createUser": "",
                "publishStartDate": "2016-02-16T14:21:56.0",
                "readStatus": "NOT_READ",
                "readStatusOrder": "1",
                "newReplyFlag": "FALSE",
                "newReplyFlagOrder": "0",
                "isAlreadyExists": "TRUE"
            },
            {
                "communityID": "a92b4597-d8e5-431b-bf85-41d9f289044d",
                "title": "4第５回教育の為のＴＯＣシンポジウム",
                "createUser": "",
                "publishStartDate": "2016-02-14T20:32:20.0",
                "readStatus": "NOT_READ",
                "readStatusOrder": "1",
                "newReplyFlag": "FALSE",
                "newReplyFlagOrder": "0",
                "isAlreadyExists": "TRUE"
            },
            {
                "communityID": "a92b4597-d8e5-431b-bf85-41d9f289044d",
                "title": "5第５回教育の為のＴＯＣシンポジウム",
                "createUser": "",
                "publishStartDate": "2016-02-14T20:32:20.0",
                "readStatus": "NOT_READ",
                "readStatusOrder": "1",
                "newReplyFlag": "FALSE",
                "newReplyFlagOrder": "0",
                "isAlreadyExists": "TRUE"
            },
            {
                "communityID": "a92b4597-d8e5-431b-bf85-41d9f289044d",
                "title": "6第５回教育の為のＴＯＣシンポジウム",
                "createUser": "",
                "publishStartDate": "2016-02-14T20:32:20.0",
                "readStatus": "NOT_READ",
                "readStatusOrder": "1",
                "newReplyFlag": "FALSE",
                "newReplyFlagOrder": "0",
                "isAlreadyExists": "TRUE"
            },
            {
                "communityID": "a92b4597-d8e5-431b-bf85-41d9f289044d",
                "title": "7第５回教育の為のＴＯＣシンポジウム",
                "createUser": "",
                "publishStartDate": "2016-02-14T20:32:20.0",
                "readStatus": "NOT_READ",
                "readStatusOrder": "1",
                "newReplyFlag": "FALSE",
                "newReplyFlagOrder": "0",
                "isAlreadyExists": "TRUE"
            },
            {
                "communityID": "a92b4597-d8e5-431b-bf85-41d9f289044d",
                "title": "8第５回教育の為のＴＯＣシンポジウム",
                "createUser": "",
                "publishStartDate": "2016-02-14T20:32:20.0",
                "readStatus": "NOT_READ",
                "readStatusOrder": "1",
                "newReplyFlag": "FALSE",
                "newReplyFlagOrder": "0",
                "isAlreadyExists": "TRUE"
            },
            {
                "communityID": "a92b4597-d8e5-431b-bf85-41d9f289044d",
                "title": "9第５回教育の為のＴＯＣシンポジウム",
                "createUser": "",
                "publishStartDate": "2016-02-14T20:32:20.0",
                "readStatus": "NOT_READ",
                "readStatusOrder": "1",
                "newReplyFlag": "FALSE",
                "newReplyFlagOrder": "0",
                "isAlreadyExists": "TRUE"
            },
            {
                "communityID": "a92b4597-d8e5-431b-bf85-41d9f289044d",
                "title": "10第５回教育の為のＴＯＣシンポジウム",
                "createUser": "",
                "publishStartDate": "2016-02-14T20:32:20.0",
                "readStatus": "NOT_READ",
                "readStatusOrder": "1",
                "newReplyFlag": "FALSE",
                "newReplyFlagOrder": "0",
                "isAlreadyExists": "TRUE"
            },
            {
                "communityID": "a92b4597-d8e5-431b-bf85-41d9f289044d",
                "title": "11第５回教育の為のＴＯＣシンポジウム",
                "createUser": "",
                "publishStartDate": "2016-02-14T20:32:20.0",
                "readStatus": "NOT_READ",
                "readStatusOrder": "1",
                "newReplyFlag": "FALSE",
                "newReplyFlagOrder": "0",
                "isAlreadyExists": "TRUE"
            },
            {
                "communityID": "a92b4597-d8e5-431b-bf85-41d9f289044d",
                "title": "12第５回教育の為のＴＯＣシンポジウム",
                "createUser": "",
                "publishStartDate": "2016-02-14T20:32:20.0",
                "readStatus": "NOT_READ",
                "readStatusOrder": "1",
                "newReplyFlag": "FALSE",
                "newReplyFlagOrder": "0",
                "isAlreadyExists": "TRUE"
            },
            {
                "communityID": "a92b4597-d8e5-431b-bf85-41d9f289044d",
                "title": "13第５回教育の為のＴＯＣシンポジウム",
                "createUser": "",
                "publishStartDate": "2016-02-14T20:32:20.0",
                "readStatus": "NOT_READ",
                "readStatusOrder": "1",
                "newReplyFlag": "FALSE",
                "newReplyFlagOrder": "0",
                "isAlreadyExists": "TRUE"
            },
            {
                "communityID": "a92b4597-d8e5-431b-bf85-41d9f289044d",
                "title": "14第５回教育の為のＴＯＣシンポジウム",
                "createUser": "",
                "publishStartDate": "2016-02-14T20:32:20.0",
                "readStatus": "NOT_READ",
                "readStatusOrder": "1",
                "newReplyFlag": "FALSE",
                "newReplyFlagOrder": "0",
                "isAlreadyExists": "TRUE"
            },
            {
                "communityID": "a92b4597-d8e5-431b-bf85-41d9f289044d",
                "title": "15第５回教育の為のＴＯＣシンポジウム",
                "createUser": "",
                "publishStartDate": "2016-02-14T20:32:20.0",
                "readStatus": "NOT_READ",
                "readStatusOrder": "1",
                "newReplyFlag": "FALSE",
                "newReplyFlagOrder": "0",
                "isAlreadyExists": "TRUE"
            },
            {
                "communityID": "a92b4597-d8e5-431b-bf85-41d9f289044d",
                "title": "16第５回教育の為のＴＯＣシンポジウム",
                "createUser": "",
                "publishStartDate": "2016-02-14T20:32:20.0",
                "readStatus": "NOT_READ",
                "readStatusOrder": "1",
                "newReplyFlag": "FALSE",
                "newReplyFlagOrder": "0",
                "isAlreadyExists": "TRUE"
            },
            {
                "communityID": "a92b4597-d8e5-431b-bf85-41d9f289044d",
                "title": "17第５回教育の為のＴＯＣシンポジウム",
                "createUser": "",
                "publishStartDate": "2016-02-14T20:32:20.0",
                "readStatus": "NOT_READ",
                "readStatusOrder": "1",
                "newReplyFlag": "FALSE",
                "newReplyFlagOrder": "0",
                "isAlreadyExists": "TRUE"
            }
            
        ];
    }
}
