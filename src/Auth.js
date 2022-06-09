import {auth} from './Users-Config';
import 'firebase/auth';
import { sendPasswordResetEmail, signInWithEmailAndPassword, signOut} from 'firebase/auth';

export const login = async({email,password}) => {
    const res = await signInWithEmailAndPassword(auth,email,password);
    return res.user;
}
export const resetPwd = (email) => {
    return sendPasswordResetEmail(auth,email);
}
export const Logout = async () => {
    signOut(auth);
}