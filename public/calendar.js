
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
    }
}

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


//Array.isArray();

//create function to add row to each colmn
const tableBody = () => {
    let tr; //table <tr>
    let td; //table <td>
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
            // console.log(Array.isArray(data))

            for (let i = 0; i < 10; i++) {
                tr = document.createElement('tr')
                for (let col = 0; col < 6; col++) { //only monday to saturday
                    if (col === 5 && i > 5) break; //saturday stop at 15:00
                    td = document.createElement('td')
                    // td.onclick = function(){
                    //     alert(this.id)
                    // };
                    let unitIdValue = `${addDayToDate(getMondayDate(new Date()), col + incrementOfWeek)
                        .toLocaleDateString()}, 
                    ${startingHour(col) + i < 10 ? '0' + (startingHour(col) + i) : startingHour(col) + i}`;

                    let unitValue = `${startingHour(col) + i < 10 ? '0' + (startingHour(col) + i) : startingHour(col) + i}:00`
                    let unitID = unitIdValue.replace(onlyNum, ''); //now have date, need add time


                    if (data.includes(unitID)) {
                        td.innerHTML = 'bokad';
                        //td.set.style.cssText = "background-color: red"
                        td.setAttribute('id', unitID);
                        td.setAttribute("style", "background-color:gray")
                        
                    } else {
                        td.innerHTML = unitValue;
                        td.setAttribute('id', unitID);
                        td.addEventListener('click', unitclick);
                    }

                    // td.innerHTML = unitValue;
                    // td.setAttribute('id', unitID);
                    // td.addEventListener('click', unitclick);
                    tr.appendChild(td);

                }
                tblBodyContent.appendChild(tr);
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
