import 'bootstrap/dist/css/bootstrap.min.css';
import { onAuthStateChanged } from 'firebase/auth';
import { useEffect, useState } from 'react';
import { Logout } from './Auth';
import { auth } from './Users-Config';
import NavBar from "bootstrap";

const Sidebar = () => {
    const logout = async() => {
        await Logout();
        window.location.href="/";
    }

    const [user,setUser] = useState('');
    const [userRole,setRole] = useState("None");
    const [city,setCity] = useState("");
    const [loc,setLocation] = useState("");

    useEffect(() => {
      onAuthStateChanged(auth,(user)=> {
        
        setUser(user);

        user.getIdTokenResult().then(idTokenResult => {
          setRole(idTokenResult.claims.role);
          setCity(idTokenResult.claims.city);
          setLocation(idTokenResult.claims.location);
        });
      });
    },[]);

    return ( 
        <div>
           {
            user && <p className='lead' style={{
             float:"right",
             marginRight:"10px"
            }}>UserID: {user.email}<br/>User Role: {userRole}
              {(city === "" || city === "None")?null:(<p>City:{city}</p>)}
              {(loc === "None"|| loc === "")?null:(<p>Location:{loc}</p>)}
            </p>
           }

            <nav className="navbar navbar-light bg-white bg-gradient">

              <div className="container-fluid">
                <button className="navbar-toggler" type="button" data-bs-toggle="offcanvas" data-bs-target="#offcanvasNavbar" aria-controls="offcanvasNavbar">
                  <span className="navbar-toggler-icon"></span>
                </button>

                <div className="offcanvas offcanvas-start" tabindex="-1" id="offcanvasNavbar" aria-labelledby="offcanvasNavbarLabel">

                  <div className="offcanvas-header">
                    <button type="button" class="btn-close text-reset" data-bs-dismiss="offcanvas" aria-label="Close"></button>
                  </div>

                  <div className="offcanvas-body">
                    <ul className="navbar-nav justify-content-end flex-grow-1 pe-3">
                      
                      <li>
                        <a className='nav-link' href='/dashboard'>Home Page</a>
                      </li>
                      {
                        userRole === "Admin" ? (
                        <li>
                          <a className='nav-link' href='/roles'>Role Management</a>
                        </li>
                        ):true
                      }

                      {
                        userRole !== "HQ-Manager" ? (
                          <li className='nav-item'>
                            <a className='nav-link' href='/item'>Store Order Form</a>
                          </li>
                        ) :true
                      }

                      {
                        userRole !== "HQ-Manager" ? (
                          <li className='nav-item'>
                            <a className='nav-link' href='/store_history'>Store Order History</a>
                          </li>
                        ):true
                      }

                      {
                        userRole !== "Store-Manager" ? (
                          <li className="nav-item">
                            <a className="nav-link" aria-current="page" href="/home">HQ Buyer Form</a>
                          </li>
                        ):true
                      }
                      {
                        userRole !== "Store-Manager"? (
                          <li className="nav-item">
                            <a className="nav-link" href="/history">HQ Order History</a>
                          </li>
                          ):true
                      }
                      
                      <hr/>
                      
                      <li className="nav-link" onClick={logout} style={{
                        cursor:"pointer"
                      }}>Logout</li>
                    </ul>
                    
                  </div>
                </div>
              </div>
            </nav>
        </div>
     );
}
 
export default Sidebar;