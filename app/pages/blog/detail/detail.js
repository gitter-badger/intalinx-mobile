import {Page, NavController, NavParams} from 'ionic-angular';
import {Component} from 'angular2/core';

import {TranslatePipe} from 'ng2-translate/ng2-translate';

import {BlogService} from '../../../providers/blog/blog-service/blog-service';
import {AddCommentPage} from '../add-comment/add-comment';

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

/*      TODO: 下記はjsonファイルからデータを取得するソースです。非同期処理の問題があるので、まずコメントにする。対応必要

        this.commentListForBolgAll = [];
        this.blogService.getReplyContentListByCommunityID(this.id).then(data => {
            this.commentListForBolgAll = data;
            this.commentCount = data.length;
        });
*/

/* ↓↓↓↓ TODO: 下記のソースは　画面のプルアップ時データが追加表示できるような現象が表示するために、まず初期データを設定します。jsonファイルからデータを取得するソースは上記です。  ↓↓↓↓ */
        this.commentListForBolgAll = this.initData();
        this.commentCount = this.commentListForBolgAll.length;
/* ↑↑↑↑ 以上   ↑↑↑↑*/

        // 初期表示のコメント数
        var firstDisplayCommentCount = 3;
        // プルアップする時、追加表示のコメント数
        this.secondAddDisplayCommentCount = 3;

        this.comments = [];
        this.firstDisplayCount = this.commentListForBolgAll.length;

        this.leftDisplayCount = 0;
        if (this.commentListForBolgAll.length > firstDisplayCommentCount) {
            this.firstDisplayCount = firstDisplayCommentCount;
            this.leftDisplayCount = this.commentListForBolgAll.length - firstDisplayCommentCount;
        }
        for (var i = 0; i < this.firstDisplayCount; i++) {
            this.comments.push(this.commentListForBolgAll[i]);
        }
        this.displayedCount = this.firstDisplayCount;
    }

    doInfinite(infiniteScroll) {
        setTimeout(() => {
            var nextDisplayCount = this.secondAddDisplayCommentCount;
            if (this.leftDisplayCount < this.secondAddDisplayCommentCount) {
                nextDisplayCount = this.leftDisplayCount;
            }
            for (var i = 0; i < nextDisplayCount; i++) {
                this.comments.push(this.commentListForBolgAll[this.displayedCount]);
                this.leftDisplayCount--;
                this.displayedCount++;
            }

            infiniteScroll.complete();
        }, 500);
    }

    addComment() {
        this.nav.push(AddCommentPage, {
            "id": this.id,
            "title": this.title
        });
    }

    initData() {
        return [
            {
                "tuple": {
                    "old": {
                        "ReplyContentOutput": {
                            "replyContentID": "b69d06be-605a-43f0-b039-e707c1ff0edb",
                            "content": "ありがとうございます。<br />勉強になります。",
                            "createDate": "2016/02/15 07:53:17",
                            "communityID": "a92b4597-d8e5-431b-bf85-41d9f289044d",
                            "userID": "56",
                            "userName": "丸尾　恭介"
                        }
                    }
                }
            },
            {
                "tuple": {
                    "old": {
                        "ReplyContentOutput": {
                            "replyContentID": "14cb5d8d-44e5-481c-9e5b-5a0cf71c8823",
                            "content": "<font size=\"6\">「<span style=\"color: #252525; font-family: 'ＭＳ 明朝', serif; font-size: 15.3333px;\"><font size=\"3\">人間関係の重要さを見くびってはならない</font>。</span>」</font><br />この言葉が大事ですね。<br />正しい事を言っているから大丈夫と勘違いする方々が多いようです。<br /><br />",
                            "createDate": "2016/02/15 08:35:24",
                            "communityID": "a92b4597-d8e5-431b-bf85-41d9f289044d",
                            "userID": "2",
                            "userName": "譚　玉蜂"
                        }
                    }
                }
            },
            {
                "tuple": {
                    "old": {
                        "ReplyContentOutput": {
                            "replyContentID": "eb5818e1-640b-4307-acf8-a6ab6304ceee1",
                            "content": "1多様な社会では答えは一つではなくなり、それぞれが答えを持つようになります。<br />従って答えはそれぞれが考えねばならない事になり、それぞれの考えをよく聞く事が大切になります。<br />（なにかで読んだ内容です）",
                            "createDate": "2016/02/15 17:17:32",
                            "communityID": "a92b4597-d8e5-431b-bf85-41d9f289044d",
                            "userID": "1002",
                            "userName": "田　志輝1"
                        }
                    }
                }
            },
            {
                "tuple": {
                    "old": {
                        "ReplyContentOutput": {
                            "replyContentID": "eb5818e1-640b-4307-acf8-a6ab6304ceee2",
                            "content": "2多様な社会では答えは一つではなくなり、それぞれが答えを持つようになります。<br />従って答えはそれぞれが考えねばならない事になり、それぞれの考えをよく聞く事が大切になります。<br />（なにかで読んだ内容です）",
                            "createDate": "2016/02/15 17:17:32",
                            "communityID": "a92b4597-d8e5-431b-bf85-41d9f289044d",
                            "userID": "1002",
                            "userName": "田　志輝2"
                        }
                    }
                }
            },
            {
                "tuple": {
                    "old": {
                        "ReplyContentOutput": {
                            "replyContentID": "eb5818e1-640b-4307-acf8-a6ab6304ceee3",
                            "content": "3多様な社会では答えは一つではなくなり、それぞれが答えを持つようになります。<br />従って答えはそれぞれが考えねばならない事になり、それぞれの考えをよく聞く事が大切になります。<br />（なにかで読んだ内容です）",
                            "createDate": "2016/02/15 17:17:32",
                            "communityID": "a92b4597-d8e5-431b-bf85-41d9f289044d",
                            "userID": "1002",
                            "userName": "田　志輝3"
                        }
                    }
                }
            },
            {
                "tuple": {
                    "old": {
                        "ReplyContentOutput": {
                            "replyContentID": "eb5818e1-640b-4307-acf8-a6ab6304ceee4",
                            "content": "4多様な社会では答えは一つではなくなり、それぞれが答えを持つようになります。<br />従って答えはそれぞれが考えねばならない事になり、それぞれの考えをよく聞く事が大切になります。<br />（なにかで読んだ内容です）",
                            "createDate": "2016/02/15 17:17:32",
                            "communityID": "a92b4597-d8e5-431b-bf85-41d9f289044d",
                            "userID": "1002",
                            "userName": "田　志輝4"
                        }
                    }
                }
            },
            {
                "tuple": {
                    "old": {
                        "ReplyContentOutput": {
                            "replyContentID": "eb5818e1-640b-4307-acf8-a6ab6304ceee5",
                            "content": "5多様な社会では答えは一つではなくなり、それぞれが答えを持つようになります。<br />従って答えはそれぞれが考えねばならない事になり、それぞれの考えをよく聞く事が大切になります。<br />（なにかで読んだ内容です）",
                            "createDate": "2016/02/15 17:17:32",
                            "communityID": "a92b4597-d8e5-431b-bf85-41d9f289044d",
                            "userID": "1002",
                            "userName": "田　志輝5"
                        }
                    }
                }
            },
            {
                "tuple": {
                    "old": {
                        "ReplyContentOutput": {
                            "replyContentID": "eb5818e1-640b-4307-acf8-a6ab6304ceee6",
                            "content": "6多様な社会では答えは一つではなくなり、それぞれが答えを持つようになります。<br />従って答えはそれぞれが考えねばならない事になり、それぞれの考えをよく聞く事が大切になります。<br />（なにかで読んだ内容です）",
                            "createDate": "2016/02/15 17:17:32",
                            "communityID": "a92b4597-d8e5-431b-bf85-41d9f289044d",
                            "userID": "1002",
                            "userName": "田　志輝6"
                        }
                    }
                }
            },
            {
                "tuple": {
                    "old": {
                        "ReplyContentOutput": {
                            "replyContentID": "eb5818e1-640b-4307-acf8-a6ab6304ceee7",
                            "content": "7多様な社会では答えは一つではなくなり、それぞれが答えを持つようになります。<br />従って答えはそれぞれが考えねばならない事になり、それぞれの考えをよく聞く事が大切になります。<br />（なにかで読んだ内容です）",
                            "createDate": "2016/02/15 17:17:32",
                            "communityID": "a92b4597-d8e5-431b-bf85-41d9f289044d",
                            "userID": "1002",
                            "userName": "田　志輝7"
                        }
                    }
                }
            },
            {
                "tuple": {
                    "old": {
                        "ReplyContentOutput": {
                            "replyContentID": "eb5818e1-640b-4307-acf8-a6ab6304ceee8",
                            "content": "8多様な社会では答えは一つではなくなり、それぞれが答えを持つようになります。<br />従って答えはそれぞれが考えねばならない事になり、それぞれの考えをよく聞く事が大切になります。<br />（なにかで読んだ内容です）",
                            "createDate": "2016/02/15 17:17:32",
                            "communityID": "a92b4597-d8e5-431b-bf85-41d9f289044d",
                            "userID": "1002",
                            "userName": "田　志輝8"
                        }
                    }
                }
            },
            {
                "tuple": {
                    "old": {
                        "ReplyContentOutput": {
                            "replyContentID": "eb5818e1-640b-4307-acf8-a6ab6304ceee9",
                            "content": "9多様な社会では答えは一つではなくなり、それぞれが答えを持つようになります。<br />従って答えはそれぞれが考えねばならない事になり、それぞれの考えをよく聞く事が大切になります。<br />（なにかで読んだ内容です）",
                            "createDate": "2016/02/15 17:17:32",
                            "communityID": "a92b4597-d8e5-431b-bf85-41d9f289044d",
                            "userID": "1002",
                            "userName": "田　志輝9"
                        }
                    }
                }
            }
        ];
    }
}

