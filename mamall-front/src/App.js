import logo from './logo.svg';
// import './App.css';
import Header from './common/Header';
import { useState, useCallback, useEffect } from 'react';
import useWebSocket, { ReadyState } from 'react-use-websocket';
import { Route, Routes } from 'react-router-dom';
import config from './config/config';
import Login from './routes/Login';
import Signup from './routes/Signup';

function App () {

    const [user, setUser] = useState({ auth:false, user_id:''})
    const [socketUrl, setSocketUrl] = useState(config.wsHost);
    const [messageHistory, setMessageHistory] = useState([]);

    const { sendMessage, lastMessage, readyState } = useWebSocket(
        socketUrl, {
            onOpen: () => console.log('opened'),
            protocols: 'mamall-signal-protocol'
    });

    useEffect(() => {
        if (lastMessage !== null) {
            setMessageHistory((prev) => prev.concat(lastMessage));
        }
        heartBeatMessage();
    }, [lastMessage, setMessageHistory]);

    const handleClickChangeSocketUrl = useCallback(
        () => setSocketUrl('wss://localhost:8000/'),
        []
    );

    const heartBeatMessage = useCallback(() => { 
        if (!user.auth) {
            return;
        }

        let message = {
            type: '0',
            time: Date.now()
        }
        sendMessage(JSON.stringify(message));
        setTimeout(heartBeatMessage, 10000);
    }, []);

    const connectionStatus = {
        [ReadyState.CONNECTING]: 'Connecting',
        [ReadyState.OPEN]: 'Open',
        [ReadyState.CLOSING]: 'Closing',
        [ReadyState.CLOSED]: 'Closed',
        [ReadyState.UNINSTANTIATED]: 'Uninstantiated',
    }[readyState];

    return (
        <div style={{padding: "50px"}}>    
            <Header/>
        {/* <button onClick={handleClickChangeSocketUrl}>
            Click Me to change Socket Url
        </button> */}
        <Routes>
            <Route index path="/"/>
            <Route path="login" element={<Login user={user} setUser={setUser}/>} />
            <Route path="signup" element={<Signup user={user} setUser={setUser}/>} />
        </Routes>
        <button
            disabled={readyState !== ReadyState.OPEN}
        >
            Click Me to send 'Hello'
        </button>
        <span>The WebSocket is currently {connectionStatus}</span>
        {lastMessage ? <span>Last message: {lastMessage.data}</span> : null}
        <ul>
            {messageHistory.map((message, idx) => (
            <span key={idx}>{message ? message.data : null}</span>
            ))}
        </ul>
        </div>
    );
};

export default App;
