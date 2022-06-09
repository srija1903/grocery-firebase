const admin = require("firebase-admin");
const express = require("express");
var cors = require("cors");
const bodyParser = require("body-parser");

const app = express();
app.use(cors({origin:true,credentials:true}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended:true
}));

const serviceAccountKey = require("./serviceAccountKey.json");
admin.initializeApp({
    credential: admin.credential.cert(serviceAccountKey)
});
const firestore = admin.firestore();

app.listen((process.env.PORT|| 8000),()=> {
    console.log("App listening on Port 8000");
});
app.get("/roles",async(req,res) =>{
    await admin.auth().listUsers().then(user => {
        res.send(user);
    });
});
app.post("/addUser",async(req,res) => {

    const email = req.body.email;
    const password = req.body.password;
    const cpwd = req.body.cpwd;
    const role = req.body.role,city = req.body.city,location = req.body.loc;

    try{
        const user = await admin.auth().createUser({
            email: email,
            password: password
        });
        //assigning role to the user
        if(role === "Admin") {
            await admin.auth().setCustomUserClaims(user.uid,{role});
        } else if(role === "HQ-Manager") {
            await admin.auth().setCustomUserClaims(user.uid,{role,city});
        } else if(role === "Store-Manager") {
            await admin.auth().setCustomUserClaims(user.uid,{role,city,location });
        }
        //saving the details into firestore database
        firestore.collection("UserRoles").doc().set({
            user_id:user.uid,
            email:email,
            role:role,
            city:city,
            location:location
        }).then(() => {
            console.log("Document Written");
        });
        console.log("User And Role is Assigned Successfully");
    } catch(error){
        console.log(error);
    }
});
//updating a user's details
app.post("/roles",async(req,res) => {

    try {
        const user_id = req.body.user_id;
        const role = req.body.role;
        
        await admin.auth().setCustomUserClaims(user_id,{role});
        console.log("Updated User. New Role:",role);
        
    } catch (error) {
        console.log(error);
    }
});