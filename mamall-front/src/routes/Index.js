import { memo } from "react";
import Error from "../common/Error";
import Room from "../features/Room";
import { Route, Routes } from "react-router-dom";
import UserInteraction from "../features/UserInteraction";
import RoomsList from "../features/RoomsList";

const Index = memo(function Index({user, socket, room, changeRoom, audioTrack, webcamTrack}) {

    return (
        <div className="ui vertically padded stackable grid">
            <div className="six wide computer sixteen wide tablet column">
                {user.auth?
                <UserInteraction user={user} setRoom={changeRoom} socket={socket} />
                :
                <Error message={"Log in to see contacts."} />
                }

            </div>
            <div className="ten wide computer sixteen wide tablet column">
                {user.auth?

                <Routes>
                    {room.roomId != 0 ?
                        <Route path="/" element={<Room user={user} room={room} socket={socket}
                                                   setRoom={changeRoom} audioTrack={audioTrack} webcamTrack={webcamTrack} />} />
                    :
                        <Route path="/" element={<RoomsList user={user} socket={socket} setRoom={changeRoom} />} />
                    }
                </Routes>
                :
                <RoomsList user={user} />
                }
            </div>
        </div>
    )
})

export default Index;