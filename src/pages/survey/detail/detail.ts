// Third party library.
import {Component, ViewChild, ElementRef, Renderer, OnDestroy} from '@angular/core';
import {NavController, NavParams, Content} from 'ionic-angular';
import {GoogleAnalytics} from 'ionic-native';
import {FormsModule} from '@angular/forms';
import {DynamicComponentModule} from 'angular2-dynamic-component/index';

// Utils.
import {Util} from '../../../utils/util';

// Services.
import {SurveyService} from '../../../providers/survey-service';
import {ShareService} from '../../../providers/share-service';

// Pages.
//import {InnerContent} from '../../../shared/components/innercontent/innercontent';
import {ImageSlidesPage} from '../../../shared/components/image-slides/image-slides';
import {SurveyResultPage} from '../result/result';

@Component({
    selector: 'page-survey-detail',
    templateUrl: 'detail.html',
    providers: [SurveyService, Util]
    //,
    //directives: [InnerContent]
})
export class SurveyDetailPage implements OnDestroy {

    @ViewChild(Content) pageContent: Content;
    public survey: any;
    public id: string;
    public sendData: any;
    public title: string;
    public content: any;
    public createDate: string;
    public createUserName: string;
    public createUserAvatar: string;
    public endDate: string;
    public status: string;
    public processStatus: string;
    public isLoadCompleted: boolean;
    public isScrollToTopButtonVisible: boolean;

    public pageLoadTime: number;
    public options: any;
    public images: any;
    public selectedOption: any = '';
    public initialSelectOption: any;
    public isFirstTimeAnswerSurvey: boolean = false;
    public isDisabled: boolean = true;

    public clickListener: Function;

    public outerDynamicModules = [DynamicComponentModule];
    public outerDynamicContext = {
        innerDynamicContext: {},
        innerDynamicTemplate: ``,
        innerDynamicModules: [
            FormsModule
        ]
    };
    public outerDynamicTemplate = `
        <DynamicComponent [componentContext]='innerDynamicContext' 
                          [componentModules]='innerDynamicModules'
                          [componentTemplate]='innerDynamicTemplate'>         
        </DynamicComponent>
   `;

    dynamicCallback(event) {
        this.clickListener = this.renderer.listen(this.elementRef.nativeElement, 'click', (event) => {
            let currentImage = event.target;
            if (currentImage.parentElement.parentElement.parentElement.className === 'contents selectable') {
                let images = currentImage.ownerDocument.querySelectorAll('.contents img');
                let sendData = {
                    'currentImage': currentImage,
                    'images': images
                };
                this.nav.push(ImageSlidesPage, { 'sendData': sendData });
            }
        })
    }

    ngOnDestroy() {
        this.clickListener();
    }

    constructor(public elementRef: ElementRef, public renderer: Renderer, public nav: NavController, public params: NavParams, public util: Util, public surveyService: SurveyService, public share: ShareService) {
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
                // this.content = [data.content, [Img]];
                this.outerDynamicContext.innerDynamicTemplate = data.content;
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

    ionViewDidLoad(): void {
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
            let processStatus = 'NOT_PROCESSED';
            this.updateParticipantStatus(processStatus);
        }
        if (this.processStatus === 'PROCESSED_BUT_NOT_READ' && pageLoadingTime >= 3000) {
            let processStatus = 'PROCESSED';
            this.updateParticipantStatus(processStatus);
        }

        if (this.isFirstTimeAnswerSurvey) {
            this.survey.processStatus = 'PROCESSED';
            this.changeSurveyNewInformationCount();
        }
        this.isLoadCompleted = false;
        this.isScrollToTopButtonVisible = false;
    }

    updateParticipantStatus(processStatus): void {
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
        this.pageContent.ionScroll.subscribe(() =>{
            if (this.pageContent.scrollTop > 200) {
                this.isScrollToTopButtonVisible = true;
            } else {
                this.isScrollToTopButtonVisible = false;
            }
        });
    }

    scrollToDetailPageTop(): void {
        this.pageContent.scrollToTop();
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
