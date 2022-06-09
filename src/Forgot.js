import { useState } from 'react';
import { resetPwd } from './Auth';
import 'bootstrap/dist/css/bootstrap.min.css';

const Forgot = () => {

    const [email,setEmail] = useState('');
    const [msg,setMsg] = useState('');
    const [error,setError] = useState('');

    const forgotPwd = async() => {
        try {
            setMsg('Check Your Inbox for further instructions');
            setError("");
            await resetPwd(email);
        } catch{
            setMsg('');
            setError("Failed to send Email");
        }
    };

    return ( 
        <div className='container'>
            <div className='card'>
                <div className='card-body'>
                    <h2 className='page-header'>Password Reset</h2>

                    { error && <div className='alert alert-danger'>{error}</div>}
                    { msg && <div className='alert alert-success'>{msg}</div> }

                    <form className='form row' onSubmit={forgotPwd}>
                        <div className='input-group mb-3'>
                            <label className='input-group-text'>Email</label>
                            <input className='form-control' type="email" placeholder="Enter Registered Email" onChange={(event) => {
                                setEmail(event.target.value);
                            }}/>
                        </div>

                        <button className='btn btn-primary'>Send Email</button>
                    </form>
                </div>
            </div>

            <div className='w-100 text-center mt-2'>
                <p><a href='/' className='link-primary'>Click Here to Login</a></p>
            </div>
        </div> 
    );
}
 
export default Forgot;