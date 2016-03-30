import {Page, NavController, NavParams} from 'ionic-angular';
import {Component} from 'angular2/core';

import {TranslatePipe} from 'ng2-translate/ng2-translate';

import {BlogService} from '../../../providers/blog/blog-service/blog-service';
import {AddCommentPage} from '../add-comment/add-comment';
import {Util} from '../../../utils/util';

@Page({
    templateUrl: 'build/pages/blog/detail/detail.html',
    providers: [BlogService, Util],
    pipes: [TranslatePipe]
})
export class DetailPage {

    static get parameters() {
        return [[NavController], [NavParams], [BlogService], [Util]];
    }

    constructor(nav, params, blogService, util) {
        this.nav = nav;
        this.params = params;
        this.id = this.params.get("id");
        this.blogService = blogService;
        this.reply = "";

        // this.blog = new Blog("", "お待ちください。");
        this.blogService.getCommunityDetailByCommunityID(this.id).then(data => {
            this.title = data.title;
            this.content = data.content;
            this.createDate = data.createDate;//.substring(0, 7);
        });

/*      TODO: 下記はjsonファイルからデータを取得するソースです。非同期処理の問題があるので、まずコメントにする。対応必要 */

        this.commentListForBolgAll = [];
        this.blogService.getReplyContentListByCommunityID(this.id).then(data => {
            if (data) {
                this.comments = data.replyContents;
                this.commentCount = data.cursor.maxRows;
            }
        });


// /* ↓↓↓↓ TODO: 下記のソースは　画面のプルアップ時データが追加表示できるような現象が表示するために、まず初期データを設定します。jsonファイルからデータを取得するソースは上記です。  ↓↓↓↓ */
//         this.commentListForBolgAll = this.initData();
//         this.commentCount = this.commentListForBolgAll.length;
// /* ↑↑↑↑ 以上   ↑↑↑↑*/

//         // 初期表示のコメント数
//         var firstDisplayCommentCount = 3;
//         // プルアップする時、追加表示のコメント数
//         this.secondAddDisplayCommentCount = 3;

//         this.comments = [];
//         this.firstDisplayCount = this.commentListForBolgAll.length;

//         this.leftDisplayCount = 0;
//         if (this.commentListForBolgAll.length > firstDisplayCommentCount) {
//             this.firstDisplayCount = firstDisplayCommentCount;
//             this.leftDisplayCount = this.commentListForBolgAll.length - firstDisplayCommentCount;
//         }
//         for (var i = 0; i < this.firstDisplayCount; i++) {
//             this.comments.push(this.commentListForBolgAll[i]);
//         }
//         this.displayedCount = this.firstDisplayCount;
    }

    // doInfinite(infiniteScroll) {
    //     setTimeout(() => {
    //         // var nextDisplayCount = this.secondAddDisplayCommentCount;
    //         // if (this.leftDisplayCount < this.secondAddDisplayCommentCount) {
    //         //     nextDisplayCount = this.leftDisplayCount;
    //         // }
    //         // for (var i = 0; i < nextDisplayCount; i++) {
    //         //     this.comments.push(this.commentListForBolgAll[this.displayedCount]);
    //         //     this.leftDisplayCount--;
    //         //     this.displayedCount++;
    //         // }

    //         // infiniteScroll.complete();
    //     }, 500);
    // }

    addComment() {
        this.nav.push(AddCommentPage, {
            "id": this.id,
            "reply": this.reply
        });
    }
//     onPageWillLeave() {
//    removeView(){ this.nav.remove(1) }
//     this.id && this.id.dismiss();
//   }

}

