let swedTime = new Date().toLocaleString("en-US", { timeZone: "Europe/Stockholm" });
console.log(new Date(swedTime))
const handleErrors = (response) => {
    if (!response.ok) {
        throw Error(`ERROR FOUND: ${response.statusText}`);
    }
    return response;
};

function tableDisplay() {
    let table = document.getElementsByTagName('tbody')[0]
    let displayTime, compareTime, btn;
    fetch('/booking_info')
        .then(handleErrors)
        .then(response => response.json())
        .then(data => {
            for (let i = 0; i < data.length; i++) {

                displayTime = new Date(Number(data[i].timeID.slice(4, 8)), Number(data[i].timeID.slice(3, 4)) - 1, Number(data[i].timeID.slice(0, 2)), Number(data[i].timeID.slice(8, 10)));
                compareTime = new Date(Number(data[i].timeID.slice(4, 8)), Number(data[i].timeID.slice(3, 4)) - 1, Number(data[i].timeID.slice(0, 2)), Number(data[i].timeID.slice(8, 10)) - 1);

                let row = table.insertRow(i);
                let cell1 = row.insertCell(0);
                cell1.setAttribute('id', 'first_column')
                let cell2 = row.insertCell(1);
                let cell3 = row.insertCell(2);
                let cell4 = row.insertCell(3);
                cell1.innerHTML = i + 1;
                cell2.innerHTML = displayTime.toLocaleString("en-US", { timeZone: "Europe/Stockholm" });
                cell3.innerHTML = data[i].description;
                console.log(new Date(swedTime) < new Date(compareTime))
                if (new Date(swedTime) < new Date(compareTime)) {
                    cell4.innerHTML = '<button class="btn btn-outline-info" type="button">'
                        + '<a id="char_dec" href = "/delete/' + data[i].timeID + '">' + 'Cancle</a> </button>'
                } else {
                    cell4.innerHTML = "Session Occupied";
                }

            }
            //console.log(typeof(data[0].timeID))
        })
};



tableDisplay();