import {Page, NavController} from 'ionic-angular';

@Page({
  templateUrl: 'build/pages/schedule/edit-event/edit-event.html',
})
export class EditEventPage {
  static get parameters() {
    return [[NavController]];
  }

  constructor(nav) {
    this.nav = nav;
  }
}
