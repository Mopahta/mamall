import { useState, memo } from "react";
import RoomUsers from "./RoomUsers";
import RoomContent from "./RoomContent";
import '../style/Base.css';

const Room = memo(function Room({user, room, socket, setRoom, audioTrack, webcamTrack}) {
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

    const toggleMute = async () => {

        console.log(audioTrack.enabled);

        if (audioTrack.enabled) {
            audioTrack.enabled = false;

            document.getElementById("mute-microphone").classList.add("positive");
        } else {
            audioTrack.enabled = true;

            document.getElementById("mute-microphone").classList.remove("positive");
        }

    }

    const toggleWebcam = async () => {
        console.log("webcam.enabled", webcamTrack.enabled);

        if (webcamTrack.enabled) {
            webcamTrack.enabled = false;

            document.getElementById("webcam-status").classList.remove("positive");
        } else {
            webcamTrack.enabled = true;
            document.getElementById("webcam-status").classList.add("positive");
        }
    }
    return (
        <div className="ui segment">
            {room.roomId != 0 ?

                <div className="ui container" >
                        <div className="ui vertically padded stackable grid">
                            <div className="ten wide computer sixteen wide tablet column segment" id="users-audios">
                                <RoomContent user={user} room={room} socket={socket}/>
                            </div>
                            <div className="six wide computer sixteen wide tablet column">
                                <RoomUsers user={user} room={room} socket={socket}/>
                            </div>
                        </div>
                <div className="ui center aligned container" >
                    <div className="huge ui buttons">
                        <div className="ui basic icon button" id="mute-microphone" onClick={() => toggleMute()}>
                            <i className="microphone slash icon"/>
                        </div>
                        <div className="ui basic icon button positive" id="webcam-status" onClick={() => toggleWebcam()}>
                            <i className="video icon"/>
                        </div>
                        <div className="ui basic icon button" onClick={() => leaveRoom()}>
                            <i className="x icon"/>
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

export default Room;