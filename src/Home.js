import { useEffect, useState } from "react";
import {collection, doc, getDocs, Timestamp, updateDoc} from 'firebase/firestore';
import { db } from "./Firebase-Config";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Logout } from "./Auth";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./Users-Config";

const Home = () => {
    const [orderList,setOrderList] = useState([]);
    const [searchId,setId] = useState('');
    const [searchProduct,setProduct] = useState('');
    // const [date,setDate] = useState('');
    // const [skuid,setSkuid] = useState('');
    // const [orderid,setOrderid] = useState('');
    // const [productName,setProductName] = useState('');
    // const [origin,setOrigin] = useState('');
    // const [price,setPrice] = useState('');
    // const [store1,setStore1] = useState(0);
    // const [store2,setStore2] = useState(0);
    // const [store3,setStore3] = useState(0);
    const [city,setCity] = useState("");

    const orderCollectionRef = collection(db,"StoreOrders");
    
    //to check if the user is logged in or not
     useEffect(() => {
        onAuthStateChanged(auth,(user) => {
            if(!user){
                window.location.href="/";
            }
            user.getIdTokenResult().then((idTokenResult) => {
                if(idTokenResult.claims.role === "Store-Manager"){
                    window.location.href ="/dashboard";
                }
                setCity(idTokenResult.claims.city);
            });
        })
    },[]);

    const getOrders = async () => {
        const data = await getDocs(orderCollectionRef);
        setOrderList(data.docs.map((doc) => ({
            ...doc.data(),
            id:doc.id,
            select:false
        })));
    }

    useEffect(() => {
        getOrders();
    },[]);
    //saving the selected checkboxes as a pdf
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
            if(d.select){
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
    };
    //Add an Order
    // const addOrder = () => {
    //     const data = addDoc(orderCollectionRef,{
    //         Date:new Date(date).toDateString(),
    //         skuid:skuid,
    //         orderid:orderid,
    //         productName:productName,
    //         origin:origin,
    //         price:price,
    //         store1order:store1,
    //         store2order:store2,
    //         store3order:store3,
    //         status:"Not Submitted by HQ",
    //         subdate:""
    //     });
    //     getOrders();
    // };

    orderList.map((d) => {
        return {
            select:false,
            id:d.id,
            skuid:d.skuid,
            orderid:d.orderid,
            productName:d.productName,
            origin:d.origin,
            price:d.price,
            store1order:d.store1order,
            store2order:d.store2order,
            store3order:d.store3order,
            buyerOrder:d.buyerOrder,
            status:d.status
        };
    });

    //deleting multiple orders using a checkbox
    // const deleteOrder = () => {
    //     let arrayIds = [];
    //     orderList.forEach(d => {
    //         if(d.select) {
    //             arrayIds.push(d.id);
    //         }
    //     });
    //     const array = arrayIds.slice("/");
    //     array.forEach(element => {
    //         const order = doc(db,"orders",element);
    //         deleteDoc(order);
    //     });
    // }

    //updating multiple buyerOrder values using a checkbox
    const updateOrder = () => {
            let arrayIds = [];
            let arrayOds = [];
            let array = [];

            orderList.forEach(d => {
                if(d.select) {
                    d.status="Submitted by HQ"
                    d.subdate=Timestamp.now().toDate().toString().split("G")[0];
                    let obj = {};
                    obj.id = d.id;
                    
                    obj.buyerOrder = d.buyerOrder;
                    //pushing all the values that have been selected into seperate arrays
                    arrayIds.push(d.id);
                    arrayOds.push(d.buyerOrder);
                    array.push(JSON.stringify(obj));
                }
            });

            let array1 = arrayIds.slice(",");
            let array2 = arrayOds.slice(",");

            if(array2.length === 0) {
                window.alert("Please Enter Buyer Order");
            } else{

            for (let i = 0; i < array1.length; i++) {
                orderList.map((d) => {
                    if(d.id===array1[i]) {
                        const newOrder = doc(db,"StoreOrders",array1[i]);
                        updateDoc(newOrder,{buyerOrder:array2[i],
                                status:"Submitted by City Manager",
                                SubDate: new Date().toDateString()
                        });
                    }
                });

                document.getElementById("message").innerHTML="<br/>Submission Successful";
              
            }
            
            // const list = orderList.map((d) => {
            //     d.select = false;
            //     d.checked = false;
            //     return d;
            // });
            // setOrderList(list);
            orderList.map((d) => {
            
                return {
                    select:false,
                    id:d.id,
                    skuid:d.skuid,
                    
                    productName:d.ProductName,
                    origin:d.Origin,
                   
                    NewOrdQty:d.NewOrdQty,
                    buyerOrder:d.buyerOrder,
                    status:d.status,
                    SubDate: new Date().toDateString(),
                    
                };
            });
            getOrders();   
        }
    }
    //logout function
    const logout = async() => {
        await Logout();
        window.location.href="/";
    }
    return (  
        <div className="App container-fluid">
            <span id="message" className="bg-success text-white"></span>
            <h4>HQ BUYER FORM</h4>

            <form className='form row'>
                <div className='col col-sm-4'>

                    <input className='form-control' type="search" placeholder='Search By SKUID' onChange={(event) =>{
                        setId(event.target.value);
                    }}/><br/>

                    <input className='form-control' type="search" placeholder='Search By PRODUCT NAME' onChange={(event) =>{
                        setProduct(event.target.value);
                    }}/>
                </div>
            </form><br/>

                <table className="table table-secondary table-hover">
                    <thead>
                        <tr>
                            <th><input type="checkbox"  onChange={(event) => {
                                    
                                    let checked = event.target.checked;
                                    setOrderList(orderList.map((d)=>{
                                        d.select = checked;
                                        return d;
                                    }));
                                }} /></th>
                            <th>Date</th>
                            <th>SKUID</th>
                            <th>Product Name</th>
                            <th>Origin</th>
                            <th>Store Order</th>
                            <th>Buyer Order</th>
                            <th>Order Status</th>
                        </tr>
                    </thead>
                {
                    orderList.filter((val) => {
                        if(searchProduct === '' && searchId === '') {
                            return val;
                        } else if(val.productName.toLowerCase().includes(searchProduct.toLowerCase())) {
                            return val;
                        }
                    }).filter((val) => {
                        if(val.skuid.toLowerCase().includes(searchId.toLowerCase())) {
                            return val;
                        }
                    }).filter((val) => {
                        return ( val.city === city && val.status!=="Submitted by City Manager");
                    }).map((val,key) => {
                        return (
                           <tbody>
                               <tr key={key}>
                                    <td><input type="checkbox" onChange={(event) => {
                                        let checked = event.target.checked;
                                        setOrderList(orderList.map((data) => {
                                            if(val.id === data.id){
                                                data.select = checked;
                                            }
                                            return data;
                                        }));
                                    }} checked={val.select}/></td>
                                    <td>{val.Date}</td>
                                    <td>{val.skuid}</td>
                                    <td>{val.ProductName}</td>
                                    <td>{val.Origin}</td>
                                    <td>{val.NewOrdQty}</td>
                                    <td>
                                        <input type="number" value={val.buyerOrder} required onChange={(event) => {

                                            let od = event.target.value;
                                            var list4 =  orderList.map((d) => {
    
                                                if(d.id ===val.id){ 
                                                    d.buyerOrder = od;
                                                }
                                                return d;
                                                
                                            });
                                            setOrderList(list4);
                                        }} disabled={!val.select} />
                                    </td>
                                    <td className="fw-bold">{val.status + " " + val.SubDate}</td>
                               </tr>
                           </tbody>
                        );
                    })
                }
                </table>

                <button className="btn btn-primary" onClick={updateOrder}>Submit</button>
                <button className="btn btn-primary" style={{ marginLeft:"35px"}} onClick={generatePDF}>Save PDF</button>
                {/*<button className="btn btn-primary" style={{ marginLeft:"35px"}} onClick={deleteOrder}>Delete Order</button>*/}
                <button className="btn btn-primary" style={{ marginLeft:"35px"}} onClick={logout}>Logout</button>
        </div>
    );
}
 
export default Home;