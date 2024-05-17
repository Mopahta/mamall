import {Editor} from "@monaco-editor/react";
import {useContext, useEffect, useState} from "react";
import * as Y from "yjs";
import {WebrtcProvider} from "y-webrtc";
import {UserRoomContext} from "../context/UserRoomContext";
import {MonacoBinding} from "y-monaco";
import config from '../config/config';

function CodeEditor({}) {

    const userRoomContext = useContext(UserRoomContext)
    const [editorRef, setEditorRef]  = useState(null);

    function editorDidMount(editor, monaco) {
        console.log("editor did mount")
        // editorRef.current = editor;
        setEditorRef(editor);
    }

    useEffect(() => {
        console.log("userRoomContext changed, ", userRoomContext.room)
        if (userRoomContext.room.roomId != 0 && editorRef != null) {
            console.log("room is not zero, setting monacobinding ")
            const doc = new Y.Doc();
            const provider = new WebrtcProvider(userRoomContext.room.roomId, doc,
                { signaling: [config.yWebrtcSignalingHost] });
            const type = doc.getText("code-editor")

            const binding = new MonacoBinding(type, editorRef.getModel(),
                new Set([editorRef]), provider.awareness);

            console.log(provider.awareness);
        }

    }, [userRoomContext, editorRef]);

    return (
        <>
            <Editor
                height={"100vh"}
                // width={"100vw"}
                theme={"light"}
                onMount={editorDidMount}
            />
        </>)
}

export default CodeEditor;
