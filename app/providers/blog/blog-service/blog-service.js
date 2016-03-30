import {Injectable, Inject} from 'angular2/core';
import {Http} from 'angular2/http';
import {Observable} from 'rxjs/Observable';
import 'rxjs/Rx';
import {Util} from '../../../utils/util';

/*
  Generated class for the AppsService provider.

  See https://angular.io/docs/ts/latest/guide/dependency-injection.html
  for more info on providers and Angular 2 DI.
*/
export class BlogService {

    static get parameters() {
        return [[Http], [Util]];
    }

    constructor(http,util) {
        this.http = http;
        this.data = null;
        this.util = util;
    }

    list() {
        if (this.data) {
            // already loaded data
            return Promise.resolve(this.data);
        }

        // don't have the data yet
        return new Promise(resolve => {
            // We're using Angular Http provider to request the data,
            // then on the response it'll map the JSON data to a parsed JS object.
            // Next we process the data and resolve the promise with the new data.
            this.http.get('./mocks/blogservice/list.json')
                .map(res => res.json())
                .subscribe(data => {
                    // we've got back the raw data, now generate the core schedule data
                    // and save the data for later reference
                    this.data = data;
                    resolve(this.data);
                });
        });
    }
    
    // トップ画面について、ブログリストを取得します
    getCommunityListForTop() {
        if (this.data) {
            // already loaded data
            return Promise.resolve(this.data);
        }
        return new Promise(resolve => {
            this.util.getRequestXml('./assets/requests/get_community_list_for_top_request.xml').then(req => {

                let objRequest = this.util.parseXml(req);
                this.util.setNodeText(objRequest, ".//*[local-name()='isNeedRegistNotExistsReply'", "false");

                req = this.util.xml2string(objRequest);

                this.util.callCordysWebservice(req).then(data => {
                    let objResponse = this.util.parseXml(data);
                    let communityOutputs = this.util.selectXMLNodes(objResponse, ".//*[local-name()='CommunityOutput']");
                    let communities = new Array();
                    for (let i = 0; i < communityOutputs.length; i++) {
                        communities.push(this.util.xml2json(communityOutputs[i]).CommunityOutput);
                    }
                    communities.forEach(function(element) {
                        let publishTime = element.publishStartDate;
                        let publishYear = publishTime.substring(0,4);
                        let publishMonth = publishTime.substring(5,7);
                        let publishDay = publishTime.substring(8,10);
                        let publishHour = publishTime.substring(11,13);
                        let publishMinute = publishTime.substring(14,16);
                        let publishSecond = publishTime.substring(17,19);
                        // let publishDate = new Date(element.publishStartDate.replace("T", " ").substring(0,19));
                        let publishDate = new Date(publishYear,publishMonth,publishDay,publishHour,publishMinute,publishSecond);
                        let now = new Date();
                        let publishedMinutes = parseInt((now.getTime() - publishDate.getTime()) / (60 * 1000));
                        if (publishedMinutes >= 60 * 24 * 30) {
                            // 一か月前の場合
                            // "****-**-**"の形で表す
                            element.publishStartDate = publishTime.substring(0,10);
                        } else if (publishedMinutes >= 60 * 24) {
                            // 一日前の場合
                            let days = parseInt(publishedMinutes / (60 * 24));
                            // 中国語: "天前"
                            // 日本語: "日前"
                            // 英語: "day ago"~~~"days ago"の場合も考えておいたほうがいいと思います
                            element.publishStartDate = days + "日前";
                        } else if (publishedMinutes >= 60) {
                            // 一時間後、一日以内
                            let hours = parseInt(publishedMinutes / 60);
                            // 中国語: "小時前"
                            // 日本語: "時前"
                            // 英語: "hour ago"~~~"hours ago"の場合も考えておいたほうがいいと思います
                            element.publishStartDate = hours + "時前";
                        } else {
                            // 一時間以内
                            // parseIntを使って、一分以内の場合は存在しません。最低限は一分前
                            // 中国語: "分前"
                            // 日本語: "分前"
                            // 英語: "minute ago"~~~"minutes ago"の場合も考えておいたほうがいいと思います
                            element.publishStartDate = publishedMinutes + "分前";
                        }
                    }, this);
                    
                    let cursor = this.util.selectXMLNode(objResponse, ".//*[local-name()='cursor']");
                    cursor = this.util.xml2json(cursor);
                    if (cursor && cursor.cursor) {
                        cursor = cursor.cursor;
                    }
                    let result = {
                        "cursor": cursor.$,
                        "communities": communities
                    };
                    resolve(result);
                });
            });
        });
    }
    
    insertReplyContent(comment) {
        if (this.data) {
            // already loaded data
            return Promise.resolve(this.data);
        }
        return new Promise(resolve => {
            this.util.getRequestXml('./assets/requests/insert_reply_content_request.xml').then(req => {
                let objRequest = this.util.parseXml(req);
                this.util.setNodeText(objRequest, ".//*[local-name()='communityID']", comment.communityID);
                this.util.setNodeText(objRequest, ".//*[local-name()='content']", comment.content);
                req = this.util.xml2string(objRequest);

                this.util.callCordysWebservice(req).then(data => {
                    let objResponse = this.util.parseXml(data);
                    let insertReplyContent = this.util.selectXMLNode(objResponse, ".//*[local-name()='insertReplyContent']");
                    let returnData = this.util.xml2json(insertReplyContent).insertReplyContent.insertReplyContent;

                    resolve(returnData);
                });
            });
        });
    }

    getNotReadCommunityCountBySelf() {
        if (this.data) {
            // already loaded data
            return Promise.resolve(this.data);
        }

        // don't have the data yet
        return new Promise(resolve => {
            // We're using Angular Http provider to request the data,
            // then on the response it'll map the JSON data to a parsed JS object.
            // Next we process the data and resolve the promise with the new data.
            this.http.get('./mocks/blogservice/notreadcommunitycountbyself.json')
                .map(res => res.json())
                .subscribe(data => {
                    // we've got back the raw data, now generate the core schedule data
                    // and save the data for later reference
                    this.data = data;
                    resolve(this.data);
                });
        });
    }

    getCommunityDetailByCommunityID(communityID) {
        if (this.data) {
            // already loaded data
            return Promise.resolve(this.data);
        }
        return new Promise(resolve => {
            this.util.getRequestXml('./assets/requests/get_community_detail_by_community_id_request.xml').then(req => {
                let samlRequest = this.util.parseXml(req);
                
                // this.util.setNodeText(samlRequest, ".//communityID", communityID);
                 this.util.setNodeText(samlRequest, ".//*[local-name()='communityID']", communityID);


                req = this.util.xml2string(samlRequest);

                this.util.callCordysWebservice(req).then(data => {
                    let samlResponse = this.util.parseXml(data);

                    let communityOutput = this.util.selectXMLNode(samlResponse, ".//*[local-name()='CommunityOutput']");
                    let community = this.util.xml2json(communityOutput).CommunityOutput;
                    
                    resolve(community);
                });
            });
        });
    }

    getReplyContentListByCommunityID(communityID) {
        if (this.data) {// already loaded data
            return Promise.resolve(this.data);
        }
        return new Promise(resolve => {
            this.util.getRequestXml('./assets/requests/get_reply_content_list_by_community_id_request.xml').then(req => {
                    
                let samlRequest = this.util.parseXml(req);

                this.util.setNodeText(samlRequest, ".//*[local-name()='communityID']", communityID);
                
                req = this.util.xml2string(samlRequest);
                
                this.util.callCordysWebservice(req).then(data => {
                    let samlResponse = this.util.parseXml(data);
                    
                    let rreplyContentOutputs = this.util.selectXMLNodes(samlResponse, ".//*[local-name()='ReplyContentOutput']");
                    let replyContents = new Array();
                    for (let i=0; i<rreplyContentOutputs.length; i++) {
                        replyContents.push(this.util.xml2json(rreplyContentOutputs[i]).ReplyContentOutput);
                    }
                    let cursor = this.util.selectXMLNode(samlResponse, ".//*[local-name()='cursor']");
                    cursor = this.util.xml2json(cursor);
                    if (cursor && cursor.cursor) {
                        cursor = cursor.cursor;
                    }
                    let result = {
                        "cursor": cursor.$,
                        "replyContents": replyContents
                    };
                    resolve(result);
                });
            });
        });
    }
}