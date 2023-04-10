import { useState } from "react";
import { useNavigate } from "react-router-dom";
import * as config from "../config/config"

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
        console.log(data)

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
        .then(res => res.json())
        .then(data => {
            setUser({auth: true, user_id: data.user_id, name: data.username});
            navigate("/");
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
        <div className="eight wide computer sixteen wide tablet column">
            <div className="ui segment">
                <h1>Log In</h1>

                <form className="ui form" method="post" encType="multipart/form-data" onSubmit={formSubmit}>
                    <div className="field">
                        <label>Username</label>
                        <input type="text" id="username" name="username" placeholder="Username" />
                        <div id="error-username" className="ui pointing red basic label" style={{display: "none"}}>
                        Please enter a value
                        </div>
                    </div>

                    <div className="field">
                        <label>Password</label>
                        <input type="password" id="password" name="password" placeholder="Password" />
                        <div id="error-password" className="ui pointing red basic label" style={{display: "none"}}>
                        Please enter a value
                        </div>
                    </div>

                    <button className="ui button" type="submit">Submit</button>
                    <p>{errors}</p>
                </form>
            </div>
        </div>
    </div>
    )
}

export default Login;