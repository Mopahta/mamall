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
                <Link className="right item" to="/login">
                    Login
                </Link>
            </div>
        </header>
        </>
    );
}

export default Header;
