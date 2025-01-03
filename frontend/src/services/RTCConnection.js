import PeerConnection from "./PeerConnection";

export default class RTCConnection {
    connectionsType = {}

    cameraSenderConnections = {}
    audioSenderConnections = {}
    screenSenderConnections = {}

    cameraReceiverConnections = {}
    audioReceiverConnections = {}
    screenReceiverConnections = {}

    #iceConfiguration = {}

    constructor(iceConfiguration) {
        this.connectionsType = {
            camera: 'camera',
            audio: 'audio',
            screen :'screen',
        }
        this.connectionsType = Object.freeze(this.connectionsType)
        this.#iceConfiguration = iceConfiguration
    }

    getTypes() {
        return this.connectionsType
    }

    // Sender methods:
    traverseSenderAudioConnections(cb) {
        for (const key in this.audioSenderConnections) {
            cb(this.audioSenderConnections[key] , key)
        }
    }

    clearSenderAudioConnection(key) {
        delete this.audioSenderConnections[key]
    }

    traverseSenderScreenConnections(cb) {
        for (const key in this.screenSenderConnections) {
            cb(this.screenSenderConnections[key] , key)
        }
    }

    clearSenderScreenConnection(key) {
        delete this.screenSenderConnections[key]
    }

    traverseSenderCameraConnections(cb) {
        for (const key in this.cameraSenderConnections) {
            cb(this.cameraSenderConnections[key] , key)
        }
    }

    clearSenderCameraConnections(key) {
        delete this.cameraSenderConnections[key]
    }

    newCameraSenderConnection(
        owner ,
        oniceconnectionstatechangeCB = null,
        onicecandidateCB = null,
        onconnectionstatechangeCB = null
    ) {
        const conn = this.#newSenderConnection(owner , this.connectionsType.camera  , oniceconnectionstatechangeCB , onicecandidateCB , onconnectionstatechangeCB)
        conn.addVideoTransceiver()
        return conn
    }

    newAudioSenderConnection(
        owner ,
        oniceconnectionstatechangeCB = null,
        onicecandidateCB = null ,
        onconnectionstatechangeCB = null
    ) {
        return this.#newSenderConnection(owner , this.connectionsType.audio , oniceconnectionstatechangeCB , onicecandidateCB , onconnectionstatechangeCB)
    }

    newScreenSenderConnection(
        owner ,
        oniceconnectionstatechangeCB = null,
        onicecandidateCB = null,
        onconnectionstatechangeCB = null
    )
    {
        return this.#newSenderConnection(owner , this.connectionsType.screen , oniceconnectionstatechangeCB , onicecandidateCB , onconnectionstatechangeCB)
    }

    findCameraSenderConnection(owner) {
        return this.#findSenderConnection(owner , this.connectionsType.camera)
    }

    findAudioSenderConnection(owner) {
        return this.#findSenderConnection(owner , this.connectionsType.audio)
    }

    findScreenSenderConnection(owner) {
        return this.#findSenderConnection(owner , this.connectionsType.screen)
    }

    #newSenderConnection(
        owner ,
        type ,
        oniceconnectionstatechangeCB = null ,
        onicecandidateCB = null ,
        onconnectionstatechangeCB = null)
    {
        const c = PeerConnection.newConnection(this.#iceConfiguration ,
            null ,
            oniceconnectionstatechangeCB ,
            onicecandidateCB ,
            onconnectionstatechangeCB
        )

        switch (type) {
            case this.connectionsType.audio:
                this.audioSenderConnections[owner] = new PeerConnection(c)
                return this.audioSenderConnections[owner]
            case this.connectionsType.camera:
                this.cameraSenderConnections[owner] = new PeerConnection(c)
                return this.cameraSenderConnections[owner]
            case this.connectionsType.screen:
                this.screenSenderConnections[owner] = new PeerConnection(c)
                return this.screenSenderConnections[owner]
        }
        return null
    }

    #findSenderConnection(owner , type) {
        switch (type) {
            case this.connectionsType.audio:
                return this.audioSenderConnections[owner]
            case this.connectionsType.camera:
                return this.cameraSenderConnections[owner]
            case this.connectionsType.screen:
                return this.screenSenderConnections[owner]
        }
        return null
    }
    // End sender methods

    // Receiver methods:
    traverseReceiverScreenConnections(cb) {
        for (const key in this.screenReceiverConnections) {
            cb(this.screenReceiverConnections[key] , key)
        }
    }

    clearReceiverScreenConnection(key) {
        delete this.screenSenderConnections[key]
    }

    traverseReceiverAudiConnections(cb) {
        for (const key in this.audioReceiverConnections) {
            cb(this.audioReceiverConnections[key] , key)
        }
    }

    clearReceiverAudioConnection(key) {
        delete this.audioReceiverConnections[key]
    }

    traverseReceiverCameraConnections(cb) {
        for (const key in this.cameraReceiverConnections) {
            cb(this.cameraReceiverConnections[key] , key)
        }
    }

    clearReceiverCameraConnections(key) {
        delete this.cameraReceiverConnections[key]
    }

    newCameraReceiverConnection(
        owner ,
        ontrackCB = null ,
        oniceconnectionstatechangeCB = null,
        onicecandidateCB = null,
        onconnectionstatechangeCB = null
    ) {
        const conn = this.#newReceiverConnection(owner , this.connectionsType.camera , ontrackCB , oniceconnectionstatechangeCB , onicecandidateCB , onconnectionstatechangeCB)
        conn.addVideoTransceiver()
        return conn
    }

    newAudioReceiverConnection(
        owner ,
        ontrackCB  = null ,
        oniceconnectionstatechangeCB = null,
        onicecandidateCB = null ,
        onconnectionstatechangeCB = null
    ) {
        return this.#newReceiverConnection(owner , this.connectionsType.audio , ontrackCB , oniceconnectionstatechangeCB , onicecandidateCB , onconnectionstatechangeCB)
    }

    newScreenReceiverConnection(
        owner ,
        ontrackCB  = null ,
        oniceconnectionstatechangeCB = null,
        onicecandidateCB = null,
        onconnectionstatechangeCB = null
    )
    {
        return this.#newReceiverConnection(owner , this.connectionsType.screen , ontrackCB , oniceconnectionstatechangeCB , onicecandidateCB , onconnectionstatechangeCB)
    }

    findCameraReceiverConnection(owner) {
        return this.#findReceiverConnection(owner , this.connectionsType.camera)
    }

    findAudioReceiverConnection(owner) {
        return this.#findReceiverConnection(owner , this.connectionsType.audio)
    }

    findScreenReceiverConnection(owner) {
        return this.#findReceiverConnection(owner , this.connectionsType.screen)
    }

    #newReceiverConnection(
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
            case this.connectionsType.audio:
                this.audioReceiverConnections[owner] = new PeerConnection(c)
                return this.audioReceiverConnections[owner]
            case this.connectionsType.camera:
                this.cameraReceiverConnections[owner] = new PeerConnection(c)
                return this.cameraReceiverConnections[owner]
            case this.connectionsType.screen:
                this.screenReceiverConnections[owner] = new PeerConnection(c)
                return this.screenReceiverConnections[owner]
        }
        return null
    }

    #findReceiverConnection(owner , type) {
        switch (type) {
            case this.connectionsType.audio:
                return this.audioReceiverConnections[owner]
            case this.connectionsType.camera:
                return this.cameraReceiverConnections[owner]
            case this.connectionsType.screen:
                return this.screenReceiverConnections[owner]
        }
        return null
    }
    // End receiver methods :
}