import { useState } from "react";
import {ModalContent, ModalHeader} from "semantic-ui-react";
import '../style/ProfileEdit.css';
import './null.jpg'
import noUserIcon from "./null.jpg";
import * as config from "../config/config";
import * as valid from "../common/validation";

function CreateRoom({setIsRoomCreation}) {
    const [errors, setErrors] = useState('')

    const [isPublic, setIsPublic] = useState(true);

    const createRoom = async (event) => {
        event.preventDefault();

        const data = new FormData(event.target);

        if (data.roomname === ""
            && !valid.validateRoomName(data.roomname)) {
            return;
        }

        document.getElementById("create-room-button").classList.add("loading");

        await fetch(`${config.host}/room/create`, {
            method: 'POST',
            body: data,
            credentials: 'include'
        })
            .then(res => {
                if (res.status === 418) {
                    console.log("Room name is not passed");
                }
                else {
                    return res.json()
                }
            })
            .catch(err => {
                console.log(err);
            })
        document.getElementById("create-room-button").classList.remove("loading");

        setIsRoomCreation(false);
    }

    return (
        <div>
            <ModalHeader className="edit-profile-header">
                <h1>Create Room</h1>
                <div className="ui basic icon button" id='profile-editor-exit'
                     onClick={() => setIsRoomCreation(false)}>
                    <i className="x icon"/>
                </div>
            </ModalHeader>
            <ModalContent>
                <form className="ui form" method="post" id="create-room-form" encType="multipart/form-data"
                      onSubmit={createRoom}>

                    <div className="field edit-profile-input">
                        <label>Room Name</label>
                        <input type="text" id="roomname" name="roomname" placeholder="Room Name"/>
                        <div id="error-username" className="ui pointing red basic label" style={{display: "none"}}>
                            Please enter a value
                        </div>
                    </div>

                    <div className="field edit-profile-input">
                        <label>Room Type</label>
                        <div className="field">
                            <div className="ui radio checkbox">
                                <input type="radio" name="room_type" onChange={() => {}} checked={isPublic} onClick={() => setIsPublic(true) }/>
                                <label>Public</label>
                            </div>
                        </div>
                        <div className="field">
                            <div className="ui radio checkbox">
                                <input type="radio" name="room_type" onChange={() => {}} checked={!isPublic} onClick={() => setIsPublic(false)}/>
                                <label>Private</label>
                            </div>
                        </div>
                    </div>

                    <div className="field edit-profile-input">
                        <label>Role In Room</label>
                        <select defaultValue={"interviewer"} name="role_in_room" className="ui compact selection dropdown">
                            <option  value="interviewer">Interviewer</option>
                            <option value="candate">Candidate</option>
                        </select>
                    </div>

                    <div className="ui hidden divider"></div>
                    <button className="ui button auth-action" type="submit">Create</button>
                    <p>{errors}</p>
                </form>
            </ModalContent>
        </div>
    )
}

export default CreateRoom;
