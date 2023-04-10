import { useState } from "react";
import * as config from "../config/config"
import { useParams } from "react-router-dom";

function Rooms({user, setUser}) {
    const [error, setError] = useState(null);
    const [isLoaded, setIsLoaded] = useState(false);
    const [items, setItems] = useState([]);

    let { roomId } = useParams()

    return (
        <div className="ui segment">
            <div className="ui very relaxed list">
                {items.map(item => 
                    <div className="item" key={item.user_id}>
                        <img className="ui avatar image" src={process.env.PUBLIC_URL + "/" + item.icon_file_id} alt="contact"></img>
                        <div className="content">
                            <a class="header">{item.username}</a>
                            <div class="description">{item.contact_nickname + " " + item.contact_since}</div>
                        </div>
                    </div>
                )}

            </div>
        </div>
    )
}

export default Rooms;