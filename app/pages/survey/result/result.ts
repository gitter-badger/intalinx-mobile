// Third party library.
import {Component, ViewChild} from '@angular/core';
import {NavController, NavParams} from 'ionic-angular';

// Utils.
import {Util} from '../../../utils/util';

// Services.
import {SurveyService} from '../../../providers/survey-service';

// Pages.
import {SurveyDetailPage} from '../detail/detail';

@Component({
    templateUrl: 'build/pages/survey/result/result.html',
    providers: [SurveyService, Util],
})
export class SurveyResultPage {
    private survey: any;
    private surveyID: string;
    private title: string;
    private status: string;
    private surveyOptionResults: any;
    private participantTotalCount: number;
    private isLoadCompleted: boolean = false;

    constructor(private nav: NavController, private params: NavParams, private util: Util, private surveyService: SurveyService) {
        let sendData = this.params.get('sendData');
        this.survey = sendData.survey;
        this.surveyID = this.survey.surveyID;
        this.title = this.survey.title;
        this.status = this.survey.status;
        this.getSurveyResultList();
    }

    getSurveyResultList() {
        this.surveyService.getSurveyResultList(this.surveyID).then((data: any) => {
            this.surveyOptionResults = data.surveyOptionResults;
            this.participantTotalCount = data.participantTotalCount;
            this.isLoadCompleted = true;
        });
    }

    showSurveyDetail() {
        this.nav.push(SurveyDetailPage, {
            'survey': this.survey
        });
    }
}
