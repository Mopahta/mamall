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
    let audioTrack = useRef(null);
    let mediaDevice = useRef(null);
    let sendTransport = useRef(null);
    let receiveTransport = useRef(null);
    let audioProducer = useRef(null);

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
            (x) => {}, callRecv, callReq, createMediaTransport, 
            consumeNewUser, consumeOtherUsers, newConsumer
        ];

        let result;

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
    const callRecv = useCallback(async (data) => { 
        if (data.status === 'failed') {
            return;
        }
        await prepareMediaDevice(data.rtp);

        changeRoom({ roomId: data.room_id });
        console.log("")

        if (socket.current != null) {
            
            let message = {
                type: 2,
                room_id: data.room_id,
            }

            socket.current.send(JSON.stringify(message));
        }
    });

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

        if (socket.current != null) {
            
            let message = {
                type: 2,
                room_id: data.room_id,
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
    async function createMediaTransport(data) {

        sendTransport.current = mediaDevice.current.createSendTransport({
            id: data.sendSpecs.id,
            iceParameters: data.sendSpecs.iceParameters,
            iceCandidates: data.sendSpecs.iceCandidates,
            dtlsParameters: data.sendSpecs.dtlsParameters,
            sctpParameters: data.sendSpecs.sctpParameters,
            appData: { roomId: data.room_id }
        })

        receiveTransport.current = mediaDevice.current.createRecvTransport({
            id: data.recvSpecs.id,
            iceParameters: data.recvSpecs.iceParameters,
            iceCandidates: data.recvSpecs.iceCandidates,
            dtlsParameters: data.recvSpecs.dtlsParameters,
            sctpParameters: data.recvSpecs.sctpParameters,
            appData: { roomId: data.room_id }
        })

        console.log("transports createed");

        sendTransport.current.on('connect', ({ dtlsParameters }, callback, errback) =>
            {
                try {
                    let message = {
                        type: 3,
                        transportId: sendTransport.current.id,
                        room_id: sendTransport.current.appData.roomId,
                        dtlsParameters,
                    }
                    socket.current.send(JSON.stringify(message));

                    callback();
                }
                catch (error) {
                    errback(error);
                }
            }
        );

        receiveTransport.current.on('connect', ({ dtlsParameters }, callback, errback) =>
            {
                try {
                    let message = {
                        type: 3,
                        transportId: receiveTransport.current.id,
                        room_id: receiveTransport.current.appData.roomId,
                        dtlsParameters,
                    }
                    socket.current.send(JSON.stringify(message));

                    callback();
                }
                catch (error) {
                    errback(error);
                }
            }
        );

        if (audioTrack.current == null) {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
                audioTrack.current = stream.getAudioTracks()[0];
            }
            catch (err) {
                console.error(err);
            }
        }

        if (audioTrack.current != null) {
            await setOnProduce();
        }
    }

    async function setOnProduce() {
        sendTransport.current.on('produce', async ({ kind, rtpParameters, appData }, callback, errback) =>
        {
            let message = {
                type: 4,
                transportId: sendTransport.current.id,
                room_id: sendTransport.current.appData.roomId,
                kind,
                rtpParameters,
                appData
            };
            socket.current.send(JSON.stringify(message));
            console.log(message);

            callback({ id: "" + sendTransport.current.appData.roomId + user.user_id + 1 });
        });
        
        audioProducer.current = await sendTransport.current.produce({ track: audioTrack.current });
    }

    // type: 4
    async function consumeNewUser(data) {

        let message = {
            type: 5,
            transportId: receiveTransport.current.id,
            room_id: data.room_id,
            producer_id: data.producerId,
            new_user_id: data.new_user_id,
            rtpCapabilities: mediaDevice.current.rtpCapabilities,
        };

        socket.current.send(JSON.stringify(message));
    }

    // type: 5
    async function consumeOtherUsers(data) {

        data.users.forEach(user => {
            let message = {
                type: 5,
                transportId: receiveTransport.current.id,
                room_id: data.room_id,
                producer_id: user.producer_id,
                new_user_id: user.user_id,
                rtpCapabilities: mediaDevice.current.rtpCapabilities,
            };
    
            socket.current.send(JSON.stringify(message));
        });

    }

    // type: 6
    async function newConsumer(data) {
        console.log("new consumer creation");
        console.log(data);
        const consumer = await receiveTransport.current.consume(
        {
            id            : data.consumer.id,
            producerId    : data.consumer.producerId,
            kind          : data.consumer.kind,
            rtpParameters : data.consumer.rtpParameters
        });

        // Render the remote video track into a HTML video element.
        const { track } = consumer;

        let audioElem = document.querySelector("audio");
        audioElem.srcObject = new MediaStream([ track ]);

        let message = {
            type: 6,
            room_id: data.room_id,
            consumer_id: data.consumer.id,
        }
        
        socket.current.send(JSON.stringify(message));
    }

    async function setOnConsume() {
        sendTransport.current.on('produce', async ({ kind, rtpParameters, appData }, callback, errback) =>
        {
            let message = {
                type: 4,
                transportId: sendTransport.current.id,
                room_id: sendTransport.current.appData.roomId,
                kind,
                rtpParameters,
                appData
            };
            socket.current.send(JSON.stringify(message));
            console.log(message);

            callback({ id: "" + user.user_id + sendTransport.current.appData.roomId + 1 });
        });
        
        audioProducer.current = await sendTransport.current.produce({ track: audioTrack.current });
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
