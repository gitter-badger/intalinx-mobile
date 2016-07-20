// Third party library.
import {Injectable, Component} from '@angular/core';
import {NavController, NavParams} from 'ionic-angular';
import {TranslateService} from 'ng2-translate/ng2-translate';

// Utils.
import {Util} from '../../../utils/util';

// Services.
import {BlogService} from '../../../providers/blog-service';

// Pages.
import {DetailPage} from '../detail/detail';

@Component({
    templateUrl: 'build/pages/blog/add-comment/add-comment.html',
    providers: [
        BlogService,
        Util
    ]
})
export class AddCommentPage {
    private sendData: any;
    private id: string;
    private comment: any;
    private isDisabled: boolean;

    constructor(private nav: NavController, private params: NavParams, private blogService: BlogService, private util: Util) {
        this.sendData = this.params.get('sendData');
        this.id = this.sendData.id;
        this.comment = {
            communityID: this.id,
            content: this.sendData.unrepliedCommentcontent
        };
    }

    saveComment(): void {
        this.isDisabled = true;
        this.blogService.saveComment(this.comment).then(data => {
            if (data === 'true') {
                this.sendData.isRefreshFlag = true;
                this.nav.pop();
            } else {
                this.isDisabled = null;
            }
        });
    }

    onPageWillLeave(): void {
        this.sendData.unrepliedCommentcontent = this.comment.content;
    }

    onPageWillEnter(): void {
        this.changeContent();
    }

    changeContent(): void {
        if (this.comment.content && this.util.deleteEmSpaceEnSpaceNewLineInCharacter(this.comment.content) != "") {
            this.isDisabled = null;
        } else {
            this.isDisabled = true;
        }
        this.autoResizeContent();
    }

    autoResizeContent(): void {
        let textarea = document.querySelector('.add-comment textarea');
        if (textarea.scrollHeight > 0) {
            // textarea.style.height = textarea.scrollHeight + 'px';
        }
    }
}
