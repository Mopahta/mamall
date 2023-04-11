import { useState, useEffect } from "react";
import * as config from "../config/config";
import Error from "../common/Error";
import * as valid from "../common/validation";

function Pending({user}) {
    const [error, setError] = useState(null);
    const [isLoaded, setIsLoaded] = useState(false);
    const [items, setItems] = useState([]);
    const [contactChange, setContactChange] = useState(false);
    const [isOpen, setOpen] = useState(false);

    useEffect(() => {
        fetch(`${config.host}/contacts/invites`, {
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

    const addContact = async (username) => {

        const data = new FormData();

        data.append("username", username);

        if (!valid.validateUsername(username)) {
            return;
        }

        document.getElementById("call-contact").classList.add("loading");

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
                return res.json()
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
            {items.length !== 0?
                <div className="ui very relaxed list">
                {items.map(item => 
                    <div className="item" key={item.user_id}>
                        <div className="right floated content">
                            <button className="ui icon button" id="call-contact" >
                                <i className="check icon" onClick={() => addContact(item.username)}></i>
                            </button>
                            <button className="ui icon button" id="delete-contact" >
                                <i className="eye slash icon"></i>
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
                    <div className="header">No pending contacts</div>
                </div>
            }
            </>)
    }
}

export default Pending;