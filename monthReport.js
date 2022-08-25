const date = require('date-and-time');
const firebase = require("firebase");
const storage = require('electron-json-storage');

const {firebaseConfig} = require('./keys');

firebase.initializeApp(firebaseConfig);

var db = firebase.firestore();

var today = new Date();

function setMonthstoSelect() {
    document.getElementById("Month4Reports").innerHTML = "<option disabled selected>Select a Month</option>";

    var prev_month = today;
    for (i = 0; i < 12; i++) {
        document.getElementById("Month4Reports").innerHTML += "<option>" + date.format(prev_month, "MMM, YYYY") + "</option>";
        prev_month = date.addMonths(prev_month, -1);
        // console.log(next_month);
    }
}

var repMonth;
var defaulters = [];
var non_def = [];


storage.get('admin_stat', function (error, status) {
    if (error) {
        console.log("Error: " + error)
    } else {
        a_data = status;
        admin_status = parseInt(a_data["admin"]);
        console.log(admin_status)

        if (Boolean(admin_status) == true) {
            // alert('entered ' + Boolean(admin_status))
            var arrayOfElements = document.getElementsByClassName('admin_feat');
            var lengthOfArray = arrayOfElements.length;

            for (var i = 0; i < lengthOfArray; i++) {
                arrayOfElements[i].style.display = 'block';
            }
        }
    }
});

function getRep() {
    defaulters = [];
    non_def = [];
    document.getElementById("mReport").style.display = "none";
    document.getElementById("d-btn").style.display = "none";
    document.getElementById("load-spinner").style.display = "block";

    var selM = document.getElementById('Month4Reports')
    var selValue = selM.options[selM.selectedIndex].text;
    selValue = selValue.slice(-4) + "," + selValue.slice(0, 3);
    repMonth = new Date(selValue);


    db.collection("Member-Details").get()
        .then(function (querySnapshot) {
            querySnapshot.forEach(function (doc) {
                var paidUntil = new Date(doc.data().expiry);
                var dayCount = date.subtract(paidUntil, repMonth).toDays();

                console.log(dayCount);

                var a = [doc.data().memberNumber, doc.data().fullName, doc.data().phone, doc.data().lastPaid];


                if (dayCount < 0) {
                    defaulters.push(a);
                } else if (dayCount >= 0) {
                    non_def.push(a);
                }


            });
        }).then(function () {
            document.getElementById("load-spinner").style.display = "none";
            document.getElementById("mReport").style.display = "block";

            document.getElementById("d-btn").style.display = "inline-block";
            document.getElementById("repHead").innerText = date.format(repMonth, "MMMM YYYY") + " - Monthly Report";

            displayTables(defaulters, non_def);
        })

}


function downL() {
    document.getElementById("d-btn").style.display = "none";
    document.getElementById("Month4Reports").style.display = "none";
    print();
}

function displayTables(def, ndef) {

    document.getElementById("n-defaulter").innerHTML = "<thead style='color: #8E54E9;'><tr><th> Member Number </th><th> Member Name </th> <th> Phone Number </th> <th> Last Paid On </th> </tr></thead>";
    document.getElementById("defaulter").innerHTML = "<thead style='color: #8E54E9;'><tr><th> Member Number </th><th> Member Name </th> <th> Phone Number </th><th> Last Paid On </th></tr></thead>";
    // console.log(def.length)
    // console.log(ndef.length)

    for (i = 0; i < ndef.length; i++) {
        console.log(ndef[i]);
        document.getElementById("n-defaulter").innerHTML += "<tr><td>" + ndef[i][0] + "</td><td>" + ndef[i][1] + "</td><td>" + ndef[i][2] + "</td><td>" + ndef[i][3] + "</td></tr>";
    }

    for (j = 0; j < def.length; j++) {
        console.log(def[j]);
        document.getElementById("defaulter").innerHTML += "<tr><td>" + def[j][0] + "</td><td>" + def[j][1] + "</td><td>" + def[j][2] + "</td><td>" + def[j][3] + "</td></tr>";
    }
}

function collectedFin() {
    var no_of_bills = 0;
    var amt_gen = 0;
    console.log("entered")

    var selM = document.getElementById('Month4Reports')
    var selValue = selM.options[selM.selectedIndex].text;
    selValue = selValue.slice(-4) + "," + selValue.slice(0, 3);
    repMonth = new Date(selValue);

    db.collection("Bills-Generated").get()
        .then(function (querySnapshot) {
            querySnapshot.forEach(function (doc) {
                var paidDate = new Date(doc.data().paidOn);

                console.log(typeof (doc.data().total))

                // var a = [doc.data().memberNumber, doc.data().fullName, doc.data().phone];

                if (date.format(paidDate, 'M/YY') == date.format(repMonth, 'M/YY')) {
                    no_of_bills += 1;
                    var bill_tot = parseInt(doc.data().total.water) + parseInt(doc.data().total.admin) + parseInt(doc.data().total.late) + parseInt(doc.data().total.other);
                    console.log(bill_tot);
                    amt_gen += bill_tot;
                }




            });
        }).then(function () {
            // document.getElementById("load-spinner").style.display = "none";
            document.getElementById("revReport").style.display = "block";

            document.getElementById("d-btn").style.display = "inline-block";
            // document.getElementById("fHead").innerText = date.format(repMonth, "MMMM YYYY") + " - Finances";

            document.getElementById("bill_num").innerText = no_of_bills;
            document.getElementById("rev_gen").innerText = "₹" + amt_gen;

            getRep();
        })

}