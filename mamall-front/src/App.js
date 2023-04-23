import logo from './logo.svg';
// import './App.css';
import Header from './common/Header';
import { useState, useCallback, useEffect, useRef } from 'react';
import { Route, Routes } from 'react-router-dom';
import { Device } from 'mediasoup-client';
import config from './config/config';
import Error from './common/Error';
import Index from './routes/Index';
import Login from './routes/Login';
import Signup from './routes/Signup';

function App () {

    const [user, setUser] = useState({ auth: false, user_id: 0, name: ''});
    const [socketUrl, setSocketUrl] = useState(config.wsHost);
    const [webRtcSupport, setWRtcSupport] = useState(true);

    const [socketStatus, setSocketStatus] = useState(WebSocket.CLOSED);

    const [room, setRoom] = useState({ 
        roomId: 0, roomName: null, roomModeId: 0, description: null
    });

    const changeRoom = useCallback((roomInfo) => setRoom(roomInfo), [setRoom])


    let socket = useRef(null);
    let mediaDevice = useRef(null);
    let sendTransport = useRef(null);
    let receiveTransport = useRef(null);

    const setSocket = useCallback((sock) => {
        socket.current = sock;
    }, [])

    useEffect(() => {
        if (!user.auth) {
            if (socket.current) {
                socket.current.close();
            }
            return;
        }
        if (socketStatus === WebSocket.CLOSED) {
            connectSocket();
            setSocketStatus(WebSocket.OPEN);
        }
    }, [socketStatus, user.auth])

    async function handleMessage(message) {

        console.log(message.data);

        let res = dispatchMessage(JSON.parse(message.data));
    }

    async function dispatchMessage(message) {

        let messageHandlers = [
            (x) => {}, callRecv, callReq, joinReq
        ];

        let result;

        console.log("room in dispatchMessage ", room);
        if (message.type != undefined) {
            result = await messageHandlers[message.type](message);
        }

        return result;
    }

    /* 
        data = {
            type: 1,
            user_id,
            room_id,
            rtp: rtpCapabilities
        } 
    */
    async function callRecv(data) {
        if (data.status === 'failed') {
            return;
        }
        prepareMediaDevice(data.rtp);

    }

    /*
        data = {
            type: 2,
            status: 'failed'/'ok',
            message,
            room_id,
            [rtp]: rtpCapabilites
        }
    */
    const callReq = useCallback(async (data) => { 
        if (data.status === 'failed') {
            return;
        }
        
        await prepareMediaDevice(data.rtp);

        console.log("roomid from websocket ", data.room_id);

        if (socket.current != null) {
            
            let message = {
                type: 2,
                room_id: data.room_id,
                // sctpCapabilities: mediaDevice.current.sctpCapabilities
            }

            socket.current.send(JSON.stringify(message));
        }
    });

    /*
        {
            type: 3,
            specs: 
                id
                iceParameters
                iceCandidates
                dtlsParameters
                sctpParameters
        }
    */
    async function joinReq(data) {

        const sendTransport = mediaDevice.current.createSendTransport({
            id: data.specs.id,
            iceParameters: data.specs.iceParameters,
            iceCandidates: data.specs.iceCandidates,
            dtlsParameters: data.specs.dtlsParameters,
            sctpParameters: data.specs.sctpParameters
        })

        console.log("create send transport createed");

        // https://www.npmjs.com/package/ws-sync-request
        sendTransport.on('connect', async ({ dtlsParameters }, callback, errback) =>
            {
                // Here we must communicate our local parameters to our remote transport.
                try {

                    let message = {
                        type: 3,
                        transportId: sendTransport.id,
                        dtlsParameters,
                        room_id: data.room_id,
                        // sctpCapabilities: mediaDevice.current.sctpCapabilities
                    }

                    socket.current.send(JSON.stringify(message));

                    // Done in the server, tell our transport.
                    callback();
                }
                catch (error) {
                    // Something was wrong in server side.
                    errback(error);
                }
            }
        );

    //     // Set transport "produce" event handler.
    //     sendTransport.on('produce', async ({ kind, rtpParameters, appData }, callback, errback) =>
    //     {
    //         // Here we must communicate our local parameters to our remote transport.
    //         try {
    //         const { id } = await mySignaling.request(
    //             'produce',
    //             { 
    //             transportId : sendTransport.id,
    //             kind,
    //             rtpParameters,
    //             appData
    //             });

    //         // Done in the server, pass the response to our transport.
    //         callback({ id });
    //         }
    //         catch (error)
    //         {
    //         // Something was wrong in server side.
    //         errback(error);
    //         }
    //     });

    //     // Set transport "producedata" event handler.
    //     sendTransport.on(
    //     'producedata',
    //     async ({ sctpStreamParameters, label, protocol, appData }, callback, errback) =>
    //     {
    //         // Here we must communicate our local parameters to our remote transport.
    //         try
    //         {
    //         const { id } = await mySignaling.request(
    //             'produceData',
    //             { 
    //             transportId : sendTransport.id,
    //             sctpStreamParameters,
    //             label,
    //             protocol,
    //             appData
    //             });

    //         // Done in the server, pass the response to our transport.
    //         callback({ id });
    //         }
    //         catch (error)
    //         {
    //         // Something was wrong in server side.
    //         errback(error);
    //         }
    //     });

    //     const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    //     const webcamTrack = stream.getVideoTracks()[0];
    //     const webcamProducer = await sendTransport.produce({ track: webcamTrack });

    //     // Produce data (DataChannel).
    //     const dataProducer =
    //     await sendTransport.produceData({ ordered: true, label: 'foo' });
    }

    async function prepareMediaDevice(rtp) {
        if (!mediaDevice.current.loaded) {
            var cap = {routerRtpCapabilities: rtp};
            await mediaDevice.current.load(cap);
        }
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
            socket.current.close();
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

        try
        {
            mediaDevice.current = new Device();
        }
        catch (error)
        {
            if (error.name === 'UnsupportedError')
                console.warn('browser not supported');
                setWRtcSupport(false);
        }

        checkToken(config.host + config.validatePath);
        heartBeatMessage();
    }, []);

    const handleClickChangeSocketUrl = useCallback(
        () => setSocketUrl('wss://localhost:8000/'),
        []
    );

    const heartBeatMessage = useCallback(() => { 
        setTimeout(heartBeatMessage, 10000);
        let user;

        setUser(user_ => {
            user = user_;
            return user_;
        })

        let socketStatus;

        setSocketStatus(status_ => {
            socketStatus = status_;
            return status_;
        })

        if (user == null) {
            return;
        }

        if (!user.auth || socketStatus !== WebSocket.OPEN) {
            return;
        }

        let message = {
            type: 0,
            time: Date.now()
        }
        socket.current.send(JSON.stringify(message));
        console.log(`sent heartbeat`);
    }, [user]);

    const socketStatuses = ["connecting", "open", "closing", "closed"];

    return (
        <div style={{padding: "50px"}}>    
            <Header user={user} setUser={setUser}/>
        <Routes>
            <Route index path="/" element={<Index user={user} socket={socket.current} room={room} changeRoom={changeRoom}/>} />
            <Route path="login" element={<Login user={user} setUser={setUser}/>} />
            <Route path="signup" element={<Signup user={user} setUser={setUser}/>} />
            <Route path="*" element={<Error message={"Page not found"} />} />
        </Routes>
        <span>The WebSocket is currently {socketStatuses[socketStatus]}</span>
        </div>
    );
};

export default App;
