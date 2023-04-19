import { memo, useState } from "react";
import Contacts from "./Contacts";
import Pending from "./Pending";

const UserInteraction = memo(function UserInteraction({user, setRoom, socket}) {

    const [chosenOption, choose] = useState(0);

    const chosen = {
        contacts: 0,
        rooms: 1,
        pending: 2,
    }

    function RenderOption(props) {
        let chosenOption = props.chosenOption;

        if (chosenOption === chosen.contacts) {
            return <Contacts user={props.user} setRoom={setRoom} socket={socket} />;
        }
        else if (chosenOption === chosen.rooms) {

        }
        else if (chosenOption === chosen.pending) {
            return <Pending user={props.user} />
        }
    }

    const changeOption = async (option) => {
        choose(option);

        // for (const property in chosen) {
        //     if (chosen[property] === option) {
        //         document.getElementById("option" + option).classList.add("active");
        //     }
        //     else {
        //         document.getElementById("option" + option).classList.remove("active");
        //     }
        // }
    }

    return (
        <div className="ui segment">
            <div className="ui secondary three item menu">
                <a className="item" id="option-0" onClick={() => changeOption(chosen.contacts)} >
                    Contacts
                </a>
                <a className="item" id="option-1" onClick={() => changeOption(chosen.rooms)}>
                    Rooms
                </a>
                <a className="item" id="option-2" onClick={() => changeOption(chosen.pending)}>
                    Pending
                </a>
            </div>

            <RenderOption user={user} chosenOption={chosenOption}/>
        </div>
    )
})

export default UserInteraction;