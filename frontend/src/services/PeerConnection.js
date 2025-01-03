export default class PeerConnection {
    #peerConnection

    constructor(peerConnection) {
        this.#peerConnection = peerConnection
    }

    addVideoTransceiver() {
        this.#peerConnection.addTransceiver('video' , {
            direction: 'sendrecv',
            sendEncodings: [
                { maxBitrate: 1500000 }, { scaleResolutionDownBy: 2.0 }
            ]
        })
    }

    close() {
        this.#peerConnection.getSenders().forEach((sender) => {
            if (sender.track) {
                sender.track.stop();
            }
        });
        this.#peerConnection.close()
    }

    addTrack(track , streams) {
        this.#peerConnection.addTrack(track , streams)
    }

    async makeOffer(iceRestart = false , offerToReceiveAudio = false, offerToReceiveVideo = false) {
        const offer = await this.#peerConnection.createOffer({
            iceRestart , offerToReceiveAudio , offerToReceiveVideo
        })
        await this.#peerConnection.setLocalDescription(new RTCSessionDescription(offer))

        return offer
    }

    async makeAnswer() {
        const answer = await this.#peerConnection.createAnswer()
        await this.#peerConnection.setLocalDescription(new RTCSessionDescription(answer))

        return answer
    }

    async setRemoteDesc(dec) {
        await this.#peerConnection.setRemoteDescription(new RTCSessionDescription(dec))
    }

    getState() {
        return this.#peerConnection.connectionState
    }

    getICEState() {
        return this.#peerConnection.iceConnectionState
    }

    addIceCandidate(candidate) {
        this.#peerConnection.addIceCandidate(candidate)
    }

    static newConnection(
        iceConfiguration ,
        ontrackCB = null ,
        oniceconnectionstatechangeCB = null ,
        onicecandidateCB = null ,
        onconnectionstatechangeCB = null)
    {
        const c = new RTCPeerConnection(iceConfiguration)
        if (ontrackCB)
            c.ontrack = ontrackCB
        if (oniceconnectionstatechangeCB)
            c.oniceconnectionstatechange = oniceconnectionstatechangeCB
        if (onicecandidateCB)
            c.onicecandidate = onicecandidateCB
        if (onconnectionstatechangeCB)
            c.onconnectionstatechange = onconnectionstatechangeCB

        return c;
    }
}