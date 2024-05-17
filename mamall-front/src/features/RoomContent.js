import {useContext} from "react";
import { RoomUsersContext } from "../context/RoomUsersContext";
import RoomContentUserCard from "./RoomContentUserCard";

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
                        <RoomContentUserCard roomUser={item} />
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

