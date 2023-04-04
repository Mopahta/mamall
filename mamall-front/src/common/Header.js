import '../logo.css';
import 'semantic-ui-css/semantic.min.css';
import { Link } from 'react-router-dom';

function Header() {

    return (
        <>
        <header>
            <div className="ui inverted menu">
                <div className="item">
                    <header className="app-header">
                        <img src={process.env.PUBLIC_URL + '/logo512.png'} className="app-logo" alt="logo" />
                    </header>
                </div>
                <Link className="item" to="/">
                    Home
                </Link>
                <Link className="item right" to="/login">
                    Log In
                </Link>
                <Link className="item" to="/signup">
                    Sign Up
                </Link>
            </div>
        </header>
        </>
    );
}

export default Header;
