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
                        element.publishStartDate = this.util.transferDateToKindsOfStyles(element.publishStartDate);
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
        return new Promise(resolve => {
            this.util.getRequestXml('./assets/requests/get_not_read_community_count_by_self.xml').then(req => {
                let objRequest = this.util.parseXml(req);
                req = this.util.xml2string(objRequest);

                this.util.callCordysWebservice(req).then(data => {
                    let objResponse = this.util.parseXml(data);

                    let returnOutPut = this.util.selectXMLNode(objResponse, ".//*[local-name()='return']");
                    let returnData = this.util.xml2json(returnOutPut).return;
                    resolve(returnData);
                });
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
                    replyContents.forEach(function(element) {
                        element.createDate = this.util.transferDateToKindsOfStyles(element.createDate);
                    }, this);
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
    
    updateReplyStatus(communityID, status){
        if (this.data) {
            // already loaded data
            return Promise.resolve(this.data);
        }
        return new Promise(resolve => {
            this.util.getRequestXml('./assets/requests/update_reply_status.xml').then(req => {
                let objRequest = this.util.parseXml(req);
                this.util.setNodeText(objRequest, ".//*[local-name()='communityID']", communityID);
                this.util.setNodeText(objRequest, ".//*[local-name()='replystatus']", status);
                req = this.util.xml2string(objRequest);

                this.util.callCordysWebservice(req).then(data => {
                    return true;
                });
            });
        });
    }
    
    updateNewReplyFlag(communityID, status) {
        if (this.data) {
            // already loaded data
            return Promise.resolve(this.data);
        }
        return new Promise(resolve => {
            this.util.getRequestXml('./assets/requests/update_new_reply_flag.xml').then(req => {
                let objRequest = this.util.parseXml(req);
                this.util.setNodeText(objRequest, ".//*[local-name()='communityID']", communityID);
                this.util.setNodeText(objRequest, ".//*[local-name()='newReplyFlag']", status);
                req = this.util.xml2string(objRequest);

                this.util.callCordysWebservice(req).then(data => {
                    return true;
                });
            });
        });
    }
}