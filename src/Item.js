import "bootstrap/dist/css/bootstrap.min.css";
import { onAuthStateChanged } from "firebase/auth";
import { addDoc, collection, getDocs } from "firebase/firestore";
import { useEffect, useState } from "react";
import { db } from "./Firebase-Config";
import { auth } from "./Users-Config";
import { Logout } from "./Auth";

const Item = () => {
    const [skuid,setSkuid] = useState('');
    const [productName,setName] = useState('')
    const [origin,setOrigin] = useState('');
    const [uom,setUom] = useState('');
    const [itemList,setItemList]= useState([]);
    const [orderList,setOrderList] = useState([]);
    const [searchId,setId] = useState('');
    const [searchName,setProductName] = useState('');
    const itemCollectionRef = collection(db,"Item");
    const orderCollectionRef= collection(db,"StoreOrders");
    const [city,setCity] = useState("");
    const [loc,setLoc] = useState("");
    let arr =[];

    //to check if the user is logged in or not and the role of the logged in user
    useEffect(() => {
        onAuthStateChanged(auth,(user) => {
            if(!user){
                window.location.href="/";
            }
            user.getIdTokenResult().then((idTokenResult) => {
                if(idTokenResult.claims.role === "HQ-Manager"){
                    window.location.href ="/dashboard";
                }
                setCity(idTokenResult.claims.city);
                setLoc(idTokenResult.claims.location);
            });
        })
    },[]);

    //fetching the details of all the items
    const getItems = async () => {
        const data = await getDocs(itemCollectionRef);
        setItemList(data.docs.map((doc) => ({
            ...doc.data(),
            select:false,
            id:doc.id,
            CurrInvQty:0,
            NewOrdQty:0
        })));
    }

    //fetching all the store orders
    const getOrders = async () => {
        const data = await getDocs(orderCollectionRef);
        setOrderList(data.docs.map((doc) => {
            if(doc._document.data.value.mapValue.fields.loc===loc && doc._document.data.value.mapValue.fields.Date=== new Date().toDateString());{
            return ({...doc.data(),
                select:false,
                id:doc.id } 
                )}
        }));
    }
    
    const getTodaysName = async()=>{
        orderList.forEach((d)=>{
            if(d.Date===new Date().toDateString() && !arr.includes(d.ProductName)){
                arr.push(d.ProductName);
            }
        });
    }

    //displaying all the items
    useEffect(() => {
        getItems();
        getOrders();
        getTodaysName();
    },[]);

    itemList.map((d) => {
        return {
            select:false,
            id:d.id,
            skuid:d.skuid,
            ProductName:d.ProductName,
            Origin:d.Origin,
            UnitOfMeasure:d.UnitOfMeasure,
            CurrInvQty:d.CurrInvQty,
            NewOrdQty:d.NewOrdQty,
            Date:d.Date,
            Status:d.Status
        };
    });

    //adding items using a form
    const addItem = () => {
        const data = addDoc(itemCollectionRef,{
            skuid:skuid,
            ProductName:productName,
            UnitOfMeasure:uom,
            Origin:origin
        });
        getItems();
    };
    
    //updating the current and new order quantity
    const updateItem = () => {
        let arrayIds = [];
        let arrayCurr = [];
        let arrayNew = [];
        let array = []; //new array where all the updated details will be added

        itemList.forEach((d) => {
            if(d.select && d.status!=="Not Submitted ") {
            let obj = {};
            obj.id = d.id;
            arrayIds.push(d.id);
            arrayCurr.push(d.CurrInvQty);
            arrayNew.push(d.NewOrdQty);
            obj.CurrInvQty = d.CurrInvQty;
            obj.NewOrdQty = d.NewOrdQty;
            array.push(JSON.stringify(obj));
            }
        });

        let array2 = arrayCurr.slice(",");//has all the current order quantity
        let array3 = arrayNew.slice(",");//has all the new order quantity details

        if(array2.length === 0 || array3.length === 0 ) {
            window.alert("Please Fill the details");
        } else{
           /*  for (let i = 0; i < array1.length; i++) {
                const newField = {CurrInvQty:array2[i], NewOrdQty:array3[i],Date: today.split("G")[0],status:"not submitted "};
                const newOrder = doc(db,"Items",array1[i]);
                updateDoc(newOrder,newField);
            } */
            itemList.map((s)=>{
                if(s.select){
                const data = addDoc(orderCollectionRef,{
                    Date: new Date().toDateString(),
                    skuid:s.skuid,
                    status:"Not Submitted by City Manager",
                    ProductName:s.ProductName,
                    Origin:s.Origin,
                    CurrInvQty:s.CurrInvQty,
                    NewOrdQty:s.NewOrdQty,
                    city:city,
                    loc:loc,
                    SubDate:""
                });
            }
            })
            const list = itemList.map((d) => {
                d.select = false;
                d.checked = false;
                return d;
            });
            setItemList(list);
            getItems();
            getOrders();
        }

    };

    //logout function
    const logout = async() => {
        await Logout();
        window.location.href="/";
    }

    return ( 
        <div className="container-fluid">
            <h2 className="page-header">Store Order Form</h2>

            <span className="bg-success text-white" id="update"></span>

            <form className='form row'>
                <div className='col col-sm-4'>

                    <input className='form-control' type="search" placeholder='Search By SKUID' onChange={(event) =>{
                        setId(event.target.value);
                    }}/><br/>

                    <input className='form-control' type="search" placeholder='Search By PRODUCT NAME' onChange={(event) =>{
                        setProductName(event.target.value);
                    }}/>
                </div>
            </form><br/>

            <table className="table table-secondary table-hover" style={{
                overflowY:"auto"
            }}>
                <thead>
                    <tr>
                            <th><input type="checkbox" onChange={(event) => {
                                    
                                    let checked = event.target.checked;
                                    setItemList(itemList.map((d)=>{
                                        d.select = checked;
                                        return d;
                                    }));
                                }} /></th>
                                <th>SKUID</th>
                                <th>Product Name</th>
                                <th>Origin</th>
                                <th>Unit Of Measure</th>
                                <th>Current Inventory Quantity</th>
                                <th>New Order Quantity</th>
                    </tr>
                </thead>
                {
                    itemList.filter((val) => {
                        if(searchId === '' && searchName === '') 
                            return val;
                        else if(val.skuid.toLowerCase().includes(searchId.toLowerCase())){
                            return val;
                        }
                    }).filter((val) => {
                        if(val.ProductName.toLowerCase().includes(searchName.toLowerCase())) {
                            return val;
                        }
                    }).filter((d)=>{
                        getTodaysName();
                       if(!arr.includes(d.ProductName)){
                          return d; 
                       }
                    }).sort((a,b) => (
                        a.ProductName > b.ProductName ? 1 : -1
                    )).map((val,key) => {
                        return(
                            <tbody key={key}>
                                <tr>
                                    <td><input type="checkbox" onChange={(event) => {
                                        let checked = event.target.checked;
                                        setItemList(itemList.map((data) => {
                                            if(val.id === data.id){
                                                data.select = checked;
                                            }
                                            return data;
                                        }));
                                    }} checked={val.select}/></td>
                                    <td>{val.skuid}</td>
                                    <td>{val.ProductName}</td>
                                    <td>{val.Origin}</td>
                                    <td>{val.UnitOfMeasure}</td>
                                    <td>
                                        <input type="number" value={val.CurrInvQty} required onChange={(event) => {

                                        let od = event.target.value;
                                        var list4 =  itemList.map((d) => {

                                            if(d.id ===val.id){ 
                                                d.CurrInvQty = od;
                                            }
                                            return d;
                                            
                                        });
                                            setItemList(list4);
                                        }} disabled={!val.select}/>
                                    </td>
                                    
                                    <td>
                                        <input type="number" value={val.NewOrdQty}  required onChange={(event) => {

                                        let od = event.target.value;
                                        var list4 =  itemList.map((d) => {

                                            if(d.id ===val.id){ 
                                                d.NewOrdQty = od;
                                            }
                                            return d;
                                            
                                        });
                                            setItemList(list4);
                                        }} disabled={!val.select} />
                                    </td>
                                </tr>
                            </tbody>
                        );
                    })
                }
            </table>

            <button className="btn btn-primary" onClick={updateItem}>Submit</button>
            <button className="btn btn-primary" style={{marginLeft:"25px"}} data-bs-toggle="modal" data-bs-target="#addItem">Add Item</button>
            <button className="btn btn-primary" onClick={logout} style={{marginLeft:"25px"}}>Logout</button>

            {/*Modal to add items to the database */}

            <div class="modal fade" id="addItem" tabindex="-1" role="dialog" aria-labelledby="modelTitleId" aria-hidden="true">
                <div class="modal-dialog" role="document">
                    <div class="modal-content">
                            <div class="modal-header">
                                    <h5 class="modal-title">Add Item Form</h5>
                                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                                </div>
                        <div class="modal-body">
                            <div class="container-fluid">
                                <form className="form">
                                    <div className="input-group mb-3">
                                        <span className="input-group-text">SKUID</span>
                                        <input type="text" className="form-control" placeholder="Enter SKUID" onChange={(event) => {
                                            setSkuid(event.target.value);
                                        } }/>
                                    </div>

                                    <div className="input-group mb-3">
                                        <span className="input-group-text">Product Name</span>
                                        <input type="text" className="form-control" placeholder="Enter Product Name" onChange={(event) => {
                                            setName(event.target.value);
                                        }}/>
                                    </div>

                                    <div className="input-group mb-3">
                                        <span className="input-group-text">Origin</span>
                                        <input type="text" className="form-control" placeholder="Enter Origin"  onChange={(event) => {
                                            setOrigin(event.target.value);
                                        }}/>
                                    </div>

                                    <div className="input-group mb-3">
                                        <span className="input-group-text">Unit Of Measure</span>
                                        <input type="text" className="form-control" placeholder="Enter Unit Of Measure"  onChange={(event) => {
                                            setUom(event.target.value);
                                        }}/>
                                    </div>
                                    
                                </form>
                            </div>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                            <button type="button" class="btn btn-primary" onClick={addItem}>Add Item</button>
                        </div>
                    </div>
                </div>
            </div><br/><br/>

            {/* showing today's orders */}
            <table className="table table-hover table-secondary">
                <thead>
                    <tr>
                        <th>SKUID</th>
                        <th>Product Name</th>
                        <th>Origin</th>
                        <th>Current Inventory Quantity</th>
                        <th>New Order Quantity</th>
                    </tr>
                </thead>
            {
                orderList.filter((val) => {
                    if(searchName === '' && searchId === '') {
                        return val;
                    } else if(val.productName.toLowerCase().includes(searchName.toLowerCase())) {
                        return val;
                    }
                }).filter((val)=>{
                    return(val.loc===loc && val.Date === new Date().toDateString());
                }).map((val)=>{
                    return(
                        <tbody>
                            <tr>
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
        </div> 
    );
}
 
export default Item;