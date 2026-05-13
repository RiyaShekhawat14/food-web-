import React, { useContext, useState } from "react";
import "./LoginPopup.css";
import { assets } from "../../assets/assets";
import { StoreContext } from "../../Context/StoreContext";

const getFriendlyAuthError = (message, mode) => {
    if (message === "Email is already registered.") {
        return mode === "Sign up"
            ? "This email is already registered. Please log in instead."
            : message;
    }
    if (message === "Invalid email or password.") {
        return "That email/password combination is incorrect.";
    }
    return message || "Authentication failed.";
};

const LoginPopup = ({setShowLogin}) => {
    const { login, register } = useContext(StoreContext);
    const [currState,setCurrState]=useState("Sign up")
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: ""
    });
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");

    const handleChange = (event) => {
        const { name, value } = event.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setError("");
        setSubmitting(true);

        try {
            if (currState === "Sign up") {
                await register(formData);
            } else {
                await login({
                    email: formData.email,
                    password: formData.password
                });
            }
            setShowLogin(false);
        } catch (submitError) {
            const nextError = getFriendlyAuthError(submitError.message, currState);
            setError(nextError);
            if (submitError.message === "Email is already registered.") {
                setCurrState("Login");
            }
        } finally {
            setSubmitting(false);
        }
    };
  return (
    <div className="login-popup">
        <form onSubmit={handleSubmit} className="login-popoup-container">
            <div className="login-popup-title">
                <h2>{currState}</h2>
                <img onClick={()=>setShowLogin(false)} src={assets.cross_icon} alt=""/>

            </div>
            <div className="login-popup-inputs">
                {currState==="Login"? <></>:  <input name="name" value={formData.name} onChange={handleChange} type="text" placeholder='Enter your name' required={currState !== "Login"}/>}
                <input name="email" value={formData.email} onChange={handleChange} type="email" placeholder='Enter your email' required/>
                <input name="password" value={formData.password} onChange={handleChange} type="password" placeholder='Password' required/>
            </div>
            {error ? <p style={{color:"#b00020", fontSize:"14px"}}>{error}</p> : null}
            <button disabled={submitting}>{submitting ? "Please wait..." : currState==="Sign up"? "Create account":"Login"}</button>
            <div className="login-popup-condition">
                <input type="checkbox" required/>
                <p>By continuing, I agree to the terms of use & privacy policy</p>
            </div>
            {currState==="Login"
            ?<p>Create a new account? <span onClick={()=>{setError(""); setCurrState("Sign up")}}>Click here</span></p> 
            :<p>Already have an account?<span onClick={()=>{setError(""); setCurrState('Login')}}>Login here</span></p>
            }
            
        </form>

    </div>
  )
}

export default LoginPopup
