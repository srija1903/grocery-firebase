import { Route } from 'react-router-dom';
import { Switch } from 'react-router-dom';
import { BrowserRouter } from 'react-router-dom';
import AddUser from './AddUser';
import './App.css';
import Forgot from './Forgot';
import Home from './Home';
import Dashboard from './Dashboard';
import Item from './Item';
import Login from './Login';
import Roles from './Roles';
import Sidebar from './SideBar';
import StoreHistory from './StoreHistory';
import OrderHistory from './ViewAll_HQ_OrderHistory';

function App() {
  return (
      <BrowserRouter>
        <div className='App'>
          <Switch>
            <Route exact path="/">
              <div className='container d-flex justify-content-center align-items-center' style={{ minHeight:"100vh", maxWidth:"400px"}}>
                <Login/>
              </div>
            </Route>

            <div className='actions'>
              
              <Route path="/dashboard">
                <Sidebar/>
                <Dashboard/>
              </Route>
              
              <Route path="/home">
                <Sidebar/>
                <Home/>
              </Route>

              <Route path="/roles">
                <Sidebar/>
                <Roles/>
              </Route>

              <Route path="/addUser">
                <Sidebar/>
                <div className='container d-flex justify-content-center align-items-center' style={{ minHeight:"100vh", maxWidth:"400px"}}>
                  <AddUser/>
                </div>
              </Route>

              <Route path="/forgot">
                <div className='container d-flex justify-content-center align-items-center' style={{ minHeight:"100vh", maxWidth:"400px"}}>
                  <Forgot/>
                </div>
              </Route>

              <Route path="/history">
                <Sidebar/>
                <OrderHistory/>
              </Route>

              <Route path="/item">
                <Sidebar/>
                <Item/>
              </Route>

              <Route path="/store_history">
                <Sidebar/>
                <StoreHistory/>
              </Route>
            </div>
          </Switch>
      </div>
      </BrowserRouter>
  );
}
export default App;
