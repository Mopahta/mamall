import { useState, useEffect } from "react";
import * as config from "../config/config";
import Error from "../common/Error";
import * as valid from "../common/validation";

function Contacts({user, setRoom, socket}) {
    const [error, setError] = useState(null);
    const [isLoaded, setIsLoaded] = useState(false);
    const [items, setItems] = useState([]);
    const [contactChange, setContactChange] = useState(false);

    useEffect(() => {
        fetch(`${config.host}/contacts`, {
            credentials: 'include'
        })
            .then(res => res.json())
            .then(
                (res) => {
                    setIsLoaded(true);
                    setItems(res)
                },
                (error) => { 
                    setError(error);
                    setIsLoaded(true)
                }
            )
    }, [contactChange])

    const addContact = async (event) => {
        event.preventDefault();

        const data = new FormData(event.target);

        if (document.getElementById("username").value === "" && !valid.validateUsername(document.getElementById("username"))) {
            return;
        }

        document.getElementById("add-contact-button").classList.add("loading");

        await fetch(`${config.host}/contacts`, { 
            method: 'POST',
            body: data,
            credentials: 'include'
        })
        .then(res => {
            if (res.status === 404) {
                console.log("User not found.");
            }
            else {
                setContactChange(!contactChange);
                return res.json()
            }
        })
        .catch(err => {
            console.log(err);
        })
        document.getElementById("add-contact-button").classList.remove("loading");
    }

    const callContact = async (contact) => {
        document.getElementById("call-contact").classList.add("loading");

        await fetch(`${config.host}/room?roomId=${contact.room_id}`, { 
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
                    setRoom({
                        roomId: data.room_id,
                        roomName: data.name,
                        roomModeId: data.room_mode_id,
                        description: data.description
                    })

                    if (socket != null) {
                        let message = {
                            type: 1,
                            contact_id: contact.user_id,
                            room_id: data.room_id
                        }

                        socket.send(JSON.stringify(message));
                    }
                    console.log(data);
                }
            }
        })
        .catch(err => {
            console.log(err);
        })

        document.getElementById("call-contact").classList.remove("loading");
    }

    if (error) {
        return (
            <Error message={"Error getting list of contacts."}/>
        )
    } else if (!isLoaded) {
        return (
        <div className="ui segment ">
                <div>Loading...</div>
        </div>
        )
    } else {
        return (

            <>
            <form className="ui form" method="post" encType="multipart/form-data" onSubmit={addContact}>
                <div className="grouped fields" style={{ display: "flex" }}>
                    <div className="field" style={{ flex: "1 2 auto" }}>
                        <div className="ui mini action input" >
                            <input type="text" id="username" name="username" placeholder="Add contact (username)" />
                            <button className="ui basic button" id="add-contact-button" type="submit">Add</button>
                        </div>
                    </div>
                </div>
            </form>

            {items.length !== 0?
                <div className="ui very relaxed list">
                {items.map(item => 
                    <div className="item" key={item.user_id}>
                        <div className="right floated content">
                            <button className="ui icon button" id="call-contact" >
                                <i className="phone icon" onClick={() => callContact(item)}></i>
                            </button>
                            <button className="ui icon button" id="delete-contact" >
                                <i className="trash icon"></i>
                            </button>
                        </div>
                        <img className="ui avatar image" src={process.env.PUBLIC_URL + "/" + item.icon_file_id} alt="contact"></img>
                        <div className="content">
                            <a className="header">{item.username}</a>
                            <div className="description">{item.contact_nickname + " " + item.contact_since}</div>
                        </div>
                    </div>
                )}
                </div>
                :
                <div className="content">
                    <div className="header">No contacts added</div>
                </div>
            }
            </>)
    }
}

export default Contacts;