import 'bootstrap/dist/css/bootstrap.min.css';
import { onAuthStateChanged } from 'firebase/auth';
import { useEffect, useState} from 'react';
import { auth } from './Users-Config';

const Dashboard = () => {

    const [userRole,setRole] = useState("None");

    useEffect(()=>{
        onAuthStateChanged(auth,(user) => {
            if(!user) {
                window.location.href="/";
            }  
            user.getIdTokenResult().then(idTokenResult => {
                setRole(idTokenResult.claims.role);
            });
        });
    },[]);
    
    return ( 
    <div className="container" style={{
        marginTop:"150px"
    }}>
            <h1 className="page-header">Dashboard</h1>
            
            <div className='card'>
                <div className='card-body'>
                        <table className='table table-primary table-sm table-hover'>
                        <thead>
                            <tr>
                                <th>Home Page</th>
                            </tr>
                        </thead>

                        <tbody>
                            {userRole === "Admin" ? (
                                <tr>
                                    <td><a href='/roles' className='btn btn-default'>Role Management</a></td>
                                </tr>
                            ):true 
                            }
                            
                            {
                                userRole !== "HQ-Manager"?(
                                    <tr>
                                        <td><a href="/item" className='btn btn-default'>Store Order Form</a></td>
                                    </tr>
                                ):true
                            }

                            {
                                userRole !== "HQ-Manager" ? (
                                    <tr>
                                        <td><a href='/store_history' className='btn btn-default'>Store Order History</a></td>
                                    </tr>
                                ) :true
                            }
                            {
                                userRole !== "Store-Manager"  ? (     
                                    <tr>
                                        <td><a href="/home" className="btn btn-default"> HQ Buyer Form</a></td>
                                    </tr>
                                ) : true
                            }

                            {
                                userRole !== "Store-Manager" ? (
                                    <tr>
                                    <td><a href="/history" className="btn btn-default">HQ Order History</a></td>
                                    </tr>
                                ):true
                            }
                        </tbody>
                    </table>
                </div>
            </div>
            
    </div> );
}
 
export default Dashboard;