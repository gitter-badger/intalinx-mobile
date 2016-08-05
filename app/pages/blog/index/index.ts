// Third party library.
import {Component, ViewChild} from '@angular/core';
import {NavController, NavParams, Content} from 'ionic-angular';
import {TranslateService} from 'ng2-translate/ng2-translate';

// Utils.
import {Util} from '../../../utils/util';

// Services.
import {BlogService} from '../../../providers/blog-service';
import {ShareService} from '../../../providers/share-service';

// Pages.
import {BlogDetailPage} from '../detail/detail';
import {AddBlogPage} from '../add-blog/add-blog';

@Component({
    templateUrl: 'build/pages/blog/index/index.html',
    providers: [
        BlogService,
        Util
    ]
})

export class BlogIndexPage {
    @ViewChild(Content) pageContent: Content;

    private sendData: any;
    private isLoadCompleted: boolean;
    private communityListForTop: any[] = [];

    private isScrollToTopButtonVisible: boolean;

    constructor(private nav: NavController, private blogService: BlogService, private share: ShareService) {
        this.sendData = {
            'isRefreshFlag': false
        };
        this.getCommunityListForTop();
        this.getBlogNewInformationCount();
    }

    ionViewLoaded(): void {
        this.isLoadCompleted = false;
    }

    ionViewWillEnter(): void {
        if (this.sendData.isRefreshFlag) {
            this.getCommunityListForTop();
            this.getBlogNewInformationCount();
        }
        this.sendData.isRefreshFlag = false;
    }

    openDetail(community): void {
        this.nav.push(BlogDetailPage, {
            'community': community
        });
    }

    doRefresh(refresher): void {
        let isRefresh = true;
        this.getCommunityListForTop(refresher, isRefresh);
        this.getBlogNewInformationCount();
    }

    doInfinite(infiniteScroll): void {
        let position = this.communityListForTop.length;
        let isNeedRegistNotExistsReply = false;
        this.blogService.getCommunityListForTop(position, isNeedRegistNotExistsReply).then((data: any) => {
            if (data && data.length > 0) {
                this.communityListForTop = this.communityListForTop.concat(data);
            }
            infiniteScroll.complete();
        });
    }

    getCommunityListForTop(refresher?: any, isRefresh?: boolean): void {
        let position = 0;
        let isNeedRegistNotExistsReply = true;
        this.blogService.getCommunityListForTop(position, isNeedRegistNotExistsReply).then((data: any) => {
            this.communityListForTop = data;
            this.isLoadCompleted = true;
            this.isScrollToTopButtonVisible = false;
            if (isRefresh) {
                refresher.complete();
            }
        });
    }

    getBlogNewInformationCount() {
        this.blogService.getNotReadCommunityCountBySelf().then((data: string) => {
            if (data) {
                this.share.blogNewInformationCount = Number(data);
            }
        });
    }

    ngAfterViewInit(): void {
        this.pageContent.addScrollListener(this.onPageScroll(this));
    }

    scrollToIndexPageTop(): void {
        this.pageContent.scrollToTop();
    }

    onPageScroll(that): any {
        return function () {
            if (this.scrollTop > 200) {
                that.isScrollToTopButtonVisible = true;
            } else {
                that.isScrollToTopButtonVisible = false;
            }
        };
    }

    addBlog(): void {
        this.nav.push(AddBlogPage, { 'sendData': this.sendData });
    }
}