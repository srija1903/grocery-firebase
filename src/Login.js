import { browserSessionPersistence, setPersistence } from 'firebase/auth';
import { useState } from 'react';
import { useHistory } from 'react-router-dom';
import './App.css';
import { login } from './Auth';
import 'bootstrap/dist/css/bootstrap.min.css';
import { auth } from './Users-Config';

const Login = () => {
    const [form,setForm] = useState({
        email:'',
        password:''
    });
    const [error,setError] = useState("");
    const history = useHistory();

    const handleSubmit = async(e) => {
        e.preventDefault();
       try {
            setError("");
            await setPersistence(auth,browserSessionPersistence).then(() => {
                login(form);
            });
            await login(form);
            history.push("/dashboard");
       } catch {
           setError("Failed to Login");
       }
    };

    return ( 
        <div className='container'>
            <div className='card'>
                <div className='card-body'>
                    <h2 className='page-header'>Login</h2>

                    {error && <div className='alert alert-danger'>{error}</div>}

                    <form className='form row' onSubmit={handleSubmit}>

                        <div className='input-group mb-3' id="email">
                            <label className='input-group-text'>Email</label>
                            <input className = 'form-control' placeholder='Enter Email' type="email" onChange={(event) => {
                                setForm({...form,email:event.target.value})
                            }}/>
                        </div>

                        <div className='input-group mb-3' id="pwd">
                            <label className='input-group-text'>Password</label>
                            <input className='form-control' placeholder='Enter Password' type="password" onChange={(event) => {
                                setForm({...form,password:event.target.value})
                            }}/>
                        </div>

                        <button className='btn btn-primary'>Login</button>
                    </form>

                </div>
            </div>
            <div className='w-100 text-center mt-2'>
                <p><a href='/forgot' className='link-primary'>Forgot Password?</a></p>
            </div>
        </div> 
    );
}
 
export default Login;