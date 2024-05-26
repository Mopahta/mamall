import { memo, useCallback, useState } from "react";
import * as config from "../config/config";
import Contacts from "./Contacts";
import Pending from "./Pending";
import Rooms from "./Rooms";
import CodeEditor from "./CodeEditor";
import '../style/Base.css';

const UserInteraction = memo(function UserInteraction({user, setRoom, socket}) {

    const [chosenOption, choose] = useState(0);

    const chosen = {
        contacts: 0,
        rooms: 1,
        pending: 2,
        editor: 3,
        board: 4,
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
        else if (chosenOption === chosen.editor) {
            return <CodeEditor/>
        }
        else if (chosenOption === chosen.board) {
            return <CodeEditor/>
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

        document.getElementById("option-" + chosenOption).classList.remove("positive");
        document.getElementById("option-" + option).classList.add("positive");
        choose(option);
    }

    return (
        <div className="ui segment">
            <div className="ui secondary two item menu">
                <div className="ui basic button item" id="option-3" onClick={() => changeOption(chosen.editor)}>
                    Code Editor
                </div>
                {/*<div className="ui basic button item" id="option-4" onClick={() => changeOption(chosen.board)}>*/}
                {/*    Drawing Board*/}
                {/*</div>*/}
            </div>
            <div className="ui secondary three item menu">
                <div className="ui basic button item positive" id="option-0" onClick={() => changeOption(chosen.contacts)}>
                    Contacts
                </div>
                <div className="ui basic button item" id="option-1" onClick={() => changeOption(chosen.rooms)}>
                    Rooms
                </div>
                <div className="ui basic button item" id="option-2" onClick={() => changeOption(chosen.pending)}>
                    Pending
                </div>
            </div>

            <RenderOption user={user} chosenOption={chosenOption}/>
        </div>
    )
})

export default UserInteraction;