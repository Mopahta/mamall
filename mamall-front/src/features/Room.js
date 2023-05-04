import { useState, memo } from "react";
import { useParams } from "react-router-dom";
import Error from "../common/Error";
import RoomUsers from "./RoomUsers";
import RoomContent from "./RoomContent";

const Rooms = memo(function Rooms({user, room, socket, setRoom}) {
    const [error, setError] = useState(null);
    const [isLoaded, setIsLoaded] = useState(false);
    const [items, setItems] = useState([]);

    const leaveRoom = async () => {
        setRoom({
            roomId: 0,
            roomName: null,
            roomModeId: 0,
            description: null
        }, room.roomId);
    }

    return (
        <div className="ui segment">
            {room.roomId != 0 ?

                <div className="ui container" >
                        <div className="ui vertically padded stackable grid">
                            <div className="ten wide computer sixteen wide tablet column segment" id="users-audios">
                                {/* <Error message={"User video or icon"} /> */}
                                <RoomContent user={user} room={room} socket={socket}/>
                            </div>
                            <div className="six wide computer sixteen wide tablet column">
                                <RoomUsers user={user} room={room} socket={socket}/>
                            </div>
                        </div>
                <div className="ui center aligned container" >
                        <div className="huge ui buttons">
                            <div className="ui basic icon button">
                                <i className="microphone slash icon" />
                            </div>
                            <div className="ui basic icon button" onClick={() => leaveRoom()}>
                                <i className="x icon" />
                            </div>
                        </div>
                        </div>
                </div>
            :
            <div className="segment eight wide column">
                    <h3>No room chosen.</h3>
            </div>
            }
        </div>
    )
});

export default Rooms;