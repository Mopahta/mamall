import { useState, useEffect } from "react";
import * as config from "../config/config";
import Error from "../common/Error";
import * as valid from "../common/validation";
import noUserIcon from './null.jpg';

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

    const modifyContact = async (invitation, method) => {

        const data = new FormData();

        
        if (method === 'POST') {
            document.getElementById("call-contact").classList.add("loading");
            data.append("username", invitation.username);
        }
        else {
            document.getElementById("delete-contact").classList.add("loading");
            data.append("user_id", invitation.user_id);
        }

        await fetch(`${config.host}/contacts`, { 
            method: method,
            body: data,
            credentials: 'include'
        })
        .then(res => {
            if (res.status === 404) {
                console.log("User not found.");
            }
            else {
                if (method === 'POST') {
                    document.getElementById("call-contact").classList.remove("loading");
                }
                else {
                    document.getElementById("delete-contact").classList.remove("loading");
                }
                setItems(items.filter(item => item.user_id !== invitation.user_id));
                return res.json()
            }
        })
        .catch(err => {
            console.log(err);
        })
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
                                <i className="check icon" onClick={() => modifyContact(item, 'POST')}></i>
                            </button>
                            <button className="ui icon button" id="delete-contact" >
                                <i className="eye slash icon" onClick={() => modifyContact(item, 'DELETE')}></i>
                            </button>
                        </div>
                        <img className="ui avatar image" src={noUserIcon} alt="contact"></img>
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
