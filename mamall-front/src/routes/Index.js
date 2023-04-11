import Error from "../common/Error";
import Rooms from "../features/Room";
import { Route, Routes } from "react-router-dom";
import UserInteraction from "../features/UserInteraction";

function Index({user}) {

    return (
        <div className="ui vertically padded stackable grid">
            <div className="six wide computer sixteen wide tablet column">
                {user.auth?
                <UserInteraction user={user} />
                :
                <Error message={"Sign in to see contacts"} />
                }

            </div>
            <div className="ten wide computer sixteen wide tablet column">
                {user.auth?
                <Routes>
                    <Route path="room">
                        <Route path=":roomId" element={<Rooms />} />
                    </Route>
                    <Route path="/" element={<Rooms />}/>
                </Routes>
                :
                <Error message={"Sign in to use room."} />
                }
            </div>
        </div>
    )
}

export default Index;