import { useState, useEffect } from "react";
import * as config from "../config/config";
import Error from "../common/Error";

function Contacts({user, setUser}) {
    const [error, setError] = useState(null);
    const [isLoaded, setIsLoaded] = useState(false);
    const [items, setItems] = useState([]);

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
    }, [])

    return (
        <div className="ui relaxed list">

        </div>
    )
}

export default Contacts;