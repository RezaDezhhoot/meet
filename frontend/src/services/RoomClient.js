const mediaType = {
  audio: 'audioType',
  video: 'videoType',
  screen: 'screenType'
}
const _EVENTS = {
  exitRoom: 'exitRoom',
  openRoom: 'openRoom',
  startVideo: 'startVideo',
  stopVideo: 'stopVideo',
  startAudio: 'startAudio',
  stopAudio: 'stopAudio',
  startScreen: 'startScreen',
  stopScreen: 'stopScreen'
}
let producer = null
import Swal from "sweetalert2";
export default class RoomClient {
  constructor(localMediaEl, remoteVideoEl, remoteAudioEl, mediasoupClient, socket, room_id, name,context, successCallback , consumerCallback = null) {
    this.name = name
    this.localMediaEl = localMediaEl
    this.remoteVideoEl = remoteVideoEl
    this.remoteAudioEl = remoteAudioEl
    this.mediasoupClient = mediasoupClient
    this.context = context

    this.socket = socket
    this.producerTransport = null
    this.consumerTransport = null
    this.device = null
    this.room_id = room_id

    this.isVideoOnFullScreen = false
    this.isDevicesVisible = false

    this.consumers = new Map()
    this.producers = new Map()

    console.log('Mediasoup client', mediasoupClient)

    /**
     * map that contains a mediatype as key and producer_id as value
     */
    this.producerLabel = new Map()

    this._isOpen = false
    this.eventListeners = new Map()

    Object.keys(_EVENTS).forEach(
      function (evt) {
        this.eventListeners.set(evt, [])
      }.bind(this)
    )
    this.createRoom(room_id).then(
        async function () {
          await this.join(name, room_id)
          this.initSockets(consumerCallback)
          this._isOpen = true
          successCallback()
        }.bind(this)
    )
  }

  async createRoom(room_id) {
    await this.socket
        .request('createRoom', {
          room_id
        })
        .catch((err) => {
          console.log('Create room error:', err)
        })
  }

  async join(name, room_id) {
    this.socket
        .request('join2', {
          name,
          room_id
        })
        .then(
            async function (e) {
              console.log('Joined to room', e)
              const data = await this.socket.request('getRouterRtpCapabilities')
              let device = await this.loadDevice(data)
              this.device = device
              await this.initTransports(device)
              this.socket.emit('getProducers')
              Swal.fire({
                position: 'center-center',
                text: "فعال سازی بلندگو ها؟",
                icon: "question",
                showCancelButton: true,
                confirmButtonColor: "#3085d6",
                cancelButtonColor: "#d33",
                confirmButtonText: "بله, فعال شود!",
                cancelButtonText: "خیر , فعال نشود"
              }).then((res) => {
                if (res.isConfirmed) {
                  this.context.commit('controlSound', {
                    value: true,
                  });
                } else {
                  this.context.commit('controlSound', {
                    value: false,
                  });
                }
              })
            }.bind(this)
        )
        .catch((err) => {
          Swal.fire({
            position: 'center-center',
            text: 'ارتباط برقرار نشد!',
            icon: 'warning',
            showConfirmButton: true,
            backdrop: false,
            confirmButtonText: "تلاش مجدد",
          }).then(res => {
            if (res.isConfirmed) {
              location.reload(true);
            }
          })
          console.log('Join error:', err)
        })
  }

  async loadDevice(routerRtpCapabilities) {
    let device
    try {
      device = new this.mediasoupClient.Device()
    } catch (error) {
      if (error.name === 'UnsupportedError') {
        console.error('Browser not supported')
        alert('Browser not supported')
      }
      console.error(error)
    }
    await device.load({
      routerRtpCapabilities
    })
    return device
  }

  async initConsumerTransport(device) {
    const data = await this.socket.request('createWebRtcTransport', {
      forceTcp: false
    })

    if (data.error) {
      console.error(data.error)
      return
    }

    // only one needed
    this.consumerTransport = device.createRecvTransport(data)
    this.consumerTransport.on(
        'connect',
        function ({ dtlsParameters }, callback, errback) {
          this.socket
              .request('connectTransport', {
                transport_id: this.consumerTransport.id,
                dtlsParameters
              })
              .then(callback)
              .catch(errback)
        }.bind(this)
    )

    this.consumerTransport.on(
        'connectionstatechange',
        async function (state) {
          console.log(state)
          switch (state) {
            case 'connecting':
              break

            case 'connected':
              this.context.state.connected = true;
              //remoteVideo.srcObject = await stream;
              //await socket.request('resume');
              break

            case 'failed':
              this.consumerTransport.close()
                await this.initConsumerTransport(device)
              break

            default:
              break
          }
        }.bind(this)
    )
  }

  async initProducerTransport(device) {
    const data = await this.socket.request('createWebRtcTransport', {
      forceTcp: false,
      rtpCapabilities: device.rtpCapabilities
    })

    if (data.error) {
      console.error(data.error)
      return
    }

    this.producerTransport = device.createSendTransport(data)

    this.producerTransport.on(
        'connect',
        async function ({ dtlsParameters }, callback, errback) {
          this.socket
              .request('connectTransport', {
                dtlsParameters,
                transport_id: data.id
              })
              .then(callback)
              .catch(errback)
        }.bind(this)
    )

    this.producerTransport.on(
        'produce',
        async function ({ kind, rtpParameters }, callback, errback) {
          try {
            const { producer_id } = await this.socket.request('produce', {
              producerTransportId: this.producerTransport.id,
              kind,
              rtpParameters
            })
            callback({
              id: producer_id
            })
          } catch (err) {
            errback(err)
          }
        }.bind(this)
    )

    this.producerTransport.on(
        'connectionstatechange',
        async function (state) {
          console.log(state)
          switch (state) {
            case 'connected':
              this.context.state.connected = true;
              break

            case 'failed':
              this.producerTransport.close()
              this.closeProducer(RoomClient.mediaType.audio)
              this.closeProducer(RoomClient.mediaType.video)

              await this.initProducerTransport(device)
              if (
                  this.context.state.user.media.media.local.camera &&
                  this.context.state.user.media.media.remote.camera
              ) {
                await this.produce(RoomClient.mediaType.video)
              }

              if (
                  this.context.state.user.media.media.local.microphone &&
                  this.context.state.user.media.media.remote.microphone
              ) {
                await this.produce(RoomClient.mediaType.audio)
              }
              break

            default:
              break
          }
        }.bind(this)
    )
  }

  async initTransports(device) {
    // init producerTransport
    await  this.initProducerTransport(device)

    // init consumerTransport
    await this.initConsumerTransport(device)
  }

  initSockets(callback = null) {
    this.socket.on(
      'consumerClosed',
      function ({ consumer_id }) {
        console.log('Closing consumer:', consumer_id)
        this.removeConsumer(consumer_id)
        callback()
      }.bind(this)
    )

    /**
     * data: [ {
     *  producer_id:
     *  producer_socket_id:
     * }]
     */
    this.socket.on(
      'newProducers',
      async function (data) {
        console.log('New producers', data)
        for (let { producer_id } of data) {
          await this.consume(producer_id , callback)
        }
      }.bind(this)
    )

    this.socket.on(
      'disconnect',
      function () {
        this.exit(true)
      }.bind(this)
    )
  }

  //////// MAIN FUNCTIONS /////////////

  async produce(type, deviceId = null , callback = null) {
    let mediaConstraints = {}
    let audio = false
    let screen = false
    switch (type) {
      case mediaType.audio:
        mediaConstraints = {
          audio: {
            deviceId: deviceId,
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true,
            googNoiseSuppression: true,
            googHighpassFilter: true,
            googTypingNoiseDetection: true,
            googNoiseReduction: true,
            volume: 1.0,
            googEchoCancellation: true,
            googAutoGainControl: true,
          },
          video: false
        }
        audio = true
        break
      case mediaType.video:
        mediaConstraints = {
          audio: false,
          video: {
            width: { ideal: 320  },
            height: { ideal: 280 },
            aspectRatio: { max: 4 / 3 },
            frameRate: { max: 15 },
            deviceId: deviceId
          }
        }
        break
      case mediaType.screen:
        mediaConstraints = false
        screen = true
        break
      default:
        return
    }
    if (!this.device.canProduce('video') && !audio) {
      console.error('Cannot produce video')
      callback(false , 'Cannot produce video')
      return
    }
    if (this.producerLabel.has(type)) {
      console.log('Producer already exists for this type ' + type)
      if (callback) {
        callback(false , 'Producer already exists for this type ' + type)
      }
      return
    }
    console.log('Mediacontraints:', mediaConstraints)
    let stream
    try {
      stream = screen
        ? await navigator.mediaDevices.getDisplayMedia({ video: true, audio: false})
        : await navigator.mediaDevices.getUserMedia(mediaConstraints)
      console.log(navigator.mediaDevices.getSupportedConstraints())

      const track = audio ? stream.getAudioTracks()[0] : stream.getVideoTracks()[0]
      const params = {
        track
      }
      if (!audio && !screen) {
        params.encodings = [
          {
            rid: 'r0',
            maxBitrate: 100000,
            //scaleResolutionDownBy: 10.0,
            scalabilityMode: 'S1T3'
          },
          {
            rid: 'r1',
            maxBitrate: 300000,
            scalabilityMode: 'S1T3'
          },
          {
            rid: 'r2',
            maxBitrate: 900000,
            scalabilityMode: 'S1T3'
          }
        ]
        params.codecOptions = {
          videoGoogleStartBitrate: 1000
        }
      }
      producer = await this.producerTransport.produce(params)
      console.log('Producer', producer)
      this.producers.set(producer.id, producer)

      let elem
      if (!audio && !screen) {
        const box = document.createElement('div')
        // const name = document.createElement('span')
        box.id = `${producer.id}_frame`;
        box.classList.add('inner-box');
        // name.classList.add('inner-box-label');
        // name.classList.add('rounded');
        // name.innerHTML = this.name ?? 'ناشناس'

        elem = document.createElement('video')
        elem.srcObject = stream
        elem.id = producer.id
        elem.playsinline = false
        elem.autoplay = true
        elem.className = 'vid'
        elem.muted = true
        box.appendChild(elem)
        // box.appendChild(name)
        this.localMediaEl.appendChild(box)
        this.handleFS(elem.id)
      } else if (screen) {

      }

      producer.on('trackended', () => {
        this.closeProducer(type)
        const frame = document.getElementById(`${producer.id}_frame`)
        if (frame) {
          frame.remove()
          this.context.dispatch('setDynamicGrid')
        }
        callback(true , null)
      })

      producer.on('transportclose', (data) => {
        console.log('Producer transport close')
        if (!audio) {
          elem.srcObject.getTracks().forEach(function (track) {
            track.stop()
          })
          elem.parentNode.removeChild(elem)
          const frame = document.getElementById(`${producer.id}_frame`)
          if (frame) {
            frame.remove()
            this.context.dispatch('setDynamicGrid')
          }
        }
        this.producers.delete(producer.id)
        callback(true , null)
      })

      producer.on('close', () => {
        console.log('Closing producer')
        if (!audio) {
          elem.srcObject.getTracks().forEach(function (track) {
            track.stop()
          })
          elem.parentNode.removeChild(elem)
          const frame = this.localMediaEl?.getElementById(`${producer.id}_frame`)
          if (frame) {
            frame.remove()
            this.context.dispatch('setDynamicGrid')
          }
        }
        this.producers.delete(producer.id)
        callback(true , null)
      })

      this.producerLabel.set(type, producer.id)

      switch (type) {
        case mediaType.audio:
          this.event(_EVENTS.startAudio)
          break
        case mediaType.video:
          this.context.dispatch('setDynamicGrid')
          this.event(_EVENTS.startVideo)
          break
        case mediaType.screen:
          this.event(_EVENTS.startScreen)
          break
        default:
          return
      }
      if (callback) {
        callback(true , null)
      }
    } catch (err) {
      // callback(false , err)
      console.log('Produce error:', err)
    }
  }

  async consume(producer_id , callback = null) {
    //let info = await this.roomInfo()

    this.getConsumeStream(producer_id).then(
      function ({ consumer, stream, kind }) {
        this.consumers.set(consumer.id, consumer)

        console.log(stream)
        let elem
        if (kind === 'video') {
          const box = document.createElement('div')
          // const name = document.createElement('span')
          box.id = `${consumer.id}_frame`;
          box.classList.add('inner-box');
          // name.classList.add('inner-box-label');
          // name.classList.add('rounded');
          // name.innerHTML = this.name ?? 'ناشناس'

          elem = document.createElement('video')
          elem.srcObject = stream
          elem.id = consumer.id
          elem.playsinline = false
          elem.autoplay = true
          elem.className = 'vid'
          elem.muted = true
          box.appendChild(elem)
          // box.appendChild(name)
          this.remoteVideoEl.appendChild(box)
          this.handleFS(elem.id)
        } else {
          elem = document.createElement('audio')
          elem.srcObject = stream
          elem.id = consumer.id
          elem.playsinline = false
          elem.autoplay = true
          this.remoteAudioEl.appendChild(elem)
          this.context.commit('controlSound' , {
            value: this.context.state.sound
          })
        }
        if (callback) {
          callback(kind)
        }

        consumer.on(
          'trackended',
          function () {
            this.removeConsumer(consumer.id)
            callback(kind)
          }.bind(this)
        )

        consumer.on(
          'transportclose',
          function () {
            this.removeConsumer(consumer.id)
            callback(kind)
          }.bind(this)
        )
      }.bind(this)
    )
  }

  async getConsumeStream(producerId) {
    const { rtpCapabilities } = this.device
    const data = await this.socket.request('consume', {
      rtpCapabilities,
      consumerTransportId: this.consumerTransport.id, // might be
      producerId
    })
    const { id, kind, rtpParameters } = data

    let codecOptions = {}
    const consumer = await this.consumerTransport.consume({
      id,
      producerId,
      kind,
      rtpParameters,
      codecOptions
    })

    const stream = new MediaStream()
    stream.addTrack(consumer.track)

    return {
      consumer,
      stream,
      kind
    }
  }

  closeProducer(type) {
    if (!this.producerLabel.has(type)) {
      console.log('There is no producer for this type ' + type)
      return
    }

    let producer_id = this.producerLabel.get(type)
    console.log('Close producer', producer_id)

    this.socket.emit('producerClosed', {
      producer_id
    })

    if (this.producers.has(producer_id)) {
      this.producers.get(producer_id).close()
      this.producers.delete(producer_id)
    }
    this.producerLabel.delete(type)
    if (type !== mediaType.audio) {
      let elem = document.getElementById(producer_id)
      if (elem) {
        elem.srcObject.getTracks().forEach(function (track) {
          track.stop()
        })
        elem.parentNode.removeChild(elem)
      }
    }
    const frame = document.getElementById(`${producer_id}_frame`)
    if (frame) {
      frame.remove()
      this.context.dispatch('setDynamicGrid')
    }
    switch (type) {
      case mediaType.audio:
        this.event(_EVENTS.stopAudio)
        break
      case mediaType.video:
        this.event(_EVENTS.stopVideo)
        break
      case mediaType.screen:
        this.event(_EVENTS.stopScreen)
        break
      default:
        return
    }
  }

  hasProducer(type) {
    return this.producerLabel.has(type)
  }

  pauseProducer(type) {
    if (!this.producerLabel.has(type)) {
      console.log('There is no producer for this type ' + type)
      return
    }

    let producer_id = this.producerLabel.get(type)
    this.producers.get(producer_id).pause()
  }

  resumeProducer(type) {
    if (!this.producerLabel.has(type)) {
      console.log('There is no producer for this type ' + type)
      return
    }

    let producer_id = this.producerLabel.get(type)
    this.producers.get(producer_id).resume()
  }

  removeConsumer(consumer_id) {
    let elem = document.getElementById(consumer_id)
    if (elem) {
      elem.srcObject.getTracks().forEach(function (track) {
        track.stop()
      })
      elem.parentNode.removeChild(elem)
    }

    const frame = document.getElementById(`${consumer_id}_frame`)
    if (frame) {
      frame.remove()
    }
    this.consumers.delete(consumer_id)
  }

  exit(offline = false) {
    let clean = function () {
      this._isOpen = false
      this.consumerTransport.close()
      this.producerTransport.close()
      this.socket.off('disconnect')
      this.socket.off('newProducers')
      this.socket.off('consumerClosed')
    }.bind(this)

    if (!offline) {
      this.socket
        .request('exitRoom')
        .then((e) => console.log(e))
        .catch((e) => console.warn(e))
        .finally(
          function () {
            clean()
          }.bind(this)
        )
    } else {
      clean()
    }

    this.event(_EVENTS.exitRoom)
  }

  ///////  HELPERS //////////

  async roomInfo() {
    let info = await this.socket.request('getMyRoomInfo')
    return info
  }

  static get mediaType() {
    return mediaType
  }

  event(evt) {
    if (this.eventListeners.has(evt)) {
      this.eventListeners.get(evt).forEach((callback) => callback())
    }
  }

  on(evt, callback) {
    this.eventListeners.get(evt).push(callback)
  }

  //////// GETTERS ////////

  isOpen() {
    return this._isOpen
  }

  static get EVENTS() {
    return _EVENTS
  }

  //////// UTILITY ////////

  copyURL() {
    let tmpInput = document.createElement('input')
    document.body.appendChild(tmpInput)
    tmpInput.value = window.location.href
    tmpInput.select()
    document.execCommand('copy')
    document.body.removeChild(tmpInput)
    console.log('URL copied to clipboard 👍')
  }

  showDevices() {
    if (!this.isDevicesVisible) {
      reveal(devicesList)
      this.isDevicesVisible = true
    } else {
      hide(devicesList)
      this.isDevicesVisible = false
    }
  }

  handleFS(id) {
    let videoPlayer = document.getElementById(id)
    videoPlayer.addEventListener('fullscreenchange', (e) => {
      if (videoPlayer.controls) return
      let fullscreenElement = document.fullscreenElement
      if (!fullscreenElement) {
        videoPlayer.style.pointerEvents = 'auto'
        this.isVideoOnFullScreen = false
      }
    })
    videoPlayer.addEventListener('webkitfullscreenchange', (e) => {
      if (videoPlayer.controls) return
      let webkitIsFullScreen = document.webkitIsFullScreen
      if (!webkitIsFullScreen) {
        videoPlayer.style.pointerEvents = 'auto'
        this.isVideoOnFullScreen = false
      }
    })
    videoPlayer.addEventListener('click', (e) => {
      if (videoPlayer.controls) return
      if (!this.isVideoOnFullScreen) {
        if (videoPlayer.requestFullscreen) {
          videoPlayer.requestFullscreen()
        } else if (videoPlayer.webkitRequestFullscreen) {
          videoPlayer.webkitRequestFullscreen()
        } else if (videoPlayer.msRequestFullscreen) {
          videoPlayer.msRequestFullscreen()
        }
        this.isVideoOnFullScreen = true
        videoPlayer.style.pointerEvents = 'none'
      } else {
        if (document.exitFullscreen) {
          document.exitFullscreen()
        } else if (document.webkitCancelFullScreen) {
          document.webkitCancelFullScreen()
        } else if (document.msExitFullscreen) {
          document.msExitFullscreen()
        }
        this.isVideoOnFullScreen = false
        videoPlayer.style.pointerEvents = 'auto'
      }
    })
  }
}
