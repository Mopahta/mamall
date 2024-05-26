import '../logo.css';
import 'semantic-ui-css/semantic.min.css';
import * as config from "../config/config";
import { Link } from 'react-router-dom';

function Header({user, setUser}) {

    const handleLogout = async function (e) {

        await fetch(`${config.host}/logout`, { 
            method: 'GET',
            credentials: 'include'
        })
        .then(res => {
            setUser({auth: false, user_id: 0, name: ''})
        })
        .catch(err => {
            console.log(err)
        })

    }

    return (
        <>
        <header>
            <div className="ui inverted menu">
                <div className="ui container">
                    <div className="item">
                        <header className="app-header">
                            <img src={process.env.PUBLIC_URL + '/logo512.png'} className="app-logo" alt="logo"/>
                        </header>
                    </div>
                    <div className="item">
                        <header className="app-header">
                            <b>M</b>amall
                        </header>
                    </div>
                    <Link className="item" to="/">
                        Home
                    </Link>
                    {user.auth ?
                        <>
                            <Link className='item right' to="/me">
                                {user.name}
                            </Link>
                            <Link className="item">
                                <div className="ui" type='submit' onClick={handleLogout}>
                                    Log Out
                                </div>
                            </Link>
                        </>
                        :
                        <>
                            <Link className="item right" to="/login">
                                Log In
                            </Link>
                            <Link className="item" to="/signup">
                                Sign Up
                            </Link>
                        </>
                    }
                </div>
            </div>
        </header>
        </>
    );
}

export default Header;
