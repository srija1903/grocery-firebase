import "bootstrap/dist/css/bootstrap.min.css";
import { onAuthStateChanged } from "firebase/auth";
import { useEffect, useState } from "react";
import { auth } from "./Users-Config";
import {db} from "./Firebase-Config";
import {collection, doc, getDocs, updateDoc} from "firebase/firestore";
import axios from "axios";

const Roles = () => {
    const [roleList,setRoleList]=useState([]);
    const roleCollectionRef = collection(db,"UserRoles");
    const [editRoleId,setRoleId] = useState(null);
    const [error,setError] = useState("");
    const [formData,setFormData] = useState({
        newRole:"none",
        newCity:"",
        newLoc:""
    });

    const getRoles = async() => {
        const data = await getDocs(roleCollectionRef);
        setRoleList(data.docs.map((doc) => ({
            ...doc.data(),
            id:doc.id
        })));
    }
    
    useEffect(() => {
        onAuthStateChanged(auth,(user) => {
            if(!user) {
                window.location.href="/";
            }
            user.getIdTokenResult().then((idTokenResult) => {
                if(idTokenResult.claims.role !=="Admin"){
                    window.location.href="/dashboard";
                }
            });
        });
    },[]);

    useEffect(() => {
       getRoles();
        // try {
        //     axios.get("https://grocery-firebase.herokuapp.com/roles").then((user)=>{
        //     setRoleList(user.data.users);
        // });
        // } catch {
        //     setError("Can't display the list");
        // }
    },[]);

    const editId = (event,role) => {
        event.preventDefault();
        setRoleId(role.id);
    };

    const edit = async(event,form,val) => {
        event.preventDefault();

        const newField = {role:form.newRole,city:form.newCity,location:form.newLoc};
        const update = doc(db,"UserRoles",val.id);
        await updateDoc(update,newField);

        try {
            axios.post("https://grocery-firebase.herokuapp.com/roles",{
                user_id:val.user_id,
                role:form.newRole,
                city:form.newCity,
                loc:form.newLoc
            });
        } catch {
            setError("Error Updating the details");
        }
    };

    return ( 
        <div className="container">
            <h3 className="page-header">Role Management</h3>
            {/* Displaying the users and their roles */}
            <div className="card">
                <div className="card-body">
                    <form>
                        <table className="table table-primary table-hover">
                            <thead>
                                <tr>
                                    <th>Email</th>
                                    <th>City</th>
                                    <th>Location</th>
                                    <th>Role</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            {error && <div className="alert alert-danger">{error}</div>}
                                {
                                    roleList.map((val,key) => {
                                        return (
                                            <tbody key={key}>
                                                
                                                {/* Adding an Editable Row and a condition to display the editable row */
                                                    editRoleId === val.id ? (
                                                    <tr>
                                                        <td><input type="text" value={val.email} disabled /></td>
                                                        <td><input type="text" value={val.city} disabled onChange={(event) => {
                                                            setFormData({...formData,newCity:event.target.value});
                                                        }} /></td>
                                                        <td><input type="text" value={val.loc} disabled onChange={(event) => {
                                                            setFormData({...formData,newLoc:event.target.value});
                                                        }} /></td>
                                                        <td>
                                                            <select className="form-control form-select" onChange={(event) => {
                                                                setFormData({...formData,newRole:event.target.value});
                                                            }}>
                                                                <option value="None">None</option>
                                                                <option value="Admin">Admin</option>
                                                                <option value="HQ-Manager">HQ Manager</option>
                                                                <option value="Store-Manager">Store Manager</option>
                                                            </select>
                                                        </td>
                                                        <td>
                                                            <button className="btn btn-success" type="button" onClick={(event) => {
                                                                edit(event,formData,val)
                                                            }}>Save</button>
                                                            <button className="btn btn-danger" type="button" onClick={() => {
                                                                setRoleId(null);
                                                            }} style={{
                                                                marginLeft:"5px"
                                                            }}>Cancel</button>
                                                        </td>
                                                    </tr> ): (
                                                    <tr>
                                                        <td>{val.email}</td>
                                                        <td>{val.city}</td>
                                                        <td>{val.location}</td>
                                                        <td>{val.role}</td>
                                                        <td><button className="btn btn-primary" type="button" onClick={(event) =>editId(event,val)}>Edit</button></td>
                                                    </tr>
                                                  )
                                                }
                                                
                                            </tbody>
                                        );
                                    })
                                }
                        </table>
                    </form>
                </div>
            </div>
            
            <a href="/addUser" className="btn btn-primary" style={{
                marginTop:"10px"
            }}>Add User</a>
        </div> 
    );
}
 
export default Roles;