import logo from './logo.svg';
import './App.css';
import Header from './common/Header';
import { useState, useCallback, useEffect, useRef, createContext, useMemo } from 'react';
import { Route, Routes } from 'react-router-dom';
import { Device } from 'mediasoup-client';
import config from './config/config';
import Error from './common/Error';
import Index from './routes/Index';
import Login from './routes/Login';
import Signup from './routes/Signup';
import { RoomUsersContext } from './context/RoomUsersContext';
import {UserRoomContext} from "./context/UserRoomContext";

function App () {

    const [user, setUser] = useState({ auth: false, user_id: 0, name: '', icon_path: ''});
    const [socketUrl, setSocketUrl] = useState(config.wsHost);
    const [webRtcSupport, setWRtcSupport] = useState(true);

    const [socketStatus, setSocketStatus] = useState(WebSocket.CLOSED);

    const [room, setRoom] = useState({ 
        roomId: 0, roomName: null, roomModeId: 0, description: null
    });

    const [roomUsers, setRoomUsers] = useState([]);

    // TODO: refactor to use map
    const [userWebcamTracks, setUserWebcamTracks] = useState([]);

    const changeRoomUsers = useCallback((roomUsers) => {
        setRoomUsers(roomUsers)
    }, []);

    const changeUsersTracks = useCallback((usersTracks) => {
        setUserWebcamTracks(usersTracks)
    }, []);

    const addUserVideoTrack = useCallback((userId, webcamTrack) => {
        setUserWebcamTracks(userWebcamTracks => {
            let userWebcamTracks2 = Array(userWebcamTracks.length);
            userWebcamTracks[userId] = webcamTrack;
            let i = userWebcamTracks.length;
            while (i--) userWebcamTracks2[i] = userWebcamTracks[i];
            return userWebcamTracks2;
        })
    }, []);

    const addRoomUser = useCallback((roomUser) => {
        setRoomUsers(prevUsers => [...prevUsers, roomUser])
    }, []);

    const removeRoomUser = useCallback((roomUserId) => {
        setRoomUsers(prevUsers => prevUsers.filter(user => user.user_id !== roomUserId))
    }, []);

    const removeAllRoomUsers = useCallback(() => {
        setRoomUsers([])
    }, []);

    const usersContext = useMemo(() => ({
        roomUsers,
        changeRoomUsers,
        userWebcamTracks,
        changeUsersTracks
    }), [roomUsers, changeRoomUsers, userWebcamTracks, changeUsersTracks]);

    const userRoomContext = useMemo(() => ({
        room,
        setRoom
    }), [room, setRoom])

    const leaveRoom = async (room_id) => {
        console.log("changing room from", room_id);
        if (room_id !== 0 && socket.current) {
            let message = {
                type: 7,
                room_id: room_id
            }
            socket.current.send(JSON.stringify(message));
        }
    };

    // const changeRoomUsers = useCallback(())

    const changeRoom = useCallback((roomInfo, room_id) => {
        if (room_id != null) {
            leaveRoom(room_id);
        }
        else {
            let curRoomId;
            console.log("in change room");
            leaveRoom(curRoomId);
        }
        setRoom(roomInfo);
    }, [setRoom]);

    let socket = useRef(null);

    let audioTrack = useRef(null);
    let webcamTrack = useRef(null);
    let broadcastTrack = useRef(null);

    let mediaDevice = useRef(null);
    let sendTransport = useRef(null);
    let receiveTransport = useRef(null);
    let audioProducer = useRef(null);
    let webcamProducer = useRef(null);

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

        let res = dispatchMessage(JSON.parse(message.data));
    }

    async function dispatchMessage(message) {

        let messageHandlers = [
            (x) => {}, callRecv, callReq, createMediaTransport, 
            consumeNewUser, consumeOtherUsers, newConsumer, 
            roomDisconnect, userDiscFromRoom,
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
        console.log("call received from room", data.room_id)

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

        console.log(`call request to ${data.room_id}`);
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

        console.log("transports created");

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

        if (webcamTrack.current == null) {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ video: true });
                webcamTrack.current = stream.getVideoTracks()[0];
            }
            catch (err) {
                console.error(err);
            }
        }

        if (audioTrack.current != null | webcamTrack.current != null) {
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
            console.log("creating producer");

            callback({ id: appData.streamType + sendTransport.current.appData.roomId + user.user_id + 1 });
        });
        
        audioProducer.current = await sendTransport.current.produce(
            {
                track: audioTrack.current,
                appData: {streamType: "audio"}
            });

        webcamProducer.current = await sendTransport.current.produce(
            {
                track: webcamTrack.current,
                codec: mediaDevice.current.rtpCapabilities.codecs
                    .find((codec) => codec.mimeType.toLowerCase() === 'video/h264'),
                appData: {streamType: "webcam"}
            });

    }

    // type: 4
    async function consumeNewUser(data) {
        console.log(data)
        console.log(`consuming new user stream_type: ${data.stream_type}`);
        console.log(data.stream_type);

        let message = {
            type: 5,
            transportId: receiveTransport.current.id,
            room_id: data.room_id,
            producer_id: data.producerId,
            new_user_id: data.new_user_id,
            stream_type: data.stream_type,
            rtpCapabilities: mediaDevice.current.rtpCapabilities,
        };

        socket.current.send(JSON.stringify(message));

        if (data.stream_type === 'audio') {
            addRoomUser(data.user);
        }
    }

    // type: 5
    async function consumeOtherUsers(data) {
        console.log("consuming other users");

        data.users.forEach(userP => {
            if (userP.user_id !== user.user_id) {
                for (let i = 0; i < userP.producers.length; i++) {
                    let message = {
                        type: 5,
                        transportId: receiveTransport.current.id,
                        room_id: data.room_id,
                        producer_id: userP.producers[i].producer_id,
                        new_user_id: userP.user_id,
                        stream_type: userP.producers[i].stream_type,
                        rtpCapabilities: mediaDevice.current.rtpCapabilities,
                    };

                    socket.current.send(JSON.stringify(message));
                }
            }
        });

        changeRoomUsers(data.users);
    }

    // type: 6
    async function newConsumer(data) {
        console.log(`new consumer creation on producer ${data.consumer.producerId} on consumer ${data.consumer.id}`);
        const consumer = await receiveTransport.current.consume(
        {
            id            : data.consumer.id,
            producerId    : data.consumer.producerId,
            kind          : data.consumer.kind,
            rtpParameters : data.consumer.rtpParameters
        });

        const { track } = consumer;

        switch (data.consumer.streamType) {
            case "audio":
                var sound = document.createElement('audio');
                sound.id = 'audio-player-' + data.conn_user_id;
                sound.controls = 'controls';
                sound.srcObject = new MediaStream([track]);
                sound.type = 'audio/mpeg';
                // document.getElementById('users-audios').appendChild(sound);

                sound.play()
            // let audioElem = document.querySelector("audio");
                break;
            case "webcam":
                console.log("webcam consumer on producer " + data.consumer.producerId);
                addUserVideoTrack(data.conn_user_id, new MediaStream([track]));
                break;
        }

        let message = {
            type: 6,
            room_id: data.room_id,
            consumer_id: data.consumer.id,
        }
        
        socket.current.send(JSON.stringify(message));
    }

    // type: 7
    async function roomDisconnect(data) {
        console.log("disconnected from room");
        if (sendTransport.current != null) {
            sendTransport.current.close();
            sendTransport.current = null;
        }

        if (receiveTransport.current != null) {
            receiveTransport.current.close();
            receiveTransport.current = null;
        }
        audioTrack.current = null;
        audioProducer.current = null;
        webcamTrack.current = null;
        webcamProducer.current = null;
        setUserWebcamTracks([]);
        // document.getElementById("audio-player-" + user.user_id).remove();
    }

    // TODO: if the page reloaded after the call can't create producer on back

    // type: 8
    async function userDiscFromRoom(data) {
        console.log("user disconnected from room");
        removeRoomUser(data.user_id);
        // document.getElementById("audio-player-" + data.user_id).remove();
    }

    async function prepareMediaDevice(rtp) {
        if (!mediaDevice.current.loaded) {
            console.log("preparing media device");
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
        // heartBeatMessage();
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
        <RoomUsersContext.Provider value={usersContext}>
            <UserRoomContext.Provider value={userRoomContext}>
                <Routes>
                    <Route index path="/" element={<Index user={user} socket={socket.current} room={room}
                                                          changeRoom={changeRoom} audioTrack={audioTrack.current} webcamTrack={webcamTrack.current} />} />
                    <Route path="login" element={<Login user={user} setUser={setUser}/>} />
                    <Route path="signup" element={<Signup user={user} setUser={setUser}/>} />
                    <Route path="*" element={<Error message={"Page not found"} />} />
                </Routes>
            </UserRoomContext.Provider>
        </RoomUsersContext.Provider>
        </div>
    );
};

export default App;
