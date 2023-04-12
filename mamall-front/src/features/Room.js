import { useState } from "react";
import * as config from "../config/config"
import { useParams } from "react-router-dom";

function Rooms({user, room}) {
    const [error, setError] = useState(null);
    const [isLoaded, setIsLoaded] = useState(false);
    const [items, setItems] = useState([]);

    let { roomId } = useParams()

    return (
        <div className="ui segment">
            <div className="ui very relaxed list">
                    <div className="item" >
                        <div className="content">
                            <a className="header">{room.roomId}</a>
                        </div>
                    </div>
            </div>
        </div>
    )
}

export default Rooms;