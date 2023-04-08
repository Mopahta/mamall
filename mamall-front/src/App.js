import logo from './logo.svg';
// import './App.css';
import Header from './common/Header';
import { useState, useCallback, useEffect, useRef } from 'react';
import { Route, Routes } from 'react-router-dom';
import config from './config/config';
import Error from './common/Error';
import Index from './routes/Index';
import Login from './routes/Login';
import Signup from './routes/Signup';

function App () {

    const [user, setUser] = useState({ auth: false, user_id: 0, name: ''});
    const [socketUrl, setSocketUrl] = useState(config.wsHost);
    const [messageHistory, setMessageHistory] = useState([]);

    const [socketStatus, setSocketStatus] = useState(WebSocket.CLOSED);

    const [socket, setSocket] = useState(null);

    useEffect(() => {
        if (!user.auth) {
            return;
        }
        if (socketStatus === WebSocket.CLOSED) {
            connectSocket();
            setSocketStatus(WebSocket.OPEN);
        }
    }, [socketStatus, user.auth])

    function handleMessage(message) {

        console.log(message.data);

    }

    function connectSocket() {
        let newSocket = new WebSocket(socketUrl, 'mamall-signal-protocol');
        
        setSocket(newSocket);

        newSocket.addEventListener('open', function (m) {
            console.log("WebSocket opened connection.")
        });

        newSocket.onmessage = handleMessage;
        newSocket.onclose = function (e) {
            setTimeout(() => {
                setSocketStatus(WebSocket.CLOSED);
            }, 2000);
        };

        newSocket.onerror = function (err) {
            socket.close();
        };

    }

    useEffect(() => {
        async function checkToken(path) {
            console.log("validating....")
            fetch(path, { 
                method: 'POST',
                credentials: 'include'
            })
            .then(res => {
                if (res.status === 403) { 
                    console.log("not valid token");
                }
                else if (res.status === 401) {
                    checkToken(config.host + config.refreshPath);
                }
                else {
                    return res.json();
                }
            })
            .then(data => {
                if (data && data.user_id && data.username) {
                    setUser({auth: true, user_id: data.user_id, name: data.username});
                }
            })
            .catch(err => {
                if (err.response) {
                    if (err.response.status === 403) {
                        console.log("not valid token")
                    }
                    else {
                        console.log("Please, try again.")
                    }
                }
                console.log(err)
            })
        }
        checkToken(config.host + config.validatePath);
        heartBeatMessage();
    }, []);

    const handleClickChangeSocketUrl = useCallback(
        () => setSocketUrl('wss://localhost:8000/'),
        []
    );

    const heartBeatMessage = useCallback(() => { 
        if (!user.auth || socketStatus !== WebSocket.OPEN) {
            return;
        }

        let message = {
            type: 0,
            time: Date.now()
        }
        socket.send(JSON.stringify(message));

        setTimeout(heartBeatMessage, 10000);
    }, []);

    return (
        <div style={{padding: "50px"}}>    
            <Header user={user} setUser={setUser}/>
        <Routes>
            <Route index path="/" element={<Index user={user} setUser={setUser}/>} />
            <Route path="login" element={<Login user={user} setUser={setUser}/>} />
            <Route path="signup" element={<Signup user={user} setUser={setUser}/>} />
            <Route path="*" element={<Error message={"Page not found"} />} />
        </Routes>
        <span>The WebSocket is currently {socketStatus}</span>
        <ul>
            {messageHistory.map((message, idx) => (
            <span key={idx}>{message ? message.data : null}</span>
            ))}
        </ul>
        </div>
    );
};

export default App;
