// Third party library.
import {Component, ViewChild} from '@angular/core';
import {NavController, NavParams, Content} from 'ionic-angular';
import {TranslateService} from 'ng2-translate/ng2-translate';

// Utils.
import {Util} from '../../../utils/util';

// Services.
import {SurveyService} from '../../../providers/survey-service';
import {ShareService} from '../../../providers/share-service';

// Pages.
import {SurveyDetailPage} from '../detail/detail';
import {SurveyResultPage} from '../result/result';

@Component({
  templateUrl: 'build/pages/survey/index/index.html',
  providers: [
        SurveyService,
        Util
    ]
})
export class SurveyIndexPage {
    @ViewChild(Content) pageContent: Content;

    private sendData: any;
    private isLoadCompleted: boolean;
    private surveyListForTop: any[] = [];

    private isScrollToTopButtonVisible: boolean;

    constructor(private nav: NavController, private surveyService: SurveyService, private share: ShareService) {
        this.sendData = {
            'isRefreshFlag': false
        };
        this.getSurveyListForTop();
        this.getSurveyNewInformationCount();
    }

    ionViewLoaded(): void {
        this.isLoadCompleted = false;
    }

    ionViewWillEnter(): void {
        if (this.sendData.isRefreshFlag) {
            this.isLoadCompleted = false;
            this.getSurveyListForTop();
            this.getSurveyNewInformationCount();
        }
        this.sendData.isRefreshFlag = false;
    }

    openDetail(survey): void {
        if (survey.status === 'COMPLETION') {
            let sendData = {
                'survey': survey
            };
            this.nav.push(SurveyResultPage, {
                'sendData': sendData
            });
        } else {
            this.nav.push(SurveyDetailPage, {
                'survey': survey
            });
        }
    }

    doRefresh(refresher): void {
        let isRefresh = true;
        this.getSurveyListForTop(refresher, isRefresh);
        this.getSurveyNewInformationCount();
    }

    doInfinite(infiniteScroll): void {
        let position = this.surveyListForTop.length;
        this.surveyService.getSurveyListForTop(position).then((data: any) => {
            if (data && data.length > 0) {
                this.surveyListForTop = this.surveyListForTop.concat(data);
            }
            infiniteScroll.complete();
        });
    }

    getSurveyListForTop(refresher?: any, isRefresh?: boolean): void {
        let position = 0;
        this.surveyService.getSurveyListForTop(position).then((data: any) => {
            this.surveyListForTop = data;
            this.isLoadCompleted = true;
            this.isScrollToTopButtonVisible = false;
            if (isRefresh) {
                refresher.complete();
            }
        });
    }

    getSurveyNewInformationCount() {
        this.surveyService.getNotProcessedSurveyCountBySelf().then((data: string) => {
            if (data) {
                this.share.surveyNewInformationCount = Number(data);
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

    // addSurvey(): void {
    //     this.nav.push(AddSurveyPage, { 'sendData': this.sendData });
    // }
}
