import {Component} from '@angular/core';
import {NavController, NavParams} from 'ionic-angular';

@Component({
  templateUrl: 'build/pages/survey/option-result-detail/option-result-detail.html',
})
export class OptionResultDetailPage {
  private surveyOptionResult: any;

  constructor(private navCtrl: NavController, private params: NavParams) {
    this.surveyOptionResult = this.params.get('surveyOptionResult');
  }
}
