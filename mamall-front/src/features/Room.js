import { useState } from "react";
import { useParams } from "react-router-dom";
import Error from "../common/Error";

function Rooms({user, room, setRoom}) {
    const [error, setError] = useState(null);
    const [isLoaded, setIsLoaded] = useState(false);
    const [items, setItems] = useState([]);

    return (
        <div className="ui segment">
            {room.roomId != 0 ?

                <div className="ui center aligned container" >
                        <div className="ui vertically padded stackable grid">
                            <div className="ten wide computer sixteen wide tablet column">
                                <Error message={"User video or icon"} />
                                <audio id="room-audio" controls></audio>
                            </div>
                            <div className="six wide computer sixteen wide tablet column">
                                <Error message={"Room users"} />
                            </div>
                        </div>
                        <div className="huge ui buttons">
                            <div className="ui basic icon button">
                                <i className="microphone slash icon" />
                            </div>
                            <div className="ui basic icon button">
                                <i className="x icon" />
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
}

export default Rooms;