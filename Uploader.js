//Node js script to upload data in bulk onto the firestore database of firebase
var admin = require("firebase-admin");

var serviceAccount = require("./serviceAccountKey.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const firestore = admin.firestore();
const path = require("path");
const fs = require("fs");
const directoryPath = path.join(__dirname,"files");

fs.readdir(directoryPath,function(err, files) {
    if(err) {
        return console.log("Can't Scan the directory:"+err);
    }
    files.forEach(function(file) {
        var lastDotIndex = file.lastIndexOf(".");
        var orders = require("./files/"+file);

        //each collection will have a different name(file's name) using the for each loop 
        orders.forEach((obj)=> {
            firestore.collection(file.substring(0,lastDotIndex)).doc().set(obj).then((docRef) => {
                console.log("Document Written",docRef);
            }).catch((err) => {
                console.error("Error inserting Doc:",err);
            });
        });
    });
});