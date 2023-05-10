function Error({message}) {

    return (
        <div className="ui segment ">
            <div className="segment eight wide column">
                    <h3>{message}</h3>
            </div>
        </div>
    )
}

export default Error;