//Global variables
let currentDate = new Date();
let swedTime = new Date().toLocaleString("en-US", { timeZone: "Europe/Stockholm" });
let incrementOfDays = 0; //this value calculated by days, everytime when it +-7, it will consider as +-1 week.

//function to add table head
let tableHead = () => {
    let th;
    let tblContent = document.getElementById('tableHeadContent');
    tblContent.innerHTML = '' //remove existed calendar
    tblContent.setAttribute('class', 'text-center');
    tblContent.setAttribute('style', `background-color: ${"#e6ffff"}`)
    for (let i = 0; i < 6; i++) {
        let headerValue = addDayToDate(getMondayDate(new Date()), i + incrementOfDays)
            .toLocaleString('sv-SE', { weekday: 'long', month: 'short', day: '2-digit' });
        th = document.createElement('th');
        th.innerHTML = headerValue;
        tblContent.appendChild(th);
    };

};

//add days to certain date and get new date
let addDayToDate = (ymd, ad) => { //ymd:date. ad: add days
    ymd.setDate(ymd.getDate() + ad);
    return ymd;
}

//function to get Monday's date
let getMondayDate = (d) => {
    let day = d.getDay();
    let mondayDate = d.getDate() - day + (day == 0 ? -6 : 1);
    /**  date - day + 1 or +(-6)
     * if it's not sunday, then + 1, if it's sunday, -6*/
    return new Date(d.setDate(mondayDate));
}

/**
 * getData & arrayData is using to test purpose
 */
const arrayData = async() => {
    const response = await fetch('/get_users');
    const data = await response.json();
    console.log(Array.isArray(data))
};

//create function to add row to each colmn
const tableBody = () => {

    let row;
    let column;
    let btn;
    let insertI;
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

                    let calendarTime = new Date(addDayToDate(getMondayDate(new Date()), col + incrementOfDays));
                    let unitIdValue = `${calendarTime.toLocaleDateString()}, 
                    ${startingHour(col) + i < 10 ? '0' + (startingHour(col) + i) : startingHour(col) + i}`;
                    let unitValue = `${startingHour(col) + i < 10 ? '0' + (startingHour(col) + i) : startingHour(col) + i}:00`
                    let unitID = unitIdValue.replace(onlyNum, '');

                    column = document.createElement('td')
                    column.setAttribute('class', 'text-center align-middle');
                    column.setAttribute('id', unitID);


                    calendarTime.setHours(startingHour(col) + i < 10 ? '0' + (startingHour(col) + i) : startingHour(col) + i);
                    calendarTime.setMinutes(0);
                    calendarTime.setSeconds(0);

                    if (new Date(swedTime) > calendarTime) {

                        column.innerHTML = '';
                        column.setAttribute('style', 'visibility: hidden')
                        row.appendChild(column);

                        if (new Date(swedTime).getDate() == calendarTime.getDate() && new Date(swedTime).getMonth() == calendarTime.getMonth()) {
                            column.innerHTML = 'bokad';
                            column.setAttribute('style', 'background-color:gray')
                            row.appendChild(column);
                        }

                    } else {
                        if (data.includes(unitID)) {

                            // btn = document.createElement('a');
                            // btn.setAttribute('class', 'btn-close btn-close-white position-absolute')
                            // btn.setAttribute('aria-label', 'Close')
                            // btn.setAttribute('href', `/delete/` + encodeURIComponent(unitID))

                            // btn.addEventListener('click', deleteSchedule)
                            // btn.setAttribute('id', unitID);
                            column.innerHTML = 'bokad';
                            //column.appendChild(btn)

                            column.setAttribute('style', 'background-color:gray')
                        } else {
                            column.innerHTML = unitValue;
                            column.addEventListener('click', unitclick);
                        }

                        row.appendChild(column);
                    };
                }
                tblBodyContent.appendChild(row);
            } //for loop end
        }) //fetch end
};

//function to get the week number of the year
Date.prototype.getWeekNumber = function() {
    var d = new Date(Date.UTC(this.getFullYear(), this.getMonth(), this.getDate()));
    var dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    var yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
};

//unitclick
function unitclick() {
    let tableCellId = this.id;
    alert(`this unit is ${tableCellId}`)
    window.localStorage.setItem('cell_id', tableCellId);

    //alert(`this unit is ${tableCellId}`)
    //window.open("./form.html")
    window.location = "/user_input"
        //location.href = "www.google.com"

}

//deleteSchedule visual
function deleteSchedule() {
    let deleteCellId = this.id;
    alert(`this unit id ${deleteCellId} will be delete`)
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

let currentWeek = new Date().getWeekNumber();
//function to go backwards
const leftButton = document.getElementById('previousWeek');
leftButton.addEventListener('click', minusSevenDays);

function minusSevenDays() {
    incrementOfDays -= 7;
    currentWeek = new Date(addDayToDate(getMondayDate(new Date()), incrementOfDays)).getWeekNumber();
    creatCalendar();
}

//function to go forwards
const rightButton = document.getElementById('nextWeek');
rightButton.addEventListener('click', addSevenDays);

function addSevenDays() {
    incrementOfDays += 7;
    currentWeek = new Date(addDayToDate(getMondayDate(new Date()), incrementOfDays)).getWeekNumber();
    creatCalendar();
}

let showWeekNum = () => {
    document.getElementById('week-number').innerHTML = `vecka ${currentWeek}`;
};

function creatCalendar() {
    showWeekNum();
    tableHead();
    tableBody();
}

creatCalendar()