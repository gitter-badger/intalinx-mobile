// Third party library.
import {Injectable} from '@angular/core';
import {NavController} from 'ionic-angular';
import {TranslateService} from 'ng2-translate/ng2-translate';

// Config.
import {AppConfig} from '../appconfig';

// Utils.
import {Util} from '../utils/util';

@Injectable()
export class BlogService {
    private userDefaultAvatarImageUrl = this.appConfig.get('USER_DEFAULT_AVATAR_IMAGE_URL');

    constructor(private translate: TranslateService, 
        private nav: NavController, 
        private util: Util, 
        private appConfig: AppConfig) {
    }

    getCommunityListForTop(position: number, isNeedRegistNotExistsReply: boolean): any {
        let rowsPerpage = 10;
        return new Promise(resolve => {
            this.util.getRequestXml('./assets/requests/blog/get_community_list_for_top_request.xml').then((req: string) => {

                let objRequest = this.util.parseXml(req);

                let cursorNode = this.util.selectXMLNode(objRequest, './/*[local-name()=\'cursor\']');
                this.util.setXMLAttribute(cursorNode, '', 'position', position);
                this.util.setXMLAttribute(cursorNode, '', 'numRows', rowsPerpage);

                this.util.setNodeText(objRequest, './/*[local-name()=\'isNeedRegistNotExistsReply\']', isNeedRegistNotExistsReply);

                req = this.util.xml2string(objRequest);

                this.util.callCordysWebservice(req).then((data: string) => {
                    let objResponse = this.util.parseXml(data);
                    let communityOutputs = this.util.selectXMLNodes(objResponse, './/*[local-name()=\'CommunityOutput\']');
                    let communities = new Array();
                    for (let i = 0; i < communityOutputs.length; i++) {
                        let community = this.util.xml2json(communityOutputs[i]).CommunityOutput;
                        if (!community.createUserAvatar || community.createUserAvatar.toString().indexOf('data:image') !== 0) {
                            community.createUserAvatar = this.userDefaultAvatarImageUrl;
                        }
                        this.util.fromNow(community.publishStartDate).then(data => {
                            community.publishStartDate = data;
                        });

                        communities.push(community);
                    }

                    resolve(communities);
                });
            });
        });
    }

    insertReplyContent(comment: any): any {
        let content = this.util.replaceHtmlTagCharacter(comment.content);
        return new Promise(resolve => {
            this.util.getRequestXml('./assets/requests/blog/insert_reply_content_request.xml').then((req: string) => {
                let objRequest = this.util.parseXml(req);
                this.util.setNodeText(objRequest, './/*[local-name()=\'communityID\']', comment.communityID);
                this.util.setNodeText(objRequest, './/*[local-name()=\'content\']', content);
                req = this.util.xml2string(objRequest);

                this.util.callCordysWebservice(req).then((data: string) => {
                    let objResponse = this.util.parseXml(data);
                    let insertReplyContent = this.util.selectXMLNode(objResponse, './/*[local-name()=\'insertReplyContent\']');
                    let returnData = this.util.xml2json(insertReplyContent).insertReplyContent.insertReplyContent;

                    resolve(returnData);
                });
            });
        });
    }

    // Getting the counting of unread blogs. 
    getNotReadCommunityCountBySelf(): any {
        return new Promise(resolve => {
            this.util.getRequestXml('./assets/requests/blog/get_not_read_community_count_by_self.xml').then((req: string) => {
                let objRequest = this.util.parseXml(req);
                req = this.util.xml2string(objRequest);

                this.util.callCordysWebservice(req).then((data: string) => {
                    let objResponse = this.util.parseXml(data);

                    let returnOutPut = this.util.selectXMLNode(objResponse, './/*[local-name()=\'return\']');
                    let returnData = this.util.xml2json(returnOutPut).return;
                    resolve(returnData);
                });
            });
        });
    }

    getCommunityDetailByCommunityID(communityID: string): any {
        return new Promise(resolve => {
            this.util.getRequestXml('./assets/requests/blog/get_community_detail_by_community_id_request.xml').then((req: string) => {
                let objRequest = this.util.parseXml(req);

                this.util.setNodeText(objRequest, './/*[local-name()=\'communityID\']', communityID);

                req = this.util.xml2string(objRequest);

                this.util.callCordysWebservice(req).then((data: string) => {
                    let objResponse = this.util.parseXml(data);

                    let communityOutput = this.util.selectXMLNode(objResponse, './/*[local-name()=\'CommunityOutput\']');
                    let community = this.util.xml2json(communityOutput).CommunityOutput;
                    if (!community.createUserAvatar || community.createUserAvatar.toString().indexOf('data:image') !== 0) {
                        community.createUserAvatar = this.userDefaultAvatarImageUrl;
                    }

                    this.util.fromNow(community.createDate).then(data => {
                        community.createDate = data;
                    });
                    resolve(community);
                });
            });
        });
    }

    getReplyContentListByCommunityID(communityID: string, position: number): any {
        // Setting the number of per drag.
        let rowsPerpage = 5;
        return new Promise(resolve => {
            this.util.getRequestXml('./assets/requests/blog/get_reply_content_list_by_community_id_request.xml').then((req: string) => {
                let objRequest = this.util.parseXml(req);

                let cursorNode = this.util.selectXMLNode(objRequest, './/*[local-name()=\'cursor\']');
                this.util.setXMLAttribute(cursorNode, '', 'position', position);
                this.util.setXMLAttribute(cursorNode, '', 'numRows', rowsPerpage);
                this.util.setNodeText(objRequest, './/*[local-name()=\'communityID\']', communityID);

                req = this.util.xml2string(objRequest);

                this.util.callCordysWebservice(req).then((data: string) => {
                    let objResponse = this.util.parseXml(data);

                    let rreplyContentOutputs = this.util.selectXMLNodes(objResponse, './/*[local-name()=\'ReplyContentOutput\']');
                    let replyContents = new Array();
                    for (let i = 0; i < rreplyContentOutputs.length; i++) {
                        let replyContent = this.util.xml2json(rreplyContentOutputs[i]).ReplyContentOutput;
                        if (!replyContent.userAvatar || replyContent.userAvatar.toString().indexOf('data:image') !== 0) {
                            replyContent.userAvatar = this.userDefaultAvatarImageUrl;
                        }
                        this.util.fromNow(replyContent.createDate).then(data => {
                            replyContent.createDate = data;
                        });
                        replyContents.push(replyContent);
                    }

                    let cursor = this.util.selectXMLNode(objResponse, './/*[local-name()=\'cursor\']');
                    cursor = this.util.xml2json(cursor);
                    if (cursor && cursor.cursor) {
                        cursor = cursor.cursor;
                    }
                    let result = {
                        'cursor': cursor.$,
                        'replyContents': replyContents
                    };
                    resolve(result);
                });
            });
        });
    }

    updateReplyStatus(communityID: string, status: string): any {
        return new Promise(resolve => {
            this.util.getRequestXml('./assets/requests/blog/update_reply_status.xml').then((req: string) => {
                let objRequest = this.util.parseXml(req);

                this.util.setNodeText(objRequest, './/*[local-name()=\'communityID\']', communityID);
                this.util.setNodeText(objRequest, './/*[local-name()=\'replystatus\']', status);
                req = this.util.xml2string(objRequest);

                this.util.callCordysWebservice(req).then(data => {
                    resolve('true');
                });
            });
        });
    }

    updateNewReplyFlag(communityID: string, status: string): any {
        return new Promise(resolve => {
            this.util.getRequestXml('./assets/requests/blog/update_new_reply_flag.xml').then((req: string) => {
                let objRequest = this.util.parseXml(req);
                this.util.setNodeText(objRequest, './/*[local-name()=\'communityID\']', communityID);
                this.util.setNodeText(objRequest, './/*[local-name()=\'newReplyFlag\']', status);
                req = this.util.xml2string(objRequest);

                this.util.callCordysWebservice(req).then(data => {
                    resolve('true');
                });
            });
        });
    }

    saveComment(comment: any): any {
        return new Promise(resolve => {
            if (comment.content && this.util.deleteEmSpaceEnSpaceNewLineInCharacter(comment.content) !== '') {
                this.insertReplyContent(comment).then(data => {
                    if (data === 'true') {
                        resolve(data);
                    }
                });
            } else {
                this.translate.get('app.blog.message.error.noContent').subscribe(message => {
                    this.util.presentModal(message);
                });
            }
        });
    }
}