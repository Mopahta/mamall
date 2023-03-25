import logo from './logo.svg';
import './App.css';
import Header from './common/Header';
import { useState, useCallback, useEffect } from 'react';
import useWebSocket, { ReadyState } from 'react-use-websocket';
import { Buffer } from 'buffer';

function App () {
    //Public API that will echo messages sent to it back to the client
    const [socketUrl, setSocketUrl] = useState('ws://localhost:8000/');
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
    }, [lastMessage, setMessageHistory]);

    const handleClickChangeSocketUrl = useCallback(
        () => setSocketUrl('wss://demos.kaazing.com/echo'),
        []
    );

    const handleClickSendMessage = useCallback(() => { 
        sendMessage('Hello');
            let buf = Buffer.alloc(9)
            buf.writeUInt8(0, 0);
            buf.writeBigUInt64LE(2323n, 1);
            // connection.sendBytes(buf);
            sendMessage(buf)
            console.log(buf)
        setTimeout(handleClickSendMessage, 1000);
    }, []);
    Buffer

    const connectionStatus = {
        [ReadyState.CONNECTING]: 'Connecting',
        [ReadyState.OPEN]: 'Open',
        [ReadyState.CLOSING]: 'Closing',
        [ReadyState.CLOSED]: 'Closed',
        [ReadyState.UNINSTANTIATED]: 'Uninstantiated',
    }[readyState];

    return (
        <>
            <Header/>
        {/* <button onClick={handleClickChangeSocketUrl}>
            Click Me to change Socket Url
        </button> */}
        <button
            onClick={handleClickSendMessage}
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
        </>
    );
};

export default App;
