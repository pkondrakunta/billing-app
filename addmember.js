const firebase = require("firebase");
const storage = require('electron-json-storage');
const date = require('date-and-time');

require("firebase/firestore");

firebase.initializeApp({
    apiKey: "AIzaSyDRAurj89rKfwwBMoRjQ5JfzRKUDM9ax-I",
    authDomain: "desktop-app-8b038.firebaseapp.com",
    projectId: "desktop-app-8b038",
});

var db = firebase.firestore();
var memJSON = {};
var instCharges = 0;
var depAmount = 0;
var cuMonth = new Date();
var monthlyfee = 0;
var bill_info = {};


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

function NewMemberDetails() {

    var num = document.getElementById("memberNumber").value
    var pl = document.getElementById("plot").value
    var name = document.getElementById("fullName").value
    var ph = document.getElementById("phone").value

    var sel = document.getElementById('selectedPlotType')
    var type = sel.options[sel.selectedIndex].text;

    memJSON = {
        "memberNumber": num,
        "fullName": name,
        "phone": ph,
        "plot": pl,
        "plotType": type,
        "deposit": "",
        "lastPaid": date.format(cuMonth, 'YYYY/M/DD'),
        "expiry": date.format(cuMonth, 'YYYY/MMM')
    }
    bill_info = {
        "memberNumber": num,
        "paidOn": date.format(cuMonth, 'YYYY/M/DD'),
        "paidUntil": date.format(cuMonth, 'YYYY/MMM'),
    }



    db.collection("Member-Details").where("memberNumber", "==", num).get()
        .then(function (querySnapshot) {

            //Bill only if Member number does not exist in database
            if (querySnapshot.empty == true) {

                $('#paymentModal').modal('show');

                storage.get('config', function (error, tdata) {
                    if (error) {
                        console.log("Error: " + error)
                    } else {
                        console.log(tdata);
                        // document.getElementById("newMemberPaymentInfo").innerText = "Installation Charges: " + tdata["InstCharges"] + "\nDeposit Amount: " + tdata["DepAmt"];
                        instCharges = parseInt(tdata["InstCharges"]);
                        depAmount = parseInt(tdata["DepAmt"]);
                        memJSON["deposit"] = parseInt(tdata["DepAmt"]);
                        console.log(memJSON)

                    }

                });

                document.getElementById("startBill").innerHTML = "<option>" + date.format(cuMonth, "MMM, YYYY") + "</option>";
                document.getElementById("paidUntilMonth").innerHTML = "";


                var i;
                for (i = 0; i < 12; i++) {

                    var nextMonth = date.addMonths(cuMonth, i);
                    nextMonth = date.format(nextMonth, 'MMM, YYYY');
                    document.getElementById("paidUntilMonth").innerHTML += "<option>" + nextMonth + "</option>";


                }


            } else {
                alert("Member number already exists.")

            }


        })



}

function confirmAddMember() {

    db.collection("Member-Details").doc().set(memJSON)
        .then(function () {
            alert("New member was added successfully!");
            // window.location.reload()
        })
        .catch(function (error) {
            alert("An error occured. Please retry.");
        });

    db.collection("Bills-Generated").doc().set(bill_info)
        .then(function () {
            window.open("bill.html" + queryString);
            window.location.reload()
        })
        .catch(function (error) {
            alert("An error occured. Please retry.");
        });    
        
        var yearly = "False";
     
        if (document.getElementById('yearlyCheck').value == "on") {
            // alert("True");
            yearly = "True";
        }
        // Updating Last paid and expiry
        db.collection("Member-Details").where("memberNumber", "==", memJSON["memberNumber"]).get()
            .then(function (querySnapshot) {
                querySnapshot.forEach(function (doc) {
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

// function calcBill() {
//     // console.log("entered calcbill");
//     var selectedM = document.getElementById('paidUntilMonth')
//     var selValue = selectedM.options[selectedM.selectedIndex].text;
//     selDate = selValue.slice(-4) + "," + selValue.slice(0, 3);


//     var end_date = new Date(selDate);

//     var start_month = new Date(cuMonth.toString());
//     var end_month = new Date(end_date.toString());
//     // alert(end_month);
//     memJSON["expiry"] = date.format(end_month, 'YYYY/MMM');
//     bill_info["paidUntil"] = date.format(end_month, 'YYYY/MMM');


//     days = parseInt(date.subtract(end_month, start_month).toDays());
//     months = Math.round(days / 30) + 1;
//     console.log(months);
//     total = parseInt(instCharges) + parseInt(depAmount) + (months * parseInt(monthlyfee));


//     document.getElementById("calSelAmt").innerText = "Total Bill Amount : " + total.toString();


// }

function totBill() {
    document.getElementById("BillGenBtn").disabled = false;

    console.log(memJSON["memberNumber"]);
    var selectedM = document.getElementById('paidUntilMonth');
    var selValue = selectedM.options[selectedM.selectedIndex].text;
    selDate = selValue.slice(-4) + "," + selValue.slice(0, 3);
    var end_date = new Date(selDate);

    var start_month = new Date(cuMonth.toString());
    var end_month = new Date(end_date.toString());

    var inst = parseInt(document.getElementById("install").value);
    var wat = parseInt(document.getElementById("water").value);
    var adm = parseInt(document.getElementById("admin").value);
    var late = parseInt(document.getElementById("late").value);
    var oth = parseInt(document.getElementById("other").value);

    var payment = document.getElementById("chequeNo").value;
    var total = wat + adm + late + oth + inst;
    document.getElementById("totAmt").value = total

    //Bill ID generation 
    var rnd = Math.random().toString(36).substring(10)
    bill_id = date.format(cuMonth, 'YYMMDD') + memJSON["memberNumber"] + rnd

    bill_info = {
        "memberNumber": memJSON["memberNumber"],
        "paidOn": date.format(cuMonth, 'YYYY/M/DD'),
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

    queryString = '?' + date.format(cuMonth, 'DD/MM/YYYY') + "&" + memJSON["memberNumber"] + "&" + memJSON["fullName"] + "&" + memJSON["phone"] + "&" + wat + "&" + adm + "&" + late + "&" + oth + "&" + date.format(start_month, 'MMM YYYY') + '&' + date.format(end_month, 'MMM YYYY') + '&' + bill_id + '&' + payment;
    console.log(queryString)

}
