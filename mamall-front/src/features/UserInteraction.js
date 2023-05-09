import { memo, useCallback, useState } from "react";
import * as config from "../config/config";
import Contacts from "./Contacts";
import Pending from "./Pending";
import Rooms from "./Rooms";

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
            return <Contacts user={props.user} callRoom={callRoom} />;
        }
        else if (chosenOption === chosen.rooms) {
            return <Rooms user={props.user} callRoom={callRoom} />;
        }
        else if (chosenOption === chosen.pending) {
            return <Pending user={props.user} />
        }
    }

    const callRoom = useCallback(async (item) => {

        document.getElementById("call-room").classList.add("loading");

        await fetch(`${config.host}/room?roomId=${item.room_id}`, { 
            method: 'GET',
            credentials: 'include'
        })
        .then(res => {
            if (res.status === 404) {
                console.log("User not found.");
            }
            else {
                return res.json()
            }
        })
        .then(data => {
            if (data) {
                if (data.status === "error") {
                    console.log(data.message);
                }
                else {
                    console.log("room data", data);
                    setRoom({
                        roomId: data.room_id,
                        roomName: data.name,
                        roomModeId: data.room_mode_id,
                        description: data.description
                    });

                    if (socket != null) {
                        let message;
                        console.log(item);
                        if (item.user_id != null) {
                            message = {
                                type: 1,
                                contact_id: item.user_id,
                                room_id: data.room_id
                            }
                        }
                        else {
                            message = {
                                type: 1,
                                room_id: data.room_id
                            }
                        }

                        socket.send(JSON.stringify(message));
                    }
                }
            }
        })
        .catch(err => {
            console.log(err);
        })

        document.getElementById("call-room").classList.remove("loading");
    }, [setRoom, socket]);

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