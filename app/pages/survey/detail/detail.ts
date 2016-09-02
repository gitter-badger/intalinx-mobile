// Third party library.
import {Component, ViewChild, Directive, HostListener, ViewContainerRef} from '@angular/core';
import {NavController, NavParams, Content} from 'ionic-angular';

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
    private readStatus: string;
    private newReplyFlag: string;
    private sendData: any;
    private title: string;
    private content: any;
    private createDate: string;
    private createUserName: string;
    private createUserAvatar: string;
    private endDate: string;
    private status: string;
    private notProcessedCount: string;
    private processedCount: string;
    private isLoadCompleted: boolean;
    private isScrollToTopButtonVisible: boolean;

    private options: any;
    private attachFilesForDownload: any;
    private attachImagesForDisplay: any;

    private images: any;
    private sendDataToImageSlidesPage: any;
    private selectedOption: any = '';
    private hasTextArea: boolean;
    private optionContent: any;
    private isFirstTimeAnswerSurvey: boolean = false;

    constructor(private nav: NavController, private params: NavParams, private util: Util, private surveyService: SurveyService, private share: ShareService) {
        this.survey = this.params.get('survey');
        this.id = this.survey.surveyID;
        this.readStatus = this.survey.readStatus;
        this.newReplyFlag = this.survey.newReplyFlag;

        this.sendData = {
            'id': this.id,
            'isRefreshFlag': false,
            'unrepliedCommentcontent': ''
        };
        this.getSurveyDetailBySurveyID();
    }

    getSurveyDetailBySurveyID(): void {
        this.surveyService.getSurveyDetailBySurveyID(this.id).then((data: any) => {
            this.title = data.title;
            this.content = [data.content, [Img]];
            this.createDate = data.createDate;
            this.createUserName = data.createUserName;
            this.createUserAvatar = data.createUserAvatar;
            this.endDate = data.endDate;
            this.status = data.status;
            this.notProcessedCount = data.notProcessedCount;
            this.processedCount = data.processedCount;
            this.options = data.options;
            this.selectedOption = data.selectedOption;
            this.optionContent = data.selectedOption ? data.selectedOption.optionContent : this.optionContent;
            this.hasTextArea = data.selectedOption && data.selectedOption.inputFlag === 'TRUE' ? true : false;

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
            if (option.inputFlag === 'TRUE') {
                this.hasTextArea = true;
            } else {
                this.hasTextArea = false;
            }
        } else {
            this.selectedOption = '';
            this.hasTextArea = false;
        }
        this.optionContent = this.selectedOption.optionContent;
    }

    answerSurrvey(): void {
        this.surveyService.saveSurveyParticipantResult(this.id, this.selectedOption.optionID, this.optionContent).then(data => {
            if (data === 'true') {
                this.isFirstTimeAnswerSurvey = true;
                this.showSurveyResult();
            }
        });
    }

    showSurveyResult() {
      this.nav.push(SurveyResultPage, {
          'survey': this.survey
      });
    }

    ionViewDidEnter(): void {
        let isRefreshFlag = this.sendData.isRefreshFlag;
        if (isRefreshFlag === true) {
            this.pageContent.scrollToBottom();
            this.sendData.unrepliedCommentcontent = '';
        }
    }

    ionViewWillLeave(): void {
        this.sendData.isRefreshFlag = false;
    }

    ionViewWillUnload(): void {
        if (this.isFirstTimeAnswerSurvey) {
            this.survey.processStatus = 'PROCESSED';
            this.changeSurveyNewInformationCount();
        }
        this.isLoadCompleted = false;
        this.isScrollToTopButtonVisible = false;
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
