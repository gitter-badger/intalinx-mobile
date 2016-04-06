export class DateUtil {
    constructor() {

    }

    static transferCordysDateStringToUTC(sValue) {
        var fields = /(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})/.exec(sValue);
        --fields[2]; // month is zero based
        return new Date(Date.UTC(fields[1], fields[2], fields[3], fields[4], fields[5], fields[6]));
    }

    static getUTCDate() {
        let oDate = new Date();

        // handle date part
        let dateSep = "-";
        let day = oDate.getUTCDate();
        let month = oDate.getUTCMonth() + 1;
        let sDay = (day < 10) ? '0' + day : day;
        let sMonth = (month < 10) ? '0' + month : month;
        let sValue = oDate.getUTCFullYear() + dateSep + sMonth + dateSep + sDay + "T";

        // handle time part
        let timeSep = ":";
        let hours = oDate.getUTCHours();
        let minutes = oDate.getUTCMinutes();
        let seconds = oDate.getUTCSeconds();
        let sHours = (hours < 10) ? '0' + hours : hours;
        let sMinutes = (minutes < 10) ? '0' + minutes : minutes;
        let sSeconds = (seconds < 10) ? '0' + seconds : seconds;
        sValue += sHours + timeSep + sMinutes + timeSep + sSeconds + "Z";

        return sValue;
    }
    
    static transferDateToKindsOfStyles(date) {
        let yearMonthDay = date.substring(0, 10);
        let dateWhoutT = DateUtil.transferCordysDateStringToUTC(date);
        let dateWhoutTTime = dateWhoutT.getTime();

        let nowTime = new Date().getTime();
        let minutesFromDateToNow = Math.trunc((nowTime - dateWhoutTTime) / (60 * 1000));

        let minutesOfOneHour = 60;
        let minutesOfOneday = minutesOfOneHour * 24;
        let minutesOfOneWeek = minutesOfOneday * 7;
        return new Promise(resolve => {
            if (minutesFromDateToNow >= minutesOfOneWeek) {
                // 一週前の場合
                resolve(yearMonthDay.replace(/\-/ig, "/"));
            } else if (minutesFromDateToNow >= minutesOfOneday) {
                // 一日~一週の場合
                this.transferDateToWeekDayName(dateWhoutT).then(data => {
                    resolve(data + " " + date.substring(11, 16));
                });
            } else if (minutesFromDateToNow >= minutesOfOneHour) {
                // 一時間~一日の場合
                let hours = Math.trunc(minutesFromDateToNow / minutesOfOneHour);
                this.app.translate.get(["app.date.hoursAgo"]).subscribe(message => {
                    resolve(hours + message["app.date.hoursAgo"]);
                });
            } else {
                // 一時間以内場合
                // １分以内場合
                if (minutesFromDateToNow < 1) {
                    minutesFromDateToNow = 1;
                }
                this.app.translate.get(["app.date.minutesAgo"]).subscribe(message => {
                    resolve(minutesFromDateToNow + message["app.date.minutesAgo"]);
                });
            }

        });
    }
}