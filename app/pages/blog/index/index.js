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

/*      TODO: 下記はjsonファイルからデータを取得するソースです。非同期処理の問題があるので、まずコメントにする。対応必要

        this.communityListForTopAll = [];
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
            this.communityListForTopAll = data;
        });
*/
 
/* ↓↓↓↓ TODO: 下記のソースは　画面のプルアップ時データが追加表示できるような現象が表示するために、まず初期データを設定します。jsonファイルからデータを取得するソースは上記です。  ↓↓↓↓ */    
        this.communityListForTopAll = this.initData();
        for (var l = 0; l < this.communityListForTopAll.length; l++) {
            var community = this.communityListForTopAll[l];
            var publishDate = new Date(community.publishStartDate.replace("T", " "));
                var now = new Date();
                var publishedMinutes = parseInt((now.getTime() - publishDate.getTime()) / (60 * 1000));
                if (publishedMinutes >= 60 * 24 * 365) {
                    // 一年前の場合
                    var years = parseInt(publishedMinutes / (60 * 24 * 365));
                    community.publishStartDate = years + "年前";
                } else if (publishedMinutes >= 60 * 24 * 30) {
                    // 一か月前の場合
                    var months = parseInt(publishedMinutes / (60 * 24 * 30));
                    community.publishStartDate = months + "月前";
                } else if (publishedMinutes >= 60 * 24) {
                    // 一日前の場合
                    var days = parseInt(publishedMinutes / (60 * 24));
                    community.publishStartDate = days + "日前";
                } else if (publishedMinutes >= 60) {
                    // 一時間後、一日以内
                    var hours = parseInt(publishedMinutes / 60);
                    community.publishStartDate = hours + "時前";
                } else {
                    //　一時間以内
                    community.publishStartDate = publishedMinutes + "分前";
                }
        }
/* ↑↑↑↑ 以上   ↑↑↑↑*/
        
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
                "createUser": "譚　玉峰",
                "publishStartDate": "2016-03-25T15:43:52.0",
                "readStatus": "NOT_READ",
                "readStatusOrder": "1",
                "newReplyFlag": "FALSE",
                "newReplyFlagOrder": "0",
                "isAlreadyExists": "TRUE"
            },
            {
                "communityID": "5f90c3e5-febe-4cce-949b-4766b0778443",
                "title": "2AED講習2回目（リスケ分）",
                "createUser": "田　志輝",
                "publishStartDate": "2016-03-16T16:08:41.0",
                "readStatus": "NOT_READ",
                "readStatusOrder": "1",
                "newReplyFlag": "FALSE",
                "newReplyFlagOrder": "0",
                "isAlreadyExists": "TRUE"
            },
            {
                "communityID": "a5f96af3-3a40-4f2e-9f1b-62f92762fd11",
                "title": "3【4F朝会】ビジネスマナーの基本-挨拶（2/15）",
                "createUser": "段　海嬌",
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
                "createUser": "西中　芳幸",
                "publishStartDate": "2015-02-14T20:32:20.0",
                "readStatus": "NOT_READ",
                "readStatusOrder": "1",
                "newReplyFlag": "FALSE",
                "newReplyFlagOrder": "0",
                "isAlreadyExists": "TRUE"
            },
            {
                "communityID": "a5f96af3-3a40-4f2e-9f1b-62f92762fd11",
                "title": "5【4F朝会】ビジネスマナーの基本-挨拶（2/15）",
                "createUser": "段　海嬌",
                "publishStartDate": "2016-02-16T14:21:56.0",
                "readStatus": "NOT_READ",
                "readStatusOrder": "1",
                "newReplyFlag": "FALSE",
                "newReplyFlagOrder": "0",
                "isAlreadyExists": "TRUE"
            },
            {
                "communityID": "a5f96af3-3a40-4f2e-9f1b-62f92762fd11",
                "title": "6【4F朝会】ビジネスマナーの基本-挨拶（2/15）",
                "createUser": "段　海嬌",
                "publishStartDate": "2016-02-16T14:21:56.0",
                "readStatus": "NOT_READ",
                "readStatusOrder": "1",
                "newReplyFlag": "FALSE",
                "newReplyFlagOrder": "0",
                "isAlreadyExists": "TRUE"
            },
            {
                "communityID": "a5f96af3-3a40-4f2e-9f1b-62f92762fd11",
                "title": "7【4F朝会】ビジネスマナーの基本-挨拶（2/15）",
                "createUser": "段　海嬌",
                "publishStartDate": "2016-02-16T14:21:56.0",
                "readStatus": "NOT_READ",
                "readStatusOrder": "1",
                "newReplyFlag": "FALSE",
                "newReplyFlagOrder": "0",
                "isAlreadyExists": "TRUE"
            },
            {
                "communityID": "a5f96af3-3a40-4f2e-9f1b-62f92762fd11",
                "title": "8【4F朝会】ビジネスマナーの基本-挨拶（2/15）",
                "createUser": "段　海嬌",
                "publishStartDate": "2016-02-16T14:21:56.0",
                "readStatus": "NOT_READ",
                "readStatusOrder": "1",
                "newReplyFlag": "FALSE",
                "newReplyFlagOrder": "0",
                "isAlreadyExists": "TRUE"
            },
            {
                "communityID": "a5f96af3-3a40-4f2e-9f1b-62f92762fd11",
                "title": "9【4F朝会】ビジネスマナーの基本-挨拶（2/15）",
                "createUser": "段　海嬌",
                "publishStartDate": "2016-02-16T14:21:56.0",
                "readStatus": "NOT_READ",
                "readStatusOrder": "1",
                "newReplyFlag": "FALSE",
                "newReplyFlagOrder": "0",
                "isAlreadyExists": "TRUE"
            },
            {
                "communityID": "a5f96af3-3a40-4f2e-9f1b-62f92762fd11",
                "title": "10【4F朝会】ビジネスマナーの基本-挨拶（2/15）",
                "createUser": "段　海嬌",
                "publishStartDate": "2016-02-16T14:21:56.0",
                "readStatus": "NOT_READ",
                "readStatusOrder": "1",
                "newReplyFlag": "FALSE",
                "newReplyFlagOrder": "0",
                "isAlreadyExists": "TRUE"
            },
            {
                "communityID": "a5f96af3-3a40-4f2e-9f1b-62f92762fd11",
                "title": "11【4F朝会】ビジネスマナーの基本-挨拶（2/15）",
                "createUser": "段　海嬌",
                "publishStartDate": "2016-02-16T14:21:56.0",
                "readStatus": "NOT_READ",
                "readStatusOrder": "1",
                "newReplyFlag": "FALSE",
                "newReplyFlagOrder": "0",
                "isAlreadyExists": "TRUE"
            },
            {
                "communityID": "a5f96af3-3a40-4f2e-9f1b-62f92762fd11",
                "title": "12【4F朝会】ビジネスマナーの基本-挨拶（2/15）",
                "createUser": "段　海嬌",
                "publishStartDate": "2016-02-16T14:21:56.0",
                "readStatus": "NOT_READ",
                "readStatusOrder": "1",
                "newReplyFlag": "FALSE",
                "newReplyFlagOrder": "0",
                "isAlreadyExists": "TRUE"
            },
            {
                "communityID": "a5f96af3-3a40-4f2e-9f1b-62f92762fd11",
                "title": "13【4F朝会】ビジネスマナーの基本-挨拶（2/15）",
                "createUser": "段　海嬌",
                "publishStartDate": "2016-02-16T14:21:56.0",
                "readStatus": "NOT_READ",
                "readStatusOrder": "1",
                "newReplyFlag": "FALSE",
                "newReplyFlagOrder": "0",
                "isAlreadyExists": "TRUE"
            },
            {
                "communityID": "a5f96af3-3a40-4f2e-9f1b-62f92762fd11",
                "title": "14【4F朝会】ビジネスマナーの基本-挨拶（2/15）",
                "createUser": "段　海嬌",
                "publishStartDate": "2016-02-16T14:21:56.0",
                "readStatus": "NOT_READ",
                "readStatusOrder": "1",
                "newReplyFlag": "FALSE",
                "newReplyFlagOrder": "0",
                "isAlreadyExists": "TRUE"
            }
        ];
    }
}
