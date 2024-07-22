import { useState } from "react";
import {Link, useNavigate} from "react-router-dom";
import * as config from "../config/config"
import '../style/Login.css';

function Login({user, setUser}) {
    const [errors, setErrors] = useState('')

    const navigate = useNavigate()

    if (user.auth) {
        navigate("/")
    }

    const formSubmit = async (event) => {
        event.preventDefault();
        setErrors('')

        const data = new FormData(event.target)

        if (document.getElementById("username").value === "") {
            document.getElementById("error-username").style.display="inline";
            return;
        }
        if (document.getElementById("password").value === "") {
            document.getElementById("error-password").style.display="inline";
            return;
        }
        document.getElementById("error-username").style.display="none";
        document.getElementById("error-password").style.display="none";

        await fetch(`${config.host}/login`, { 
            method: 'POST',
            body: data,
            credentials: 'include'
        })
        .then(res => {
            if (res.status === 401) {
                console.log("401");
            }
            else {
                return res.json();
            }
        })
        .then(data => {
            if (data) {
                setUser({auth: true, user_id: data.user_id, name: data.username, icon_path: data.icon_path});
                navigate("/");
            }
        })
        .catch(err => {
            if (err.response) {
                if (err.response.status === 401) {
                    setErrors("Invalid credentials.");
                }
                else {
                    setErrors("Please, try again.");
                }
            }
            console.log(err);
        })
    }

    return (
        <div className="ui vertically padded centered grid">
            <div className="four wide computer sixteen wide tablet column">
                <div className="ui segment" id="left-segment">
                    <h1>LOGIN</h1>

                    <form className="ui form" method="post" encType="multipart/form-data" onSubmit={formSubmit}>
                        <div className="field login-input">
                            <label>Username</label>
                            <input type="text" id="username" name="username" placeholder="Username"/>
                            <div id="error-username" className="ui pointing red basic label" style={{display: "none"}}>
                                Please enter a value
                            </div>
                        </div>

                        <div className="field login-input">
                            <label>Password</label>
                            <input type="password" id="password" name="password" placeholder="Password"/>
                            <div id="error-password" className="ui pointing red basic label" style={{display: "none"}}>
                                Please enter a value
                            </div>
                        </div>

                        <button className="ui button auth-action" type="submit">Sign In</button>
                        <p>{errors}</p>
                    </form>
                </div>
            </div>
            <div className="four wide computer sixteen wide tablet column">
                <div className="ui segment" id="right-segment">
                    <h1>New Here?</h1>
                    <Link className="ui button auth-action2" to="/signup">Sign Up!</Link>
                </div>
            </div>
        </div>
    )
}

export default Login;
