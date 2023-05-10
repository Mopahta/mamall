import { useContext } from "react";
import { RoomUsersContext } from "../context/RoomUsersContext";

function RoomContent({user, room, socket}) {

    const usersContext = useContext(RoomUsersContext);

    const vPomoechku = async (user) => {
        console.log(usersContext.roomUsers);
        console.log(user);
    } 

    return (

        <>

        {usersContext.roomUsers != null?
            usersContext.roomUsers.length !== 0?
                <div className="ui relaxed stackable equal width grid">
                {usersContext.roomUsers.map(item => 
                    <div className="column" key={item.user_id}>
                        <div className="ui brown inverted segment">
                            <div className="right floated content">
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

