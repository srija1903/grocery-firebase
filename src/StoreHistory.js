import 'bootstrap/dist/css/bootstrap.min.css';
import { onAuthStateChanged } from 'firebase/auth';
import { collection, getDocs, Timestamp } from 'firebase/firestore';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { useEffect, useState } from 'react';
import { db } from './Firebase-Config';
import { auth } from './Users-Config';

const StoreHistory = () => {
    
    const [itemList,setItemList] = useState([]);
    const [fromDate,setFromDate] = useState('');
    const [toDate, setToDate] = useState('');
    const [city,setCity] = useState("");
    const [loc,setLoc] = useState("");
    const [userRole,setRole] = useState("");
    const orderCollectionRef = collection(db,"StoreOrders");

    useEffect(() => {
        onAuthStateChanged(auth,(user) => {
            if(!user) {
                window.location.href="/";
            }
            user.getIdTokenResult().then((idTokenResult) => {
                if(idTokenResult.claims.role === "HQ-Manager"){
                    window.location.href ="/dashboard";
                }
                setRole(idTokenResult.claims.role);
                setCity(idTokenResult.claims.city);
                setLoc(idTokenResult.claims.location);
            });
        });
    },[]);

    //fetching the details of all the items
    const getOrders = async () => {
        const data = await getDocs(orderCollectionRef);
        setItemList(data.docs.map((doc) => ({
            ...doc.data(),
            id:doc.id
        })));
    }

    //displaying all the items
    useEffect(() => {
        getOrders();
    },[]);

    //saving records as pdf
    const generatePDF = () => {
        var columns = [
            { title: "SKUID", dataKey: "SKUID" },
            { title: "Product_Name", dataKey: "Product_Name"},
            { title: "Origin", dataKey: "Origin" },
            { title:"Unit_Of_Measure", dataKey:"Unit_Of_Measure"},
            { title: "Current_Inventory_Quantity", dataKey: "Current_Inventory_Quantity" },
            { title: "New_Order_Quantity", dataKey:"New_Order_Quantity"}
        ];

        var arrayg  = [];
        itemList.map((d) => {
            if(d.status === 'Not Submitted'){
                arrayg.push(d);
            }
        })

        var rows = arrayg.map((d)=>{
            return { SKUID: d.skuid, Product_Name:d.ProductName, Origin: d.Origin ,Unit_Of_Measure:d.UnitOfMeasure, Current_Inventory_Quantity:d.CurrInvQty,New_Order_Quantity:d.NewOrdQty };
        })
    
        var date = Timestamp.now().toDate().toDateString();
        var doc = new jsPDF('p', 'pt');
        doc.setFontSize(20);
        doc.setTextColor(40);
        doc.text("Items report", 10, 20);
        doc.text(`date: ${date}`, 10, 50);
        
        doc.autoTable(columns, rows, {
            startY: doc.autoTableEndPosY() + 70,
            margin: { horizontal: 10 },
            styles: { overflow: 'linebreak' },
            bodyStyles: { valign: 'center', halign: 'middle' },
            columnStyles: { email: { columnWidth: 'wrap' } },
            theme: "striped"
        });
        
        doc.save('history_report.pdf'); 
    };

    return ( 
        <div className='container-fluid'>
            <h2 className='page-header'>Store Order History</h2>

            <form className="form row">
                <div className="col col-sm-4">
                    <label className="fw-bold">From Date</label>
                    <input className="form-control" type="date" onChange={(event) => {
                        setFromDate(event.target.value);
                    }}/>
                </div>

                <div className="col col-sm-4">
                <label className="fw-bold">To Date</label>
                    <input className="form-control" type="date" onChange={(event) => {
                        setToDate(event.target.value);
                    }}/>
                </div>

                <div className='col col-sm-4'>
                    <label className='fw-bold'>Location</label>
                    <select className='form-control' value={loc} onChange={(event) => {
                        setLoc(event.target.value);
                    }}>
                        <option value="None">None</option>
                        {(userRole==="Admin")?(<option value="Kothrud">Kothrud</option>):null}
                        {(userRole==="Admin")?(<option value="Viman-Nagar">Viman Nagar</option>):null}
                        {(userRole==="Admin")?(<option value="Baner">Baner</option>):null}
                        {(userRole==="Admin")?(<option value="Malad">Malad</option>):null}
                        {(userRole==="Admin")?(<option value="Andheri">Andheri</option>):null}
                        {(userRole==="Admin")?(<option value="Thane">Thane</option>):null}
                        {(userRole==="Admin")?(<option value="Sector 1">Sector 1</option>):null}
                        {(userRole==="Admin")?(<option value="Sector 2">Sector 2</option>):null}
                        {(userRole==="Admin")?(<option value="Sector 3">Sector 3</option>):null}
                        
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

            </form><br/>

            <table className='table table-secondary table-hover'>
            <thead>
                <tr>
                    <th>Date</th>
                    <th>SKUID</th>
                    <th>Product Name</th>
                    <th>Origin</th>
                    <th>Current Inventory Quantity</th>
                    <th>New Order Quantity</th>
                </tr>
            </thead>
            {
                itemList.filter((val) => {
                    return ( val.loc === loc);
                }).filter((val) => {
                    if(fromDate === '' && toDate === '') {
                        return val;
                    } else {
                        var startDate = new Date(fromDate).toDateString().split(' ').slice(1).join(' ');
                        var endDate = new Date(toDate).toDateString().split(' ').slice(1).join(' ');
                        return ((val.Date.split(' ').slice(1).join(' ') >= startDate) && (val.Date.split(' ').slice(1).join(' ') <= endDate));
                    }
                }).sort((a,b) => 
                    (a.Date.split(' ').slice(1).join(' ') < b.Date.split(' ').slice(1).join(' ') ? 1 : -1)
                ).map((val,key) => {
                    return (
                        <tbody key={key}>
                            <tr>
                                <td>{val.Date}</td>
                                <td>{val.skuid}</td>
                                <td>{val.ProductName}</td>
                                <td>{val.Origin}</td>
                                <td>{val.CurrInvQty}</td>
                                <td>{val.NewOrdQty}</td>
                            </tr>
                        </tbody>
                    );
                })
            }
            </table>
            <button type="button" className="btn btn-primary" onClick={generatePDF}>Save PDF</button>
        </div> 
    );
}
 
export default StoreHistory;