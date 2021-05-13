import { RSocketClient, JsonSerializer, IdentitySerializer } from 'rsocket-core';
import RSocketWebSocketClient from 'rsocket-websocket-client';
import {FlowableProcessor} from 'rsocket-flowable';
// backend ws endpoint
const wsURL = 'ws://localhost:6565/rsocket';
// rsocket client
const client = new RSocketClient({
    serializers: {
        data: JsonSerializer,
        metadata: IdentitySerializer
    },
    setup: {
        keepAlive: 60000,
        lifetime: 180000,
        dataMimeType: 'application/json',
        metadataMimeType: 'message/x.rsocket.routing.v0',
    },
    transport: new RSocketWebSocketClient({
        url: wsURL
    })
});
// error handler
const errorHanlder = (e) => console.log(e);
// response handler
const responseHanlder = (payload) => {
    debugger;
    console.log(JSON.stringify(payload, null, 2));
    const li = document.createElement('li');
    li.innerText = payload.data;
    li.classList.add('list-group-item', 'small')
    document.getElementById('result').appendChild(li);
}
const processor = new FlowableProcessor(sub => {});
const numberRequester = (socket, processor) => {
    socket.requestChannel(processor.map(i => {
        return {
            data: i,
            metadata: String.fromCharCode('number.channel'.length) + 'number.channel'
        }
    })).subscribe({
        onError: errorHanlder,
        onNext: responseHanlder,
        onSubscribe: subscription => {
            subscription.request(100); // set it to some max value
        }
    })
}
client.connect().then(sock => {
    numberRequester(sock, processor);
    document.getElementById('n').addEventListener('keyup', ({srcElement}) => {
        if(srcElement.value.length > 0){
            processor.onNext(parseInt(srcElement.value))
        }
    })
}, errorHanlder);