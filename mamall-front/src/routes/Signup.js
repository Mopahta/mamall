import { useState } from "react";
import { useNavigate } from "react-router-dom";
import * as config from "../config/config"
import * as valid from "../common/validation";

function Signup({user, setUser}) {
    const [errors, setErrors] = useState('')

    const navigate = useNavigate()

    if (user.auth) {
        navigate("/")
    }

    const formSubmit = async (event) => {
        event.preventDefault();
        setErrors('')

        const data = new FormData(event.target)

        if (document.getElementById("username").value === "" || !valid.validateUsername(document.getElementById("username").value)) {
            document.getElementById("error-username").style.display="inline";
            return;
        }
        if (document.getElementById("password").value === "" || !valid.validatePassword(document.getElementById("password").value)) {
            document.getElementById("error-password").style.display="inline";
            return;
        }
        document.getElementById("error-username").style.display="none";
        document.getElementById("error-password").style.display="none";

        await fetch(`${config.host}/signup`, { 
            method: 'POST',
            body: data,
            credentials: 'include'
        })
        .then(res => {
            if (res.status === 200) {
                console.log("sign up successfull");
            }
            else {
                return res.json();
            }
        })
        .then(data => {
            if (data) {
                console.log(data);
            }
        })
        .catch(err => {
            if (err.response) {
                if (err.response.status === 401) {
                    setErrors("Invalid credentials.")
                }
                else {
                    setErrors("Please, try again.")
                }
            }
            console.log(err)
        })
        navigate("/")
    }

    return (
    <div className="ui vertically padded centered grid">
        <div className="eight wide computer sixteen wide tablet column">
            <div className="ui segment">
                <h1>Sign Up</h1>

                <form className="ui form" method="post" encType="multipart/form-data" onSubmit={formSubmit}>
                    <div className="field">
                        <label>Username (required)</label>
                        <input type="text" id="username" name="username" placeholder="Username" />
                        <div id="error-username" className="ui pointing red basic label" style={{display: "none"}}>
                        Username can contain only latin symbols, numbers and underscores
                        </div>
                    </div>

                    <div className="field">
                        <label>Email</label>
                        <input type="email" id="email" name="email" placeholder="mail@email.com" />
                    </div>

                    <div className="field">
                        <label>Password (required)</label>
                        <input type="password" id="password" name="password" placeholder="Password" />
                        <div id="error-password" className="ui pointing red basic label" style={{display: "none"}}>
                        Password must not contain whitespaces and must be at least 8 symbols long
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

export default Signup;
