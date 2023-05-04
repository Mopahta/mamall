import { useContext } from "react";
import { RoomUsersContext } from "../context/RoomUsersContext";

function RoomContent({user, room, socket}) {

    const usersContext = useContext(RoomUsersContext);

    const vPomoechku = async (user) => {
        console.log(user);
    } 

    return (

        <>

        {usersContext.roomUsers != null?
            usersContext.roomUsers.length !== 0?
                <div className="ui relaxed stackable equal width grid">
                {usersContext.roomUsers.map(item => 
                    <div className="column">
                        <div className="ui brown inverted segment" key={item.user_id}>
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

export default RoomContent;

