import { useState, useEffect, useContext } from "react";
import * as config from "../config/config";
import Error from "../common/Error";
import * as valid from "../common/validation";
import { RoomUsersContext } from "../context/RoomUsersContext";

function RoomUsers({user, room, socket}) {

    useEffect(() => {
        // TODO: custom user icons as audio elements
    }, []);

    const usersContext = useContext(RoomUsersContext);

    const vPomoechku = async (user) => {
        console.log(user);
    } 

    return (

        <>

        {usersContext.roomUsers != null?
            usersContext.roomUsers.length !== 0?
                <div className="ui very relaxed list">
                {usersContext.roomUsers.map(item => 
                    <div className="item" key={item.user_id}>
                        <div className="right floated content">
                            <button className="ui icon button" id="call-contact" >
                                <i className="phone icon" onClick={() => vPomoechku(item)}></i>
                            </button>
                            <button className="ui icon button" id="delete-contact" >
                                <i className="trash icon" onClick={() => vPomoechku(item)}></i>
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
