import {useContext, useEffect} from "react";
import { RoomUsersContext } from "../context/RoomUsersContext";
import noUserIcon from './null.jpg';
import ReactPlayer from "react-player";

function RoomContentUserCard({roomUser}) {

    const usersContext = useContext(RoomUsersContext);

    const vPomoechku = async (user) => {
        console.log(usersContext.roomUsers);
        console.log(user);
    }


    useEffect(() => {
        console.log(`xuiy ${usersContext.roomUsers} ${usersContext.userWebcamTracks}`);
        console.log(usersContext.roomUsers);
        console.log(usersContext.userWebcamTracks);
    }, [usersContext]);

    return (

        <>
            <div className="ui green inverted segment">
                {usersContext.userWebcamTracks[roomUser.user_id] != null ?
                    <div className="right floated content">
                        <ReactPlayer url={usersContext.userWebcamTracks[roomUser.user_id]} width={200} height={150} playing={true} onStart={() => {
                            console.log("xuy")
                        }} />
                    </div>
                    :
                    <div className="right floated content">
                    </div>
                }
                <img className="ui avatar image" src={noUserIcon} alt="room-user"></img>
                <div className="content">
                    <a className="header">{roomUser.username}</a>
                    <div className="description">{roomUser.user_room_nickname + " " + roomUser.description}</div>
                </div>
            </div>
        </>)
}

export default RoomContentUserCard;

