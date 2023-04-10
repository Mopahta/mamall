import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import * as config from "../config/config";
import Error from "../common/Error";
import * as valid from "../common/validation";

function Contacts({user, setUser}) {
    const [error, setError] = useState(null);
    const [isLoaded, setIsLoaded] = useState(false);
    const [items, setItems] = useState([]);
    const [contactChange, setContactChange] = useState(false);
    const [isOpen, setOpen] = useState(false);

    useEffect(() => {
        fetch("http://localhost:8080/contacts", {
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

    const callContact = async (e) => {
        console.log(e);
    }

    if (error) {
        return (
            <Error message={"Error getting list of concerts."}/>
        )
    } else if (!isLoaded) {
        return (
        <div className="ui segment ">
                <div>Loading...</div>
        </div>
        )
    } else {
        return (
            <div className="ui segment">

                <form className="ui form" method="post" encType="multipart/form-data" onSubmit={addContact}>
                    <div className="grouped fields" style={{ display: "flex" }}>
                        <div className="field" style={{ flex: "1 2 auto" }}>
                            <div className="ui mini action input" >
                                <input type="text" id="username" name="username" placeholder="Add contact (username)" />
                                <button className="ui button" id="add-contact-button" type="submit">Add</button>
                            </div>
                        </div>
                    </div>
                </form>
                {items.length !== 0?
                    <div className="ui very relaxed list">
                    {items.map(item => 
                        <div className="item" key={item.user_id}>
                            <div className="right floated content">
                                <i className="phone icon" onClick={() => callContact(item.user_id)}></i>
                                <i className="trash icon"></i>
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
            </div>
        )
    }
}

export default Contacts;