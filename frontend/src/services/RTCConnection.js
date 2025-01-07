import PeerConnection from "./PeerConnection";

export default class RTCConnection {
    connectionsType = {}
    screenConnections = {}
    #iceConfiguration = {}

    constructor(iceConfiguration) {
        this.connectionsType = {
            screen :'screen',
        }
        this.connectionsType = Object.freeze(this.connectionsType)
        this.#iceConfiguration = iceConfiguration
    }

    getTypes() {
        return this.connectionsType
    }

    traverseScreenConnections(cb) {
        for (const key in this.screenConnections) {
            cb(this.screenConnections[key] , key)
        }
    }

    clearScreenConnection(key) {
        delete this.screenConnections[key]
    }

    findScreenConnection(owner) {
        return this.#findConnection(owner , this.connectionsType.screen)
    }

    #findConnection(owner , type) {
        switch (type) {
            case this.connectionsType.screen:
                return this.screenConnections[owner]
        }
        return null
    }

    newScreenConnection(
        owner ,
        direction ,
        ontrackCB = null ,
        oniceconnectionstatechangeCB = null,
        onicecandidateCB = null,
        onconnectionstatechangeCB = null
    ) {
        const conn = this.#newConnection(owner , this.connectionsType.screen , ontrackCB , oniceconnectionstatechangeCB , onicecandidateCB , onconnectionstatechangeCB)
        conn.addVideoTransceiver(direction)
        return conn
    }

    #newConnection(
        owner ,
        type ,
        ontrackCB  = null,
        oniceconnectionstatechangeCB = null ,
        onicecandidateCB = null ,
        onconnectionstatechangeCB = null)
    {
        const c = PeerConnection.newConnection(this.#iceConfiguration ,
            ontrackCB ,
            oniceconnectionstatechangeCB ,
            onicecandidateCB ,
            onconnectionstatechangeCB
        )

        switch (type) {
            case this.connectionsType.screen:
                this.screenConnections[owner] = new PeerConnection(c)
                return this.screenConnections[owner]
        }
        return null
    }

}