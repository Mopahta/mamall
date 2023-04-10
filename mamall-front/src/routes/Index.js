import { useState } from "react";
import * as config from "../config/config"
import Contacts from "../features/Contacts";
import Error from "../common/Error";
import Rooms from "../features/Room";

function Index({user, setUser}) {

    return (
        <div className="ui vertically padded stackable grid">
            <div className="six wide computer sixteen wide tablet column">
                {user.auth?
                <Contacts />
                :
                <Error message={"Sign in to see contacts"} />
                }

            </div>
            <div className="ten wide computer sixteen wide tablet column">
                {user.auth?
                <Rooms />
                :
                <Error message={"Sign in to use room."} />
                }
            </div>
        </div>
    )
}

export default Index;