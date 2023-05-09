import { useState, useEffect } from "react";
import * as config from "../config/config";
import Error from "../common/Error";
import * as valid from "../common/validation";

function Rooms({user, callRoom}) {
    const [error, setError] = useState(null);
    const [isLoaded, setIsLoaded] = useState(false);
    const [items, setItems] = useState([]);
    const [contactChange, setContactChange] = useState(false);

    useEffect(() => {
        fetch(`${config.host}/rooms`, {
            credentials: 'include'
        })
            .then(res => res.json())
            .then(
                (res) => {
                    setIsLoaded(true);
                    setItems(res)
                },
                (error) => { 
                    setError(error);
                    setIsLoaded(true)
                }
            )
    }, [contactChange])

    const createRoom = async (event) => {
    }

// TODO: add users to created room (room_id=8)

    const leaveRoom = async (user_id) => {

    }

    const joinRoom = async (room) => {
        callRoom(room);
    }

    if (error) {
        return (
            <Error message={"Error getting list of rooms."}/>
        )
    } else {
        return (

            <>
            <form className="ui form" method="post" encType="multipart/form-data" onSubmit={createRoom}>
                <div className="grouped fields" style={{ display: "flex" }}>
                    <div className="field" style={{ flex: "1 2 auto" }}>
                        <div className="ui mini action input" >
                            <input type="text" id="username" name="username" placeholder="Create room" />
                            <button className="ui basic button" id="add-contact-button" type="submit">Create</button>
                        </div>
                    </div>
                </div>
            </form>

            {!isLoaded?
                <div className="ui segment ">
                    <div>Loading...</div>
                </div>
                :
                <>
                {items.length !== 0?
                    <div className="ui very relaxed list">
                    {items.map(item => 
                        <div className="item" key={item.room_id}>
                            <div className="right floated content">
                                <button className="ui icon button" id="call-room" >
                                    <i className="phone icon" onClick={() => joinRoom(item)}></i>
                                </button>
                                <button className="ui icon button" id="leave-room" >
                                    <i className="trash icon" onClick={() => leaveRoom(item.user_id)}></i>
                                </button>
                            </div>
                            <div className="content">
                                <a className="header">{item.name}</a>
                                <div className="description">{item.description}</div>
                            </div>
                        </div>
                    )}
                    </div>
                    :
                    <div className="content">
                        <div className="header">No rooms added</div>
                    </div>
                }
                </>
            }
            </>)
    }
}

export default Rooms;