const firebase = require("firebase");
const date = require('date-and-time');
const storage = require('electron-json-storage');
// const firebaseConfig = require("./keys.js");

const {firebaseConfig} = require('./keys');

// import { firebaseConfig } from 'keys.js';

console.log(firebaseConfig);

firebase.initializeApp(firebaseConfig);


var db = firebase.firestore();

// Configuration Data to local storage
let a_data;
let admin_status;

let configData;
var depAmount = 0;
var monthlyfee = 0;

var billStartMonth = "";
var memDets = {};
// var memberDep = 0;
var queryString = "";
var bill_info = {};


var admin_charges = 0;
var water_charges = 0;


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
            document.getElementById('upd-adm-ch').disabled = false;
            document.getElementById('upd-wat-ch').disabled = false;
        }
    }
});

storage.get('config', function (error, tdata) {
    if (error) {
        console.log("Error: " + error)
    } else {
        // console.log(tdata);
        configData = tdata;
        depAmount = configData['DepAmt'];
        lateFee = parseInt(configData['MonLateFee']);

    }
});

// Ends here


function searchNumber() {
    document.getElementById("load-spinner").style.display = "block";
    document.getElementById("noData").style.display = "none";
    document.getElementById("memberDets").style.display = "none";

    toSearch = document.getElementById("search_input").value;
    db.collection("Member-Details").where("memberNumber", "==", toSearch).get()
        .then(function (querySnapshot) {
            document.getElementById("load-spinner").style.display = "none";

            if (querySnapshot.empty == true) {
                // alert("No member found.");
                document.getElementById("noData").style.display = "block";
                document.getElementById("memberDets").style.display = "none";

            } else {
                querySnapshot.forEach(function (doc) {
                    document.getElementById("noData").style.display = "none";
                    document.getElementById("memberDets").style.display = "block";
                    memDets = doc.data();
                    console.log(memDets);

                    var paidon = new Date(doc.data().lastPaid);
                    var exp = new Date(doc.data().expiry);


                    document.getElementById('plot').innerText = doc.data().plot;
                    document.getElementById('type').innerText = doc.data().plotType;
                    document.getElementById('memN').innerText = doc.data().memberNumber;
                    document.getElementById('name').innerText = doc.data().fullName;
                    document.getElementById('phone').innerText = doc.data().phone;
                    document.getElementById('lastPd').innerText = date.format(paidon, 'DD/MMM/YYYY');
                    document.getElementById('exp').innerText = date.format(exp, 'MMM, YYYY');

                    if (doc.data().status == "Connected") {
                        // alert("Entered connected")
                        document.getElementById("dis_btn").checked = false;
                    } else if (doc.data().status == "Disconnected") {
                        // alert("Entered disconnected")
                        document.getElementById("dis_btn").checked = true;
                    }
                    // document.getElementById('stat').innerText = doc.data().status;
                    // + '<label class="switch"><input type="checkbox"><span class="slider round"></span></label>'';


                });
                getSlabs();

            }
        }).catch(function (error) {
            alert("An error has occured. Please retry.");
        })

}

function disconnect() {
    var mem = memDets["memberNumber"];
    // var sel = document.getElementById('upd-selectedPlotType')
    // var selValue = sel.options[sel.selectedIndex].text;
    // console.log(memDets["memberNumber"] + selValue + document.getElementById("upd-phone").value)


    if (document.getElementById("dis_btn").checked) {
        var res = confirm("Are you sure you want to disconnect this member?")
        if (res) {
            document.getElementById("dis_btn").checked = true;

            db.collection("Member-Details").where("memberNumber", "==", mem).get()
                .then(function (querySnapshot) {
                    querySnapshot.forEach(function (doc) {
                        db.collection("Member-Details").doc(doc.id).update({
                                status: "Disconnected",
                            })
                            .then(function () {
                                alert("Member disconnected successfully!");
                            })
                            .catch(function (error) {
                                alert("Error updating document: " + error);
                            });
                    });

                })

        } else {
            document.getElementById("dis_btn").checked = false;
        }
    } else if (document.getElementById("dis_btn").checked == false) {
        var res = confirm("Are you sure you want to connect this member?")
        if (res) {
            document.getElementById("dis_btn").checked = false;

            db.collection("Member-Details").where("memberNumber", "==", mem).get()
                .then(function (querySnapshot) {
                    querySnapshot.forEach(function (doc) {
                        db.collection("Member-Details").doc(doc.id).update({
                                status: "Connected",
                            })
                            .then(function () {
                                alert("Member connected successfully!");
                            })
                            .catch(function (error) {
                                alert("Error updating document: " + error);
                            });
                    });

                })
        } else {
            document.getElementById("dis_btn").checked = true;
        }
    }

}

var today = new Date();
var upd_lp;
var upd_exp;

function billing() {
    document.getElementById('bill-spinner').style.display = "block";
    document.getElementById('bill-body').style.display = "none";
    // alert('billing')
    memberNumber = document.getElementById('memN').innerText;
    var months = 0;
    var end_months;
    //Fetching previously paid data
    db.collection("Member-Details").where("memberNumber", "==", memberNumber).get()
        .then(function (querySnapshot) {

            document.getElementById('bill-spinner').style.display = "none";
            document.getElementById('bill-body').style.display = "block";

            querySnapshot.forEach(function (doc) {

                var exp = new Date(doc.data().expiry.toString());
                // var lastPaid = new Date(doc.data().lastPaid.toString());
                memDets = doc.data();

                // "Last paid on " + date.format(lastPaid, 'DD MMM, YYYY')  +

                document.getElementById("LastDate").innerText = "Water connection valid upto " + date.format(exp, 'MMM, YYYY') + ".\n \n Bill to be calculated from: ";
                billStartMonth = date.addMonths(exp, 1);
                document.getElementById("startBill").innerHTML = "<option>" + date.format(billStartMonth, 'MMM, YYYY') + "</option>";
                document.getElementById("paidUntilMonth").innerHTML = "";

                var i;


                //Populating the Month Options
                var currentM = new Date(date.format(today, 'YYYY/MM'))

                if (date.subtract(billStartMonth, currentM).toDays() >= 0) {
                    for (i = 1; i < 13; i++) {
                        var nextMonth = date.addMonths(exp, i);
                        nextMonth = date.format(nextMonth, 'MMM, YYYY');
                        document.getElementById("paidUntilMonth").innerHTML += "<option>" + nextMonth + "</option>";
                    }
                    end_month = date.addMonths(exp, 1)

                } else {
                    for (i = -1; i < 13; i++) {
                        var nextMonth = date.addMonths(today, i);
                        nextMonth = date.format(nextMonth, 'MMM, YYYY');
                        document.getElementById("paidUntilMonth").innerHTML += "<option>" + nextMonth + "</option>";
                    }
                    end_month = today;

                }


                //Generating bill

                totBill();


                // var start_month = new Date(billStartMonth.toString());

                // days = parseInt(date.subtract(end_month, start_month).toDays());

                // months = Math.round(days / 30) + 1;


            });

        })


}

function getSlabs() {

    memberNumber = document.getElementById('memN').innerText;

    db.collection("Bill-Slabs").where("memberNumber", "==", memberNumber).get()
        .then(function (querySnapshot) {

            querySnapshot.forEach(function (doc) {
                admin_charges = doc.data().admin;
                water_charges = doc.data().water;

                // alert(admin_charges+water_charges)
            });

        })
}

function totBill() {


    document.getElementById("BillGenBtn").disabled = false;

    // console.log(memDets["memberNumber"]);


    var selectedM = document.getElementById('paidUntilMonth');
    var selValue = selectedM.options[selectedM.selectedIndex].text;
    selDate = selValue.slice(-4) + "," + selValue.slice(0, 3);
    var end_date = new Date(selDate);

    var start_month = new Date(billStartMonth.toString());
    var end_month = new Date(end_date.toString());

    // Checking Months
    days = parseInt(date.subtract(end_month, start_month).toDays());
    months = Math.round(days / 30) + 1;
    if (months == 12) {
        months = 11;
        document.getElementById('yearlyCheck').checked = true;
        alert("Yearly discount applied!")
    }

    // Calculating Water & Admin for the Months
    var wat = water_charges * months;
    var adm = admin_charges * months;


    document.getElementById('water').value = wat;
    document.getElementById('admin').value = adm;

    // Late Algorithm
    var late = 0;
    var late_month = date.addMonths(billStartMonth, 1);


    while (date.subtract(today, late_month).toDays() > 0) {
        console.log(date.subtract(today, late_month).toDays())

        //For current month only checks if day > 15 
        if (date.format(today, 'MM') == date.format(late_month, 'MM')) {
            if (parseInt(date.format(today, "DD")) > 15) {

                // Late Fee defined as 100 rupees
                late += 100;
                late_month = date.addMonths(late_month, 1);
                // console.log(late_month)

            }
            break;
        } else {
            // Late Fee defined as 100 rupees
            late += 100;
            late_month = date.addMonths(late_month, 1);
        }

    }

    document.getElementById('late').value = late;
    var oth = parseInt(document.getElementById("other").value);

    var payment = document.getElementById("chequeNo").value;
    var total = wat + adm + late + oth;
    document.getElementById("totAmt").value = total


    //Bill ID generation 
    var rnd = Math.random().toString(36).substring(10)
    bill_id = date.format(today, 'YYMMDD') + memDets["memberNumber"] + rnd


    bill_info = {
        "memberNumber": memDets["memberNumber"],
        "paidOn": date.format(today, 'YYYY/M/DD'),
        "paidUntil": date.format(end_month, 'YYYY/MMM'),
        "total": {
            water: wat,
            admin: adm,
            late: late,
            other: oth
        },
        "bID": bill_id,
        "CC": payment
    }

    queryString = '?' + date.format(today, 'DD/MM/YYYY') + "&" + memDets["memberNumber"] + "&" + memDets["fullName"] + "&" + memDets["phone"] + "&" + wat + "&" + adm + "&" + late + "&" + oth + "&" + date.format(start_month, 'MMM YYYY') + '&' + date.format(end_month, 'MMM YYYY') + '&' + bill_id + '&' + payment;
    console.log(queryString)

}

function updModal() {
    document.getElementById("upd-plot").placeholder = memDets["plot"];
    document.getElementById("upd-memberNumber").placeholder = memDets["memberNumber"];
    document.getElementById("upd-fullName").placeholder = memDets["fullName"];
    document.getElementById("upd-phone").value = memDets["phone"];
    document.getElementById("upd-selectedPlotType").value = memDets["plotType"];

    document.getElementById("upd-plot").disabled = true;
    document.getElementById("upd-memberNumber").disabled = true;
    document.getElementById("upd-fullName").disabled = true;

    document.getElementById("upd-adm-ch").value = admin_charges;
    document.getElementById("upd-wat-ch").value = water_charges;


}

function updateMember() {

    var mem = memDets["memberNumber"];
    var sel = document.getElementById('upd-selectedPlotType')
    var selValue = sel.options[sel.selectedIndex].text;
    console.log(memDets["memberNumber"] + selValue + document.getElementById("upd-phone").value)


    db.collection("Member-Details").where("memberNumber", "==", mem).get()
        .then(function (querySnapshot) {
            querySnapshot.forEach(function (doc) {
                db.collection("Member-Details").doc(doc.id).update({
                        plotType: selValue,
                        phone: document.getElementById("upd-phone").value.toString()
                    })
                    .then(function () {

                        updSlab()
                        // alert("Member successfully updated!");
                        // $('#updateModal').modal('hide');
                        // window.location.reload();
                    })
                    .catch(function (error) {
                        // The document probably doesn't exist.
                        alert("Error updating document: " + error);
                    });
            });

        })

}

function genBill() {
    console.log(queryString);

    console.log(bill_info)

    // Creating a new bill

    db.collection("Bills-Generated").doc().set(bill_info)
        .then(function () {
            // alert("Bill generated successfully!");
            window.open("bill.html" + queryString);

            // window.location.reload()
        })
        .catch(function (error) {
            alert("An error occured. Please retry.");
        });

    var yearly = "";

    // Updating Last paid and expiry
    db.collection("Member-Details").where("memberNumber", "==", memDets["memberNumber"]).get()
        .then(function (querySnapshot) {
            querySnapshot.forEach(function (doc) {

                // Checking if Yearly is enabled or not
                if (document.getElementById('yearlyCheck').checked == true) {
                    // alert("True");
                    yearly = "True";
                } else {
                    // alert("False");
                    yearly = "False";
                }

                db.collection("Member-Details").doc(doc.id).update({
                        lastPaid: bill_info["paidOn"],
                        expiry: bill_info["paidUntil"],
                        Yearly: yearly
                    })
                    .then(function () {
                        // alert("Member successfully updated!");
                        $('#updateModal').modal('hide');
                        window.location.reload();
                    })
                    .catch(function (error) {
                        alert("Error updating document: " + error);
                    });
            });

        })



}

function updSlab() {

    db.collection("Bill-Slabs").where("memberNumber", "==", memDets["memberNumber"]).get()
        .then(function (querySnapshot) {
            querySnapshot.forEach(function (doc) {
                db.collection("Bill-Slabs").doc(doc.id).update({
                        admin: document.getElementById("upd-adm-ch").value,
                        water: document.getElementById("upd-wat-ch").value
                    })
                    .then(function () {
                        alert("Member successfully updated!");
                        $('#updateModal').modal('hide');
                        window.location.reload();
                    })
                    .catch(function (error) {
                        // The document probably doesn't exist.
                        alert("Error updating document: " + error);
                    });
            });

        })


}

function transferOwner() {
    var newname = document.getElementById("new-name").value;
    var newnumber = document.getElementById("new-phone").value;
    var ts = document.getElementById('newSelectedPlotType')
    var newType = ts.options[ts.selectedIndex].text;

    var transJSON = {
        "dateChanged": date.format(today, "YYYY/MM/DD"),
        "memberNumber": memDets["memberNumber"],
        "newData": [newname, newType, newnumber],
        "oldData": [memDets["fullName"], memDets["plotType"], memDets["phone"]],

    }

    db.collection("Ownership-Transfers").doc().set(transJSON)
        .then(function () {
            alert("Ownership transferred successfully!");
            window.location.reload()
        })
        .catch(function (error) {
            alert("An error occured. Please retry.");
        });

    db.collection("Member-Details").where("memberNumber", "==", memDets["memberNumber"]).get()
        .then(function (querySnapshot) {
            querySnapshot.forEach(function (doc) {
                db.collection("Member-Details").doc(doc.id).update({
                        fullName: newname,
                        plotType: newnumber,
                        phone: newType,
                    })
                    .then(function () {
                        // alert("Member successfully updated!");
                        $('#updateModal').modal('hide');
                        window.location.reload();
                    })
                    .catch(function (error) {
                        // The document probably doesn't exist.
                        alert("An error occured. ");
                    });
            });

        })
}

function checkTransfer() {
    memString = "?" + memDets["memberNumber"];
    window.open("ownerHistory.html" + memString);
}

function deleteMember() {
    res = confirm("If you proceed, this Member's data will be completely lost. Are you sure you want to proceed anyway?");
    if (res == true) {
        var mem = memDets["memberNumber"];

        db.collection("Member-Details").where("memberNumber", "==", mem).get()
            .then(function (querySnapshot) {
                querySnapshot.forEach(function (doc) {

                    result = confirm("Are you sure you want to permanently delete this member?");

                    if (result == true) {

                        db.collection("Member-Details").doc(doc.id).delete()
                            .then(function () {
                                alert("Member successfully deleted!");
                                window.location.reload();

                            })
                            .catch(function (error) {
                                // The document probably doesn't exist.
                                alert("Error deleting the member. Please retry. \n" + error);
                                window.location.reload();

                            });

                    }
                });

            })

    }

}

function toggle_search() {

    if (document.getElementById("s-tog").checked == true) {
        document.getElementById("search_input").style.display = "inline-block";
        document.getElementById("mem_s_btn").style.display = "inline-block";

        document.getElementById("bill_search").style.display = "none";
        document.getElementById("bill_btn").style.display = "none";

        document.getElementById("billDets").style.display = "none";

        // document.getElementById("s-tog").checked = false;

    } else if (document.getElementById("s-tog").checked == false) {
        document.getElementById("search_input").style.display = "none";
        document.getElementById("mem_s_btn").style.display = "none";

        document.getElementById("bill_search").style.display = "inline-block";
        document.getElementById("bill_btn").style.display = "inline-block";

        document.getElementById("memberDets").style.display = "none";
        document.getElementById("noData").style.display = "none";

        // document.getElementById("s-tog").checked = true;

    }
}


function searchBill() {
    document.getElementById("load-spinner").style.display = "block";
    document.getElementById("billDets").style.display = "none";

    toSearch = document.getElementById("bill_search").value;
    db.collection("Bills-Generated").where("bID", "==", toSearch).get()
        .then(function (querySnapshot) {
            document.getElementById("load-spinner").style.display = "none";

            if (querySnapshot.empty == true) {
                alert("This Bill ID doesn't exist in the database.");
                document.getElementById("billDets").style.display = "none";

            } else {
                querySnapshot.forEach(function (doc) {

                    document.getElementById("billDets").style.display = "block";

                    document.getElementById('ID').innerText = doc.data().bID;
                    document.getElementById('mNumber').innerText = doc.data().memberNumber;
                    document.getElementById('lp').innerText = doc.data().paidOn;
                    document.getElementById('until').innerText = doc.data().paidUntil;
                    document.getElementById('CC').innerText = doc.data().CC;

                    document.getElementById('wat_ch').innerText = doc.data().total.water;
                    document.getElementById('adm_ch').innerText = doc.data().total.admin;
                    document.getElementById('late_ch').innerText = doc.data().total.late;
                    document.getElementById('other_ch').innerText = doc.data().total.other;

                    var tot = parseInt(doc.data().total.other) + parseInt(doc.data().total.water) + parseInt(doc.data().total.admin) + parseInt(doc.data().total.late);
                    document.getElementById('tot_ch').innerText = tot;

                });
            }
        }).catch(function (error) {
            alert("An error has occured. Please retry.");
        })
}


function prev_bill_func() {

    memberNumber = document.getElementById('memN').innerText;

    document.getElementById("prev_water").value = water_charges;
    document.getElementById("prev_admin").value = admin_charges;


}

function prev_bill_charges_calc() {

    console.log(memDets["memberNumber"]);

    // selDate = selValue.slice(-4) + "," + selValue.slice(0, 3);

    var start_m = new Date(document.getElementById('start_m').value.slice(0, 8));
    var end_m = new Date(document.getElementById('end_m').value.slice(0, 8));

    document.getElementById('start_m').value = date.format(start_m, 'YYYY-MM-DD');
    document.getElementById('end_m').value = date.format(end_m, 'YYYY-MM-DD');


    days = parseInt(date.subtract(end_m, start_m).toDays());

    months = Math.round(days / 30) + 1;

    if (months == 12) {
        months = 11;
        document.getElementById('yearlyCheck').checked = true;
        alert("Yearly discount applied!")
    }

    var wat = water_charges * months;
    var adm = admin_charges * months;

    document.getElementById("prev_water").value = wat;
    document.getElementById("prev_admin").value = adm;

    var late = parseInt(document.getElementById("prev_late").value);
    var oth = parseInt(document.getElementById("prev_other").value);

    var payment = document.getElementById("prev_chequeNo").value;
    var total = wat + adm + late + oth;
    document.getElementById("prev_totAmt").value = total

    //Bill ID generation 
    var rnd = Math.random().toString(36).substring(10)
    bill_id = date.format(today, 'YYMMDD') + memDets["memberNumber"] + rnd
    var prev_bill_date = new Date(document.getElementById("prev_bill_date").value);
    // alert(lastPaidEntry)

    bill_info = {
        "memberNumber": memDets["memberNumber"],
        "paidOn": date.format(prev_bill_date, 'YYYY/M/DD'),
        "paidUntil": date.format(end_m, 'YYYY/MMM'),
        "total": {
            water: wat,
            admin: adm,
            late: late,
            other: oth
        },
        "bID": bill_id,
        "CC": payment
    }
    // alert(prev_bill_date)

    queryString = '?' + date.format(prev_bill_date, 'DD/MM/YYYY') + "&" + memDets["memberNumber"] + "&" + memDets["fullName"] + "&" + memDets["phone"] + "&" + wat + "&" + adm + "&" + late + "&" + oth + "&" + date.format(start_m, 'MMM YYYY') + '&' + date.format(end_m, 'MMM YYYY') + '&' + bill_id + '&' + payment;
    console.log(queryString)

}