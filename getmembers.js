const firebase = require("firebase");
require("firebase/firestore");
const date = require('date-and-time');
const storage = require('electron-json-storage');


firebase.initializeApp({
    apiKey: "AIzaSyDRAurj89rKfwwBMoRjQ5JfzRKUDM9ax-I",
    authDomain: "desktop-app-8b038.firebaseapp.com",
    projectId: "desktop-app-8b038",
});

var db = firebase.firestore();

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

function getList() {

    document.getElementById("load-spinner").style.display = 'block';
    var total_count = 0;
    var disc_count = 0;
    var conn_count = 0;

    db.collection("Member-Details").orderBy('plot').get()
        .then(function (querySnapshot) {
            document.getElementById("load-spinner").style.display = 'none';

            if (querySnapshot.empty == true) {
                // alert("No member found.");
                // window.location.reload();
                document.getElementById("mList").innerHTML = "<br/><div>No data found.</div>"


            } else {
                document.getElementById("mList").innerHTML = ""
                querySnapshot.forEach(function (doc) {
                    // console.log("found data");

                    total_count += 1;

                    var_year = doc.data().Yearly;
                    var_exp = new Date(doc.data().expiry);
                    if (doc.data().status == "Disconnected") {
                        disc_count+=1
                        document.getElementById("mList").innerHTML += '<tr style="background-color: #ffcccb;"><td>' + doc.data().memberNumber + '</td><td>' + doc.data().plot + '</td><td>' + doc.data().plotType + '</td><td>' + doc.data().fullName + '</td><td>' + doc.data().phone + '</td><td>' + var_year + '</td><td>' + date.format(var_exp, 'MMM, YYYY') + '</td></tr>';

                    } else {
                        conn_count+=1

                        document.getElementById("mList").innerHTML += '<tr><td>' + doc.data().memberNumber + '</td><td>' + doc.data().plot + '</td><td>' + doc.data().plotType + '</td><td>' + doc.data().fullName + '</td><td>' + doc.data().phone + '</td><td>' + var_year + '</td><td>' + date.format(var_exp, 'MMM, YYYY') + '</td></tr>';
                    }


                });
            }

            document.getElementById("tot_mem").innerText = "Total Members: " + total_count + "\nConnected: "+ conn_count + "\tDisconnected: " + disc_count;
            // console.log(count);

        })

}

getList();

function print_btn() {
    document.getElementById("prt").style.display = "none";
    print();
}