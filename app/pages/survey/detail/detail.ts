// Third party library.
import {Component, ViewChild, Directive, HostListener, ViewContainerRef, ComponentResolver} from '@angular/core';
import {NavController, NavParams, Content} from 'ionic-angular';
import {GoogleAnalytics} from 'ionic-native';

// Utils.
import {Util} from '../../../utils/util';

// Services.
import {SurveyService} from '../../../providers/survey-service';
import {ShareService} from '../../../providers/share-service';

// Pages.
import {InnerContent} from '../../../shared/components/innercontent/innercontent';
import {ImageSlidesPage} from '../../../shared/components/image-slides/image-slides';
import {SurveyResultPage} from '../result/result';

@Directive({
    selector: 'img'
})
export class Img {
    private images: any;
    constructor(private nav: NavController, private elementRef: ViewContainerRef) {
    }
    @HostListener('click', [])
    onClick() {
        let currentImage = this.elementRef.element.nativeElement;
        if (currentImage.parentElement.parentElement.className === 'contents selectable') {
            let images = currentImage.ownerDocument.querySelectorAll('.contents img');
            let sendData = {
                'currentImage': currentImage,
                'images': images
            };
            this.nav.push(ImageSlidesPage, { 'sendData': sendData });
        }
    }
}

@Component({
    templateUrl: 'build/pages/survey/detail/detail.html',
    providers: [SurveyService, Util],
    directives: [InnerContent]
})
export class SurveyDetailPage {

    @ViewChild(Content) pageContent: Content;
    private survey: any;
    private id: string;
    private sendData: any;
    private title: string;
    private content: any;
    private createDate: string;
    private createUserName: string;
    private createUserAvatar: string;
    private endDate: string;
    private status: string;
    private processStatus: string;
    private isLoadCompleted: boolean;
    private isScrollToTopButtonVisible: boolean;

    private pageLoadTime: number;
    private options: any;
    private images: any;
    private selectedOption: any = '';
    private initialSelectOption: any;
    private isFirstTimeAnswerSurvey: boolean = false;
    private isDisabled: boolean = true;

    constructor(private nav: NavController, private params: NavParams, private util: Util, private surveyService: SurveyService, private share: ShareService, private resolver: ComponentResolver) {
        this.survey = this.params.get('survey');
        this.id = this.survey.surveyID;
        this.processStatus = this.survey.processStatus;

        this.sendData = {
            'survey': this.survey,
            'isRefreshFlag': false
        };
        this.getSurveyDetailBySurveyID(true);
    }

    getSurveyDetailBySurveyID(isFristTimeRefresh?): void {
        this.surveyService.getSurveyDetailBySurveyID(this.id).then((data: any) => {
            if (isFristTimeRefresh) {
                this.title = data.title;
                this.content = [data.content, [Img]];
                this.createDate = data.createDate;
                this.createUserName = data.createUserName;
                this.createUserAvatar = data.createUserAvatar;
                this.endDate = data.endDate;
            }
            this.status = data.status;
            this.options = data.options;
            this.selectedOption = data.selectedOption;
            let initialSelectOption: any = JSON.stringify(data.selectedOption);
            this.initialSelectOption = JSON.parse(initialSelectOption);
            
            this.isLoadCompleted = true;
            this.isScrollToTopButtonVisible = false;
        });
    }

    changeSelectedOption(option): void {
        if (option.isSelected === true) {
            this.options.forEach(function (everyOption) {
                if (everyOption.isSelected === true && option.optionID !== everyOption.optionID) {
                    everyOption.isSelected = false;
                }
            });
            this.selectedOption = option;
        } else {
            this.selectedOption = '';
        }
        if (this.selectedOption.optionID === this.initialSelectOption.optionID && this.selectedOption.optionContent === this.initialSelectOption.optionContent) {
            this.isDisabled = true;
        } else {
            this.isDisabled = false;
        }
    }

    changeOptionContent(option): void {
        if (this.selectedOption.optionID === this.initialSelectOption.optionID && this.selectedOption.optionContent === this.initialSelectOption.optionContent) {
            this.isDisabled = true;
        } else {
            this.isDisabled = false;
        }
    }

    answerSurrvey(): void {
        this.surveyService.saveSurveyParticipantResult(this.id, this.selectedOption.optionID, this.selectedOption.optionContent).then(data => {
            if (data === 'true') {
                if (this.survey.processStatus !== 'PROCESSED') {
                    this.isFirstTimeAnswerSurvey = true;
                }
                this.sendData.isRefreshFlag = true;
                GoogleAnalytics.trackEvent('Survey', 'answer', 'survey');
                this.pushToSurveyResultPage();
            }
        });
    }

    showSurveyResult() {
        this.sendData.isRefreshFlag = false;
        this.pushToSurveyResultPage();
    }

    pushToSurveyResultPage() {
      this.nav.push(SurveyResultPage, {
          'sendData': this.sendData
      });
    }

    ionViewLoaded(): void {
        this.pageLoadTime = new Date().getTime();
    }

    ionViewWillEnter(): void {
        let isRefreshFlag = this.sendData.isRefreshFlag;
        if (isRefreshFlag === true) {
            this.pageContent.scrollToBottom();
            this.getSurveyDetailBySurveyID();
            this.isDisabled = true;
        }
    }

    ionViewWillUnload(): void {
        let now = new Date().getTime();
        let pageLoadingTime = now - this.pageLoadTime;
        if (this.processStatus === 'NOT_READ' && pageLoadingTime >= 3000) {
            this.updateParticipantStatus();
        }

        if (this.isFirstTimeAnswerSurvey) {
            this.survey.processStatus = 'PROCESSED';
        }
        this.isLoadCompleted = false;
        this.isScrollToTopButtonVisible = false;
    }

    updateParticipantStatus(): void {
        let processStatus = 'NOT_PROCESSED';
        this.surveyService.updateParticipantStatus(this.id, processStatus).then((data: string) => {
            if (data === 'true') {
                this.survey.processStatus = processStatus;
                this.changeSurveyNewInformationCount();
            }
        });
    }

    changeSurveyNewInformationCount(): void {
        let surveyNewInformationCount = this.share.surveyNewInformationCount;
        this.share.surveyNewInformationCount = surveyNewInformationCount - 1;
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

    showImageSlides(event): any {
        let currentImage = event.currentTarget;
        let images = document.querySelectorAll('.contents img');
        let sendData = {
            'currentImage': currentImage,
            'images': images
        };
        this.nav.push(ImageSlidesPage, { 'sendData': sendData });
    }

    showCommentImageSlides(event): any {
        let currentImage = event.currentTarget;
        let images = currentImage.parentElement.querySelectorAll('img');
        let sendData = {
            'currentImage': currentImage,
            'images': images
        };
        this.nav.push(ImageSlidesPage, { 'sendData': sendData });
    }

}
