import { useCallback, memo, useState } from "react";
import Error from "../common/Error";
import Room from "../features/Room";
import { Route, Routes } from "react-router-dom";
import UserInteraction from "../features/UserInteraction";

const Index = memo(function Index({user, socket, room, changeRoom}) {

    return (
        <div className="ui vertically padded stackable grid">
            <div className="six wide computer sixteen wide tablet column">
                {user.auth?
                <UserInteraction user={user} setRoom={changeRoom} socket={socket} />
                :
                <Error message={"Sign in to see contacts"} />
                }

            </div>
            <div className="ten wide computer sixteen wide tablet column">
                {user.auth?
                <Routes>
                    <Route path="/" element={<Room user={user} room={room} socket={socket} setRoom={changeRoom} />} />
                </Routes>
                :
                <Error message={"Sign in to use room."} />
                }
            </div>
        </div>
    )
})

export default Index;