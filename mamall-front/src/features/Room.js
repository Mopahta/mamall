import { useState } from "react";
import { useParams } from "react-router-dom";

function Rooms({user, room}) {
    const [error, setError] = useState(null);
    const [isLoaded, setIsLoaded] = useState(false);
    const [items, setItems] = useState([]);

    let { roomId } = useParams()

    return (
        <div className="ui segment">
            {room.roomId != 0 ?

                <div className="ui center aligned container" >
                        <div className="huge ui buttons">
                            <div className="ui basic icon button">
                                <i className="microphone slash icon" />
                            </div>
                            <div className="ui basic icon button">
                                <i className="hand peace icon" />
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