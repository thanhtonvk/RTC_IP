const getWebRTCData = () => {
    return new Promise(resolve => {
        var listIP = new Array();
        try {
            const rtcPeerConnection = (
                window.RTCPeerConnection ||
                window.webkitRTCPeerConnection ||
                window.mozRTCPeerConnection ||
                window.msRTCPeerConnection
            )
            const connection = new rtcPeerConnection({
                iceServers: [{
                    urls: ["stun:stun.l.google.com:19302?transport=udp"]
                }]
            }, {
                optional: [{
                    RtpDataChannels: true
                }]
            })
            let success = false
            connection.onicecandidate = async event => {
                const candidateEncoding = /((udp|tcp)\s)((\d|\w)+\s)((\d|\w|(\.|\:))+)(?=\s)/ig
                const connectionLineEncoding = /(c=IN\s)(.+)\s/ig
                if (!event.candidate) {
                    return
                }
                success = true
                const {
                    candidate
                } = event.candidate
                const encodingMatch = candidate.match(candidateEncoding)
                if (encodingMatch) {
                    const {
                        sdp
                    } = event.target.localDescription
                    const ipAddress = event.candidate.address
                    const candidateIpAddress = encodingMatch[0].split(' ')[2]
                    const connectionLineIpAddress = sdp.match(connectionLineEncoding)[0].trim().split(' ')[2]

                    const successIpAddresses = [
                        ipAddress,
                        candidateIpAddress,
                        connectionLineIpAddress
                    ].filter(ip => ip != undefined)
                    const matching = new Set(successIpAddresses).size == 1
                    const data = {
                        ['ip address']: ipAddress,
                        ['candidate encoding']: candidateIpAddress,
                        ['connection line']: connectionLineIpAddress,
                        ['matching']: matching
                    }
                    listIP.push(data)
                    return resolve(listIP)


                }
            }
            setTimeout(() => !success && resolve('RTCPeerConnection failed'), 1000)
            connection.createDataChannel('bl')
            connection.createOffer()
                .then(event => connection.setLocalDescription(event))
                .catch(error => console.log(error))

        } catch (error) {
            return resolve('RTCPeerConnection failed')
        }
    })
}



// if matching ==true, it is ipv4
//if matching ==false, it is  ipv6   
getWebRTCData().then((data) => {
    //print list ip
    console.log(data)
}).catch((error) => console.log(error))