import { useEffect, useContext } from "react";
import { RoomUsersContext } from "../context/RoomUsersContext";
import * as valid from "../common/validation";
import * as config from "../config/config";

function RoomUsers({user, room, socket}) {

    useEffect(() => {
        // TODO: custom user icons as audio elements
    }, []);

    const usersContext = useContext(RoomUsersContext);

    const vPomoechku = async (user) => {
        console.log(user);
    } 

    const addUserToRoom = async (event) => {

        event.preventDefault();

        const data = new FormData(event.target);

        document.getElementById("add-user-button").classList.add("loading");
        data.append("room_id", room.roomId);

        await fetch(`${config.host}/room/add`, { 
            method: 'POST',
            body: data,
            credentials: 'include'
        })
        .then(res => {
            if (res.status === 404) {
                console.log("User not found.");
            }
            else {
                return res.json()
            }
        })
        .catch(err => {
            console.log(err);
        })
        document.getElementById("add-user-button").classList.remove("loading");
    }

    const removeUserFromRoom = async (user_id) => {

        const data = new FormData();

        data.append("user_id", user_id);

        document.getElementById("delete-user-button-" + user_id).classList.add("loading");
        data.append("room_id", room.roomId);

        await fetch(`${config.host}/room/remove`, { 
            method: 'POST',
            body: data,
            credentials: 'include'
        })
        .then(res => {
            if (res.status >= 400) {
                console.log("Error while removing.");
            }
            else {
                return res.json()
            }
        })
        .then(data => {
            if (data != null && data.status === "ok") {
                let message = {
                    
                }
            }
        })
        .catch(err => {
            console.log(err);
        })

        document.getElementById("delete-user-button-" + user_id).classList.remove("loading");
    }

    return (

        <>

        {room.roomModeId !== 1 ?
            <form className="ui form" method="post" encType="multipart/form-data" onSubmit={addUserToRoom}>
                <div className="grouped fields" style={{ display: "flex" }}>
                    <div className="field" style={{ flex: "1 2 auto" }}>
                        <div className="ui mini action input" >
                            <input type="text" id="username" name="username" placeholder="Add user to room" />
                            <button className="ui basic button" id="add-user-button" type="submit">Add</button>
                        </div>
                    </div>
                </div>
            </form>
            :
            <>
            </>
        }
        {usersContext.roomUsers != null?
            usersContext.roomUsers.length !== 0?
                <div className="ui segment">
                    <div className="ui list">
                    {usersContext.roomUsers.map(item => 
                        <div className="item" key={item.user_id}>
                            <div className="right floated content">
                                <button className="ui icon button" id={"delete-user-button-" + item.user_id} >
                                    <i className="trash icon" onClick={() => removeUserFromRoom(item.user_id)}></i>
                                </button>
                            </div>
                            <img className="ui avatar image" src={process.env.PUBLIC_URL + "/" + item.icon_file_id} alt="room-user"></img>
                            <div className="content">
                                <a className="header">{item.username}</a>
                                <div className="description">{item.user_room_nickname + " " + item.description}</div>
                            </div>
                        </div>
                    )}
                    </div>
                </div>
                :
                <div className="content">
                    <div className="header">No users in room</div>
                </div>
            :
            <div className="content">
                <div className="header">No users in room</div>
            </div>
        }
        </>)
}

export default RoomUsers;
