const os = require('os')
const ifaces = os.networkInterfaces()

const getLocalIp = () => {
  let localIp = '127.0.0.1'
  Object.keys(ifaces).forEach((ifname) => {
    for (const iface of ifaces[ifname]) {
      // Ignore IPv6 and 127.0.0.1
      if (iface.family !== 'IPv4' || iface.internal !== false) {
        continue
      }
      // Set the local ip to the first IPv4 address found and exit the loop
      localIp = iface.address
      return
    }
  })
  console.log(localIp)
  return localIp
}

module.exports = {
  listenIp: '0.0.0.0',
  listenPort: 3000,
  sslCrt: '../ssl/cert.pem',
  sslKey: '../ssl/key.pem',

  mediasoup: {
    // Worker settings
    numWorkers: Object.keys(os.cpus()).length,
    worker: {
      rtcMinPort: 10000,
      rtcMaxPort: 10500,
      logLevel: 'warn',
      logTags: [
        'info',
        'ice',
        'dtls',
        'rtp',
        'srtp',
        'rtcp',
        'rtx',
        'bwe',
        'score',
        'simulcast',
        'svc'
      ]
    },
    // Router settings
    router: {
      mediaCodecs: [
        {
          kind: 'audio',
          mimeType: 'audio/opus',
          clockRate: 48000,
          channels: 2
        },
        {
          kind: 'video',
          mimeType: 'video/VP8',
          clockRate: 90000,
          parameters: {
            "packetization-mode"      : 1,
            "profile-level-id"        : "42e01f",
            "level-asymmetry-allowed" : 1,
            'x-google-start-bitrate': 600,
            'x-google-max-bitrate': 900,   // Max 2.5 Mbps
            'x-google-min-bitrate': 400,    // Min 800 kbps
            'x-google-bitrate-priority': 1.0 // High priority
          }
        }
      ]
    },
    // WebRtcTransport settings
    webRtcTransport: {
      listenIps: [
        {
          ip: '0.0.0.0',
          announcedIp: getLocalIp() // replace by public IP address
        }
      ],
      maxIncomingBitrate: 3000,
      initialAvailableOutgoingBitrate: 6000,
    }
  }
}
