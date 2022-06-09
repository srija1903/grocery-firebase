import { useEffect, useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./Users-Config";
import axios from "axios";

const AddUser = () => {
    const [city,setCity] = useState("None");
    const [loc,setLocation] = useState("None");
    const [email,setEmail] = useState("");
    const [password,setPwd] = useState("");
    const [cpwd,setCPwd] = useState("");
    const [error,setError] = useState("");
    const [role,setRole] = useState("None");

    useEffect(() => {
        onAuthStateChanged(auth,(user) => {
            if(!user) {
                window.location.href="/";
            }
            user.getIdTokenResult().then((idTokenResult) => {
                if(idTokenResult.claims.role !== "Admin"){
                    window.location.href="/dashboard";
                }
            });
        });
    },[]);

    const addUser = async(e) => {
        e.preventDefault();
        try {
            await axios.post("https://grocery-firebase.herokuapp.com/addUser",{
                city:city,
                email:email,
                password:password,
                cpwd:cpwd,
                role:role,
                loc:loc
            }).then(() => {
                window.location.href="/roles";
            })
        } catch {
            setError("Error Adding User");
        }
    }

    return ( 
        <div className="container">
            <div className="card">
                <div className="card-body">
                    <h2 className="page-header">Add User</h2>
                    {error &&<div className="alert alert-danger">{error}</div>}
                    <form className="row form" onSubmit={addUser}>

                        <div className="input-group mb-3">
                            <label className='input-group-text'>Email</label>
                            <input className='form-control' required placeholder='Enter Email' type="email" onChange={(event) => {
                                setEmail(event.target.value)
                            }}/>
                        </div>

                        <div className="input-group mb-3">
                            <label className='input-group-text'>Password</label>
                            <input className='form-control' required placeholder='Enter Password' type="password" onChange={(event) => {
                                setPwd(event.target.value)
                            }}/>
                        </div>

                        <div className="input-group mb-3">
                            <label className='input-group-text'>Confirm Password</label>
                            <input className='form-control' required placeholder='Confirm Password' type="password" onChange={(event) => {
                                setCPwd(event.target.value);
                            }}/>
                        </div>

                        <div className="input-group mb-3">
                            <label className="input-group-text">Select Role</label>
                            <select className="form-control form-select" value={role} onChange={(event) => {
                                setRole(event.target.value);
                            }}>
                                <option value="None">None</option>
                                <option value="Admin">Admin</option>
                                <option value="HQ-Manager">HQ Manager</option>
                                <option value="Store-Manager">Store Manager</option>
                            </select>
                        </div>

                        {
                            (role === "Admin")?null:(
                                <div className="input-group mb-3">
                                    <label className='input-group-text'>City</label>
                                    <select className="form-control form-select" value={city} onChange={(event) => {
                                        setCity(event.target.value);
                                    }}>
                                        <option value="None">None</option>
                                        <option value="Pune">Pune</option>
                                        <option value="Mumbai">Mumbai</option>
                                        <option value="Delhi">Delhi</option>
                                    </select>
                                </div> 
                            )
                        }

                        {
                            (role === "Admin" || role === "HQ-Manager")?null:(
                                <div className="input-group mb-3">
                                    <label className='input-group-text'>Location</label>
                                    <select className="form-control form-select" onChange={(event) => {
                                        setLocation(event.target.value);
                                    }}>
                                        {/* Showing Only Pune Locations */}
                                        {(city ==="Pune")?( <option value="Kothrud">Kothrud</option>):null}
                                        {(city ==="Pune")?(<option value="Viman-Nagar">Viman Nagar</option>):null}
                                        {(city ==="Pune")?(<option value="Baner">Baner</option>):null}
                                        
                                        {/* Showing only Mumbai Locations */}
                                        {(city ==="Mumbai")?<option value="Malad">Malad</option>:null}
                                        {(city ==="Mumbai")?<option value="Andheri">Andheri</option>:null}
                                        {(city ==="Mumbai")?<option value="Thane">Thane</option>:null}

                                        {/* Showing only Delhi Locations */}
                                        {(city ==="Delhi")?<option value="Sector 1">Sector 1</option>:null}
                                        {(city ==="Delhi")?<option value="Sector 2">Sector 2</option>:null}
                                        {(city ==="Delhi")?<option value="Sector 3">Sector 3</option>:null}
                                    </select>
                                </div> 
                            )
                        }
                        <a href="/roles" className="btn btn-default">Back to Role Page</a><br/>
                        <button className="btn btn-primary">Add User</button>
                    </form>
                </div>
            </div>
        </div>
     );
}
 
export default AddUser;