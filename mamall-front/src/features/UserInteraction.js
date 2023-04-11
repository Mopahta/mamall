import { useState, useEffect } from "react";
import * as config from "../config/config";
import Error from "../common/Error";
import * as valid from "../common/validation";
import Contacts from "./Contacts";

function UserInteraction({user}) {

    const [chosenOption, choose] = useState(0);

    const chosen = {
        contacts: 0,
        rooms: 1,
        pending: 2,
    }

    function RenderOption(props) {
        console.log(props.user);
        let chosenOption = props.chosenOption;

        if (chosenOption === chosen.contacts) {
            return <Contacts user={props.user} />;
        }
        else if (chosenOption === chosen.rooms) {

        }
        else if (chosenOption === chosen.pending) {

        }

    }
    return (
        <div className="ui segment">
            <div className="ui secondary three item menu">
                <a id="contacts-option" className="item active" >
                    Contacts
                </a>
                <a id="rooms-option" className="item">
                    Rooms
                </a>
                <a id="pending-option" className="item">
                    Pending
                </a>
            </div>

            <RenderOption user={user} chosenOption={chosenOption}/>
        </div>
    )
}

export default UserInteraction;