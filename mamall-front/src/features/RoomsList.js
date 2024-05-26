import { useState, useEffect } from "react";
import * as config from "../config/config";
import Error from "../common/Error";
import * as valid from "../common/validation";
import Rooms from "./Rooms";

function RoomsList({user, callRoom}) {
    const [error, setError] = useState(null);
    const [isLoaded, setIsLoaded] = useState(false);
    const [items, setItems] = useState([]);
    const [filteredItems, setFilteredItems] = useState([]);
    const [contactChange, setContactChange] = useState(false);

    const [chosenOption, choose] = useState(0);

    const filterMethod = {
        byName: 0,
        byAmount: 1,
    }

    function RoomFilterOption(props) {
        let chosenOption = props.chosenOption;

        if (chosenOption === filterMethod.byName) {
        }
        return <Rooms user={props.user} callRoom={callRoom} />;
    }

    useEffect(() => {
        let url = '${config.host}/rooms';
        if (user == null || !user.auth) {
            url = url + '/public';
        }

        fetch(`${config.host}/rooms/public`, {
            credentials: 'include'
        })
            .then(res => res.json())
            .then(
                (res) => {
                    setIsLoaded(true);
                    setItems(res);
                    setFilteredItems(res);
                },
                (error) => { 
                    setError(error);
                    setIsLoaded(true)
                }
            )
    }, [contactChange])

    const filterRooms = async (event, chosenFilterMethod) => {
        if (chosenFilterMethod == filterMethod.byName) {
            setFilteredItems(items.filter((item) => item.name.toLowerCase().includes(event.target.value.toLowerCase()))
            );
        }
    }

    const createRoom = async (event) => {
        event.preventDefault();

        const data = new FormData(event.target);

        if (document.getElementById("roomname").value === ""
            && !valid.validateRoomName(document.getElementById("roomname"))) {
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
                            <input type="text" id="roomname" name="roomname" placeholder="Part of Rooms' Name"
                                   onChange={(event) => filterRooms(event, filterMethod.byName)}/>
                            <button className="ui basic button" id="create-room-button" type="submit">Filter by Name</button>
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
                {filteredItems.length !== 0?
                    <div className="ui very relaxed list">
                        <div className="ui relaxed stackable equal width grid">
                            {filteredItems.map(item =>
                                <div className="four wide column" key={item.room_id}>
                                    <div className="ui inverted segment" style={{background: 'linear-gradient(90deg, #108353 0%, #106F8E 100%)'}}>
                                        <div className="right floated content">
                                            {user && user.auth ?
                                                <button className="ui icon button" id="call-room">
                                                    <i className="phone icon" onClick={() => joinRoom(item)}></i>
                                                </button>
                                                :
                                                <></>
                                            }
                                            {/*<button className="ui icon button" id="leave-room">*/}
                                            {/*    <i className="trash icon" onClick={() => leaveRoom(item.user_id)}></i>*/}
                                            {/*</button>*/}
                                        </div>
                                        <div className="content">
                                            <a className="header" style={{color: '#FFFFFF'}}>{item.name}</a>
                                            <div className="description">{item.description}</div>
                                            <div className="description">Participants: {item.users_amount}</div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                        {/*{items.map(item =>*/}
                        {/*    <div className="item" key={item.room_id}>*/}
                        {/*        <div className="right floated content">*/}
                        {/*            <button className="ui icon button" id="call-room">*/}
                        {/*                <i className="phone icon" onClick={() => joinRoom(item)}></i>*/}
                        {/*            </button>*/}
                        {/*            <button className="ui icon button" id="leave-room">*/}
                        {/*                <i className="trash icon" onClick={() => leaveRoom(item.user_id)}></i>*/}
                        {/*            </button>*/}
                        {/*        </div>*/}
                        {/*        <div className="content">*/}
                        {/*            <a className="header">{item.name}</a>*/}
                        {/*            <div className="description">{item.description}</div>*/}
                        {/*        </div>*/}
                        {/*    </div>*/}
                        {/*)}*/}
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

export default RoomsList;