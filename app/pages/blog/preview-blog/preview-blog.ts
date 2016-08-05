// Third party library.
import {Component, ViewChild, Directive} from '@angular/core';
import {NavController, NavParams, Content, ViewController} from 'ionic-angular';
import {TranslateService} from 'ng2-translate/ng2-translate';

// Utils.
import {Util} from '../../../utils/util';

// Services.
import {BlogService} from '../../../providers/blog-service';
import {ShareService} from '../../../providers/share-service';

@Component({
    templateUrl: 'build/pages/blog/preview-blog/preview-blog.html',
    providers: [BlogService, Util]
})
export class PreviewBlogPage {
    @ViewChild(Content) pageContent: Content;

    private previewBlog: any;
    private title: string;
    private content: string;
    private isLoadCompleted: boolean;
    private isScrollToTopButtonVisible: boolean;
    private attachFiles: any;

    private pageLoadTime: number;

    constructor(private nav: NavController, private viewCtrl: ViewController, private params: NavParams, private blogService: BlogService, private share: ShareService) {
        this.previewBlog = this.params.get('previewBlog');
        this.title = this.previewBlog.title;
        this.content = this.previewBlog.content;
    }

    ngAfterViewInit(): void {
        this.pageContent.addScrollListener(this.onPageScroll(this));
    }

    scrollToDetailPageTop(): void {
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

    close(): void {
        this.viewCtrl.dismiss();
    }
}