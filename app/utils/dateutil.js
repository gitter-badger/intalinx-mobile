export class DateUtil {

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
    
    static transferDateToKindsOfStyles(date, app) {
        let yearMonthDay = date.substring(0, 10);
        let dateWhoutT = new Date(yearMonthDay);
        dateWhoutT.setHours(date.substring(11, 13));
        dateWhoutT.setMinutes(date.substring(14, 16));
        dateWhoutT.setSeconds(date.substring(17, 19));
        let dateWhoutTTime = dateWhoutT.getTime();
        let now = new Date();
        let nowTime = now.getTime();
        let minutesFromDateToNow = Math.trunc((nowTime - dateWhoutTTime) / (60 * 1000));

        let minutesOfOneHour = 60;
        let minutesOfOneday = minutesOfOneHour * 24;
        let minutesOfOneWeek = minutesOfOneday * 7;
        let minutesOfOneYear = minutesOfOneday * 365;
        
        return new Promise(resolve => {
            if (now.getFullYear() != date.substring(0, 4)) {
                // 今年以前の場合
                resolve(yearMonthDay.substring(0, 7).replace(/\-/ig, "/"));              
            } else if (minutesFromDateToNow >= minutesOfOneWeek) {
                // 一週前の場合
                resolve(yearMonthDay.substring(5, 10).replace(/\-/ig, "/") + " " + date.substring(11, 16));
            } else if (minutesFromDateToNow >= minutesOfOneday) {
                // 一日~一週の場合
                DateUtil.transferDateToWeekDayName(dateWhoutT, app).then(data => {
                    resolve(data + " " + date.substring(11, 16));
                });
            } else if (minutesFromDateToNow >= minutesOfOneHour) {
                // 一時間~一日の場合
                let hours = Math.trunc(minutesFromDateToNow / minutesOfOneHour);
                app.translate.get(["app.date.hoursAgo"]).subscribe(message => {
                    resolve(hours + message["app.date.hoursAgo"]);
                });
            } else {
                // 一時間以内場合
                // １分以内場合
                if (minutesFromDateToNow < 1) {
                    minutesFromDateToNow = 1;
                }
                app.translate.get(["app.date.minutesAgo"]).subscribe(message => {
                    resolve(minutesFromDateToNow + message["app.date.minutesAgo"]);
                });
            }

        });
    }
    
    static transferDateToWeekDayName(date, app) {
        let weekday = new Array(7);
        return new Promise(resolve => {
            app.translate.get(["app.date.sunday", "app.date.monday", "app.date.tuesday",
                "app.date.wednesday", "app.date.thursday", "app.date.friday", "app.date.saturday"]).subscribe(message => {

                    weekday[0] = message["app.date.sunday"];
                    weekday[1] = message["app.date.monday"];
                    weekday[2] = message["app.date.tuesday"];
                    weekday[3] = message["app.date.wednesday"];
                    weekday[4] = message["app.date.thursday"];
                    weekday[5] = message["app.date.friday"];
                    weekday[6] = message["app.date.saturday"];

                    resolve(weekday[date.getDay()]);
                });
        });
    }
}