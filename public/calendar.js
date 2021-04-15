
//function to get the week number of the year
Date.prototype.getWeekNumber = function () {
    var d = new Date(Date.UTC(this.getFullYear(), this.getMonth(), this.getDate()));
    var dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    var yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
};

//Global variables
let currentWeekDay = new Date().getDay();
let currentMonthDate = new Date().getDate();
let currentYear = new Date().getFullYear();
let currentMonth = new Date().getMonth() + 1;
let stringTime = new Date().toDateString();
let currentWeek = new Date().getWeekNumber();
let currentDate = new Date();
let swedTime = new Date().toLocaleString("en-US", { timeZone: "Europe/Stockholm" });
let incrementOfWeek = 0;


//function to add table head
function tableHead() {
    let th; //table <th>
    let tblContent = document.getElementById('tableHeadContent');
    tblContent.innerHTML = ''  //remove existed calendar
    tblContent.style.backgroundColor = 'red'
    for (let i = 0; i < 6; i++) { //from monday to saturday
        let headerValue = addDayToDate(getMondayDate(new Date()), i + incrementOfWeek)
            .toLocaleString('sv-SE', { weekday: 'long', month: 'short', day: '2-digit' });
        th = document.createElement('th');
        th.innerHTML = headerValue;
        tblContent.appendChild(th);
    };
};

//add days to certain date and get new date
function addDayToDate(ymd, ad) { //ymd:date. ad: add days
    ymd.setDate(ymd.getDate() + ad);
    return ymd;
}


//function to get Monday's date
//need to be changed later to dymnatic
function getMondayDate(d) {
    //d = new Date(d);
    let day = d.getDay();
    /** d.getDate() to get that day's date
     * date - day + 1 or +(-6)
     * if it's not sunday, then + 1, if it's sunday, -6*/
    let mondayDate = d.getDate() - day + (day == 0 ? -6 : 1);
    /**use setDate to set monday's date as parameter and pass it 
     * to today's date, then recall new Date
    */
    return new Date(d.setDate(mondayDate));
}
/**
 * getData & arrayData is using to test purpose
 */
let getData = fetch('/get_users').then(response => response.json()).then(data => {
    return Array.isArray(data)
});


const arrayData = async () => {
    const response = await fetch('/get_users');
    const data = await response.json();
    console.log(Array.isArray(data))
};


//from here, it needs another comparison, to compare the date in unit and today's date, if unit date is larger, processed the following 


/**下面的比较比的是只要日期比今天大，就顺位把表格CELL加进去,
 * 主要问题是： 日期与格子没有联系
 * 改正方法： (1) 以日期为单位， 7天-今天作为横排的数值，起始值设在当天。 应该从col下手   [可行性太低]
 * (2) 把表格头放到这里，以日期为导向， 当日期与今天的日期相等是CASE1， 日期大于今天CASE2， 日期小于今天CASE3
 * (3) 那UNIT作比较，直接比较现在的时间和UNIT里的时间，小的就加空的 TR TD
 */
/**先把TABLE的生成变为以先生成COLUMN，然后再生成ROW */


//create function to add row to each colmn
const tableBody = () => {

    let row; //table <tr>
    let column; //table <td>
    const tblBodyContent = document.getElementById('tableBodyContent');
    const onlyNum = /\D/g;
    tblBodyContent.innerHTML = '' //remove existed calendar

    const handleErrors = (response) => {
        if (!response.ok) {
            throw Error(`ERROR FOUND: ${response.statusText}`);
        }
        return response;
    };

    fetch('/get_users')
        .then(handleErrors)
        .then(response => response.json())
        .then(data => {
            // console.log(data)

            for (let i = 0; i < 10; i++) {
                row = document.createElement('tr');
                for (let col = 0; col < 6; col++) { //only monday to saturday
                    if (col === 5 && i > 5) break; //saturday stop at 15:00
                    column = document.createElement('td')
                    let calendarTime = new Date(addDayToDate(getMondayDate(new Date()), col + incrementOfWeek));
                    let unitIdValue = `${calendarTime.toLocaleDateString()}, 
                    ${startingHour(col) + i < 10 ? '0' + (startingHour(col) + i) : startingHour(col) + i}`;
                    let unitValue = `${startingHour(col) + i < 10 ? '0' + (startingHour(col) + i) : startingHour(col) + i}:00`
                    let unitID = unitIdValue.replace(onlyNum, ''); //now have date, need add time

                    calendarTime.setHours(startingHour(col) + i < 10 ? '0' + (startingHour(col) + i) : startingHour(col) + i);
                    calendarTime.setMinutes(0);
                    calendarTime.setSeconds(0);

                    //console.log(new Date(swedTime).toLocaleDateString() > calendarTime.toLocaleDateString())
                    let test = new Date(swedTime).toLocaleDateString() > calendarTime.toLocaleDateString();
                    let testb = new Date(swedTime) > calendarTime


                    if (new Date(swedTime).toLocaleDateString() > calendarTime.toLocaleDateString()) {
                        column.innerHTML = '';
                        column.setAttribute('id', unitID);
                        column.setAttribute("style", "visibility: hidden")
                        row.appendChild(column);
                    } else if (new Date(swedTime).getDate() == calendarTime.getDate() && new Date(swedTime) > calendarTime) {
                        column.innerHTML = 'bokad';
                        //td.set.style.cssText = "background-color: red"
                        column.setAttribute('id', unitID);
                        column.setAttribute("style", "background-color:gray")
                        row.appendChild(column);
                    } else {
                        if (data.includes(unitID)) {
                            column.innerHTML = 'bokad';
                            //td.set.style.cssText = "background-color: red"
                            column.setAttribute('id', unitID);
                            column.setAttribute("style", "background-color:gray")

                        } else {
                            column.innerHTML = unitValue;
                            column.setAttribute('id', unitID);
                            column.addEventListener('click', unitclick);
                        }
                        row.appendChild(column);
                    };


                    //row.appendChild(column);
                }
                tblBodyContent.appendChild(row);
            } //for loop end

        })//fetch end
};

//unitclick
function unitclick() {
    let tableCellId = this.id;
    window.localStorage.setItem('cell_id', tableCellId);

    alert(`this unit is ${tableCellId}`)
    window.open("./form.html")
    //window.location = "./form.html"
    //location.href = "www.google.com"
}

//starting hour (need to change based on Sweden time zone)
function startingHour(wd) { //weekday
    if (wd < 5) {
        currentDate.setHours(9);
    } else if (wd == 5) {
        currentDate.setHours(10);
    }
    return currentDate.getHours();
}

//function to go backwards
const leftButton = document.getElementById('previousWeek');
leftButton.addEventListener('click', minusSevenDays);
function minusSevenDays() {
    incrementOfWeek -= 7;
    creatCalendar();
}

//function to go forwards
const rightButton = document.getElementById('nextWeek');
rightButton.addEventListener('click', addSevenDays);
function addSevenDays() {
    incrementOfWeek += 7;
    creatCalendar();
}

function creatCalendar() {
    tableHead(); //call table head
    tableBody(); //call table body

}

creatCalendar()

//a function: if time has passed, the old table block won't show
//a function: any booked block can not be hover or clicked
//a function: use today's hour compair to canlendar, if time is passed, lock the schedule
