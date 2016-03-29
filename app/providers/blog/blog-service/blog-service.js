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

    getCommunityListForTop() {
        if (this.data) {
            // already loaded data
            return Promise.resolve(this.data);
        }

        // don't have the data yet
        return new Promise(resolve => {
            // We're using Angular Http provider to request the data,
            // then on the response it'll map the JSON data to a parsed JS object.
            // Next we process the data and resolve the promise with the new data.
            this.http.get('./mocks/blogservice/communitylistForTop.json')
                .map(res => res.json())
                .subscribe(data => {
                    // we've got back the raw data, now generate the core schedule data
                    // and save the data for later reference
                    this.data = data;
                    resolve(this.data);
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

    saveComment(comment) {
        return true;
    }
}