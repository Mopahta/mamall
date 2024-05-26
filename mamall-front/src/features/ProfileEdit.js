import { useState } from "react";
import {ModalContent, ModalHeader} from "semantic-ui-react";
import '../style/ProfileEdit.css';
import './null.jpg'
import noUserIcon from "./null.jpg";
import * as config from "../config/config";

function ProfileEdit({user, setUser, setProfileEditorIsOpen}) {
    const [errors, setErrors] = useState('')
    const [isChangingPassword, setisChangingPassword] = useState(false);

    const submitDataChange = async (event) => {
        event.preventDefault();
        setErrors('')

        const data = new FormData(event.target)

        if (document.getElementById("password").value === "") {
            document.getElementById("error-password").style.display="inline";
            return;
        }
        document.getElementById("error-password").style.display="none";

        let url = isChangingPassword ? `${config.host}/password` : `${config.host}/profile`

        await fetch(url, {
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
                    setUser({auth: true, user_id: data.user_id, name: data.username});
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

        setProfileEditorIsOpen(false);
    }

    const checkField = async (event) => {
        console.log(event)
    }

    const toggleChangePassword = async (event) => {
        if (isChangingPassword) {
            document.getElementById("edit-profile-header-change-password").classList.remove("active");
        } else {
            document.getElementById("edit-profile-header-change-password").classList.add("active");
        }

        setisChangingPassword((changingPassword) => !changingPassword);
    }

    return (
        <div>
            <ModalHeader className="edit-profile-header">
                <button className="ui toggle button" id="edit-profile-header-change-password" onClick={toggleChangePassword}>
                    Change password
                </button>
                <h1>Edit Profile</h1>
                <div className="ui basic icon button" id='profile-editor-exit'
                     onClick={() => setProfileEditorIsOpen(false)}>
                    <i className="x icon"/>
                </div>
            </ModalHeader>
            <ModalContent>
                {!isChangingPassword ?

                    <form className="ui form" method="post" id="edit-profile-form" encType="multipart/form-data"
                          onSubmit={submitDataChange}>
                        <div className="field edit-profile-avatar">
                            <img className="ui small rounded image" src={noUserIcon} alt="contact"></img>
                            <label className="ui button" htmlFor="file" type="button">Change photo</label>
                            <input type="file" id="file" accept="image/png, image/jpeg" onChange={() => {
                                console.log('11')
                            }}/>
                        </div>
                        <div className="field edit-profile-input">
                            <label>Username</label>
                            <input type="text" id="username" name="username" placeholder="Username"/>
                            <div id="error-username" className="ui pointing red basic label" style={{display: "none"}}>
                                Please enter a value
                            </div>
                        </div>

                        <div className="field edit-profile-input">
                            <label>Email</label>
                            <input type="email" id="email" name="email" placeholder="mail@email.com"/>
                        </div>

                        <div className="ui hidden divider"></div>

                        <div className="field edit-profile-input">
                            <label>Enter password to apply changes above</label>
                            <input type="password" id="password" name="password" placeholder="Password"
                                   onChange={checkField}/>
                            <div id="error-password" className="ui pointing red basic label" style={{display: "none"}}>
                                Please enter a value
                            </div>
                        </div>

                        <div className="ui hidden divider"></div>
                        <button className="ui button auth-action" type="submit">Save Changes</button>
                        <p>{errors}</p>
                    </form>
                    :
                    <form className="ui form" method="post" id="edit-profile-form" encType="multipart/form-data"
                          onSubmit={submitDataChange}>
                        <div className="field edit-profile-input">
                            <label>Enter current password</label>
                            <input type="password" id="password" name="password" placeholder="Password"
                                   onChange={checkField}/>
                            <div id="error-password" className="ui pointing red basic label" style={{display: "none"}}>
                                Please enter a value
                            </div>
                        </div>

                        <div className="field edit-profile-input">
                            <label>Enter new password</label>
                            <input type="password" id="password" name="new-password" placeholder="Password"
                                   onChange={checkField}/>
                            <div id="error-password" className="ui pointing red basic label" style={{display: "none"}}>
                                Please enter a value
                            </div>
                        </div>

                        <div className="ui hidden divider"></div>
                        <button className="ui button auth-action" type="submit">Save Changes</button>
                        <p>{errors}</p>
                    </form>
                }
            </ModalContent>
        </div>
    )
}

export default ProfileEdit;
