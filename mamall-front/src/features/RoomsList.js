import {useState, useEffect, useCallback} from "react";
import * as config from "../config/config";
import Error from "../common/Error";
import * as valid from "../common/validation";
import Rooms from "./Rooms";
import '../style/RoomList.css';
import {Modal} from "semantic-ui-react";
import CreateRoom from "./CreateRoom";

function RoomsList({user, socket, setRoom}) {
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

    const [isRoomCreation, setIsRoomCreation] = useState(false);

    function RoomFilterOption(props) {
        let chosenOption = props.chosenOption;

        if (chosenOption === filterMethod.byName) {
        }
        return <Rooms user={props.user} callRoom={callRoom} />;
    }

    const callRoom = useCallback(async (item) => {

        document.getElementById("call-room").classList.add("loading");

        await fetch(`${config.host}/room?roomId=${item.room_id}`, {
            method: 'GET',
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
            .then(data => {
                if (data) {
                    if (data.status === "error") {
                        console.log(data.message);
                    }
                    else {
                        console.log("room data", data);
                        setRoom({
                            roomId: data.room_id,
                            roomName: data.name,
                            roomModeId: data.room_mode_id,
                            description: data.description
                        });

                        if (socket != null) {
                            let message;
                            console.log(item);
                            if (item.user_id != null) {
                                message = {
                                    type: 1,
                                    contact_id: item.user_id,
                                    room_id: data.room_id
                                }
                            }
                            else {
                                message = {
                                    type: 1,
                                    room_id: data.room_id
                                }
                            }

                            socket.send(JSON.stringify(message));
                        }
                    }
                }
            })
            .catch(err => {
                console.log(err);
            })

        document.getElementById("call-room").classList.remove("loading");
        setIsRoomCreation(false);
    }, [setRoom, socket]);

    useEffect(() => {
        let url = `${config.host}/rooms`;
        if (user == null || !user.auth) {
            url = url + '/public';
        }

        fetch(url, {
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
            <form className="ui form" method="post" encType="multipart/form-data" >
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
                    <div className="ui very relaxed list">
                        <div className="ui relaxed stackable equal width grid">
                            {filteredItems.length !== 0 ?
                                filteredItems.map(item =>
                                    <div className="four wide column" key={item.room_id}>
                                        <div className="ui inverted segment call-room-card"
                                             style={{background: 'linear-gradient(90deg, #108353 0%, #106F8E 100%)'}}>
                                            <div className="content">
                                                <a className="header" style={{color: '#FFFFFF'}}>{item.name}</a>
                                                <div className="description">{item.description}</div>
                                                <div className="description">Participants: {item.users_amount}</div>
                                            </div>
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
                                        </div>
                                    </div>
                                )
                            :
                            <div className="content">
                                <div className="header">No rooms available</div>
                            </div>
                            }
                            <div className="four wide column" key={0}>
                                {user && user.auth ?
                                    <div className="ui inverted segment call-room-card"
                                         style={{background: 'linear-gradient(270deg, #C3FFE2 0%, #D0FFF7 100%)',
                                             height: '100%'}}>
                                        <div className="content">
                                            <a className="header" style={{color: '#000000'}}>Create room</a>
                                        </div>
                                        <div className="right floated content">
                                            <button className="ui icon button" id="call-room">
                                                <i className="plus icon" onClick={() => setIsRoomCreation(true)}></i>
                                            </button>
                                        </div>
                                        <Modal dimmer={'inverted'} open={isRoomCreation}
                                               onClose={() => setIsRoomCreation(false)}>

                                            <CreateRoom setIsRoomCreation={setIsRoomCreation}/>
                                        </Modal>
                                    </div>
                                    :
                                    <></>
                                }
                            </div>
                        </div>
                    </div>
                </>
            }
            </>)
    }
}

export default RoomsList;