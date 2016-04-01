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

    constructor(http, util) {
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
    getCommunityListForTop(position, isNeedRegistNotExistsReply) {
        let rowsPerpage = 10;
        if (this.data) {
            // already loaded data
            return Promise.resolve(this.data);
        }
        return new Promise(resolve => {
            this.util.getRequestXml('./assets/requests/get_community_list_for_top_request.xml').then(req => {


                let objRequest = this.util.parseXml(req);

                let cursorNode = this.util.selectXMLNode(objRequest, ".//*[local-name()='cursor']");
                this.util.setXMLAttribute(cursorNode, "", "position", position);
                this.util.setXMLAttribute(cursorNode, "", "numRows", rowsPerpage);

                this.util.setNodeText(objRequest, ".//*[local-name()='isNeedRegistNotExistsReply']", isNeedRegistNotExistsReply);

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
                        let publishYearMonthDay = publishTime.substring(0, 10);
                        let publishHour = publishTime.substring(11, 13);
                        let publishMinute = publishTime.substring(14, 16);
                        let publishSecond = publishTime.substring(17, 19);

                        let minute = 60;
                        let hour = minute * 24;
                        let month = hour * 30;
                        let publishDate = new Date(publishYearMonthDay);
                        publishDate.setHours(publishHour);
                        publishDate.setMinutes(publishMinute);
                        publishDate.setSeconds(publishSecond);
                        let publishDateTime = publishDate.getTime();

                        let nowTime = new Date().getTime();
                        let publishedMinutes = Math.trunc((nowTime - publishDateTime) / (60 * 1000));

                        if (publishedMinutes >= month) {
                            // 一か月前の場合
                            element.publishStartDate = publishTime.substring(0, 10);
                        } else if (publishedMinutes >= hour) {
                            // 一日前の場合
                            let days = Math.trunc(publishedMinutes / hour);
                            element.publishStartDate = days + "日前";
                        } else if (publishedMinutes >= minute) {
                            // 一時間後、一日以内
                            let hours = Math.trunc(publishedMinutes / minute);
                            element.publishStartDate = hours + "時前";
                        } else {

                            if (publishedMinutes < 1) {
                                publishedMinutes = 1;
                            }
                            element.publishStartDate = publishedMinutes + "分前";
                        }
                    }, this);

                     resolve(communities);
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
                let objRequest = this.util.parseXml(req);

                // this.util.setNodeText(objRequest, ".//communityID", communityID);
                this.util.setNodeText(objRequest, ".//*[local-name()='communityID']", communityID);


                req = this.util.xml2string(objRequest);

                this.util.callCordysWebservice(req).then(data => {
                    let objResponse = this.util.parseXml(data);

                    let communityOutput = this.util.selectXMLNode(objResponse, ".//*[local-name()='CommunityOutput']");
                    let community = this.util.xml2json(communityOutput).CommunityOutput;

                    resolve(community);
                });
            });
        });
    }

    getReplyContentListByCommunityID(communityID, position) {

        let rowsPerpage = 5;

        if (this.data) {// already loaded data
            return Promise.resolve(this.data);
        }
        return new Promise(resolve => {
            this.util.getRequestXml('./assets/requests/get_reply_content_list_by_community_id_request.xml').then(req => {

                let objRequest = this.util.parseXml(req);

                let cursorNode = this.util.selectXMLNode(objRequest, ".//*[local-name()='cursor']");
                this.util.setXMLAttribute(cursorNode, "", "position", position);
                this.util.setXMLAttribute(cursorNode, "", "numRows", rowsPerpage);
                this.util.setNodeText(objRequest, ".//*[local-name()='communityID']", communityID);

                req = this.util.xml2string(objRequest);

                this.util.callCordysWebservice(req).then(data => {
                    let objResponse = this.util.parseXml(data);

                    let rreplyContentOutputs = this.util.selectXMLNodes(objResponse, ".//*[local-name()='ReplyContentOutput']");
                    let replyContents = new Array();
                    for (let i = 0; i < rreplyContentOutputs.length; i++) {
                        replyContents.push(this.util.xml2json(rreplyContentOutputs[i]).ReplyContentOutput);
                    }
                    let cursor = this.util.selectXMLNode(objResponse, ".//*[local-name()='cursor']");
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