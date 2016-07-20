// Third party library.
import {Injectable, Component, ViewChild} from '@angular/core';
import {NavController, NavParams, Content} from 'ionic-angular';
import {TranslateService} from 'ng2-translate/ng2-translate';

// Utils.
import {Util} from '../../../utils/util';

// Services.
import {BlogService} from '../../../providers/blog-service';
import {ShareService} from '../../../providers/share-service';

// Pages.
import {DetailPage} from '../detail/detail';

@Component({
    templateUrl: 'build/pages/blog/index/index.html',
    providers: [
        BlogService,
        Util
    ]
})

export class BlogIndexPage {
    @ViewChild(Content) pageContent: Content;

    private isLoadCompleted: boolean;
    private communityListForTop: any[] = [];

    private isScrollToTopButtonVisible: boolean;

    constructor(private nav: NavController, private blogService: BlogService, private share: ShareService) {

        this.getCommunityListForTop();
        this.getBlogNewInformationCount();
    }

    onPageLoaded() {
        this.isLoadCompleted = false;
    }

    openDetail(community) {
        this.nav.push(DetailPage, {
            'community': community
        });
    }

    doRefresh(refresher) {
        let isRefresh = true;
        this.getCommunityListForTop(refresher, isRefresh);
        this.getBlogNewInformationCount();
    }

    doInfinite(infiniteScroll) {
        let position = this.communityListForTop.length;
        let isNeedRegistNotExistsReply = false;
        this.blogService.getCommunityListForTop(position, isNeedRegistNotExistsReply).then(data => {
            if (data && data.length > 0) {
                this.communityListForTop = this.communityListForTop.concat(data);
            }
            infiniteScroll.complete();
        });
    }

    getCommunityListForTop(refresher?: any, isRefresh?: boolean) {
        let position = 0;
        let isNeedRegistNotExistsReply = true;
        this.blogService.getCommunityListForTop(position, isNeedRegistNotExistsReply).then(data => {
            this.communityListForTop = data;
            this.isLoadCompleted = true;
            this.isScrollToTopButtonVisible = false;
            if (isRefresh) {
                refresher.complete();
            }
        });
    }

    getBlogNewInformationCount() {
        this.blogService.getNotReadCommunityCountBySelf().then(data => {
            if (data) {
                this.share.blogNewInformationCount = data;
            }
        });
    }

    ngAfterViewInit() {
        this.pageContent.addScrollListener(this.onPageScroll(this));
    }

    scrollToIndexPageTop() {
        this.pageContent.scrollToTop();
    }

    onPageScroll(that) {
        return function () {
            if (this.scrollTop > 200) {
                that.isScrollToTopButtonVisible = true;
            } else {
                that.isScrollToTopButtonVisible = false;
            }
        }
    }
}