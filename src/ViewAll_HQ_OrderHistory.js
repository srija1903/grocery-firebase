import { collection, getDocs, Timestamp } from "firebase/firestore";
import { useEffect, useState } from "react";
import 'bootstrap/dist/css/bootstrap.min.css';
import { db } from "./Firebase-Config";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./Users-Config";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const OrderHistory = () => {
    const [orderList,setOrderList] = useState([]);
    const [fromdate,setFromDate] = useState('');
    const [toDate,setToDate] = useState('');
    const [city,setCity] = useState("");
    const [userRole,setRole] = useState("");
    const orderCollectionRef = collection(db,"StoreOrders");

    useEffect(()=>{
        onAuthStateChanged(auth,(user) => {
            if(!user) {
                window.location.href="/";
            }
            user.getIdTokenResult().then((idTokenResult) => {
                if(idTokenResult.claims.role === "Store-Manager"){
                    window.location.href ="/dashboard";
                }
                setCity(idTokenResult.claims.city);
                setRole(idTokenResult.claims.role);
            });
        });
    },[]);

    const getOrders = async () => {
        const data = await getDocs(orderCollectionRef);
        setOrderList(data.docs.map((doc) => ({
            ...doc.data(),
            id:doc.id,
        })));
    }

    useEffect(()=>{
        getOrders();
    },[]);

    const generatePDF = () => {
        var columns = [
            { title: "Date", dataKey: "Date" },
            { title: "SKUID", dataKey: "SKUID" },
            { title: "Order_ID", dataKey: "Order_ID" },
            { title: "Product_Name", dataKey: "Product_Name"},
            { title: "Origin", dataKey: "Origin" },
            { title: "Price_$", dataKey: "Price_$" }
        ];

        var arrayg  = [];
        orderList.map((d) => {
            if(d.status === 'Submitted by HQ') {
                arrayg.push(d);
            }
        })

        var rows = arrayg.map((d)=>{
            return { Date: d.Date, SKUID: d.skuid, Order_ID : d.orderid , Product_Name:d.productName, Origin: d.origin,Price_$:d.price  };
        })
    
        
        var columns1 = [
    
            { title: "Store_1_Order", dataKey: "Store_1_Order" },
            { title: "Store_2_Order", dataKey: "Store_2_Order" },
            { title: "Store_3_Order", dataKey: "Store_3_Order" },
            { title: "Buyer_Order", dataKey: "Buyer_Order" },
            { title:"Total_Order",dataKey:"Total_Order"},
            { title: "Order_Status",dataKey:"Order_Status"}
        ]
        
        var rows1 =  arrayg.map((d)=>{
           
            return { Store_1_Order:d.store1order ,
                Store_2_Order:d.store2order , 
                Store_3_Order:d.store3order , 
                Buyer_Order:d.buyerOrder ,
                Total_Order:d.store1order+d.store2order+d.store3order,
                Order_Status:d.status + " "+d.subdate};
            })
            
        var date = Timestamp.now().toDate().toDateString();
        var doc = new jsPDF('p', 'pt');
        doc.setFontSize(20);
        doc.setTextColor(40);
        doc.text("Order report", 10, 20);
        doc.text(`date: ${date}`, 10, 50);
        
        doc.autoTable(columns, rows, {
            startY: doc.autoTableEndPosY() + 70,
            margin: { horizontal: 10 },
            styles: { overflow: 'linebreak' },
            bodyStyles: { valign: 'center', halign: 'middle' },
            columnStyles: { email: { columnWidth: 'wrap' } },
            theme: "striped"
        });
        
        doc.autoTable(columns1, rows1, {
            startY: doc.autoTableEndPosY() + 70,
            margin: { horizontal: 10 },
            styles: { overflow: 'linebreak' },
            bodyStyles: { valign: 'middle', halign: 'middle' },
            columnStyles: { email: { columnWidth: 'wrap' } },
            theme: "striped"
        }); 
        doc.save('report.pdf');
    }
    return ( 
        <div className="container-fluid" style={{
            marginTop:"40px"
        }}>
            <h3 className="page-header">Order History of all the Submitted Orders</h3>

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
                {userRole === "HQ-Manager" || userRole === "Admin"?(
                    <div className='col col-sm-4'>
                        
                        <label className='fw-bold'>Location</label>
                        <select className='form-control' value={city} onChange={(event) => {
                                setCity(event.target.value);
                        }}>
                            <option value="None">None</option>
                            <option value="Pune">Pune</option>
                            <option value="Mumbai">Mumbai</option>
                            <option value="Delhi">Delhi</option>
                        </select>
                    </div>
                ):null}
            </form><br/>

             <table className="table table-secondary table-hover">
                    <thead>
                        <tr>
                            <th>Date</th>
                            <th>SKUID</th>
                            <th>Product Name</th>
                            <th>Origin</th>
                            <th>Store Order</th>
                            <th>Buyer Order</th>
                            <th>Order Status</th>
                        </tr>
                    </thead>
            {/* Fetch all the submitted orders details */
                orderList.filter((val) => {
                    return ( val.city === city);
                }).filter((val) => {
                    return ( val.status === 'Submitted by City Manager');
                }).filter((val) => {
                    if(fromdate === '' && toDate === '') {
                        return val;
                    } else {
                        var startDate = new Date(fromdate).toDateString().split(' ').slice(1).join(' ');
                        var endDate = new Date(toDate).toDateString().split(' ').slice(1).join(' ');
                        return ((val.Date.split(' ').slice(1).join(' ') >= startDate) && (val.Date.split(' ').slice(1).join(' ') <= endDate));
                    }
                }).sort((a,b) => 
                    (a.Date.split(' ').slice(1).join(' ') < b.Date.split(' ').slice(1).join(' ') ? 1 : -1)
                ).map((val,key) => {
                    return (
                        <tbody>
                               <tr key={key}>
                                    <td>{val.Date}</td>
                                    <td>{val.skuid}</td>
                                    <td>{val.ProductName}</td>
                                    <td>{val.Origin}</td>
                                    <td>{val.NewOrdQty}</td>
                                    <td>{val.buyerOrder}</td>
                                    <td className="fw-bold">{val.status +" " + val.SubDate}</td>
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
 
export default OrderHistory;