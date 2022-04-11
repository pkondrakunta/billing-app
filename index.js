const firebase = require("firebase");
const storage = require('electron-json-storage');
const defaultDataPath = storage.getDefaultDataPath()

require("firebase/firestore");


firebase.initializeApp({
    apiKey: "AIzaSyDRAurj89rKfwwBMoRjQ5JfzRKUDM9ax-I",
    authDomain: "desktop-app-8b038.firebaseapp.com",
    projectId: "desktop-app-8b038"
});

var db = firebase.firestore();

function storeConfig() {
    db.collection("Configuration").get()
        .then(function (querySnapshot) {
            querySnapshot.forEach(function (doc) {
                console.log(doc.data());
                storage.set('config', doc.data());

            });

        });
}

function getConfig() {

    storage.get('config', function (error, tdata) {
        if (error) {
            console.log("Error: " + error)
        } else {
            console.log(tdata);
        }

    });
}

storeConfig()

function authentication() {

    var uname = document.getElementById("user").value;
    var pword = document.getElementById("psw").value;
    if (navigator.onLine) {
        db.collection("Login-Cred").where("username", "==", uname).get()
            .then(function (querySnapshot) {
                if (querySnapshot.empty == true) {
                    document.getElementById("loginfail").innerHTML = "Invalid username.";
                } else {
                    querySnapshot.forEach(async function (doc) {
                        if (pword == doc.data().password) {
                            // alert(doc.data().admin)
                            var admin = { "admin" : doc.data().admin}
                            storage.set('admin_stat', admin);
                            window.location.assign("home.html");


                        } else {
                            document.getElementById("loginfail").innerHTML = "Check the password you entered.";
                        }
                    });
                }
            })

    } else {
        alert("You are offline currently. Connect to the internet and retry.");
        window.location.reload();
    }
}

function checkInternet() {
    require('dns').lookup('google.com', function (err) {
        if (err && err.code == "ENOTFOUND") {
            login();
        } else {
            document.getElementById("loginfail").innerHTML = "Please Wait...";
            authentication();
        }
    })
}