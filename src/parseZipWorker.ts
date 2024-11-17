import { parseArrayBuffer } from "./parseZip"

export type ParseZipData = ArrayBuffer
export type ParseZipMessage = {
    type: 'result',
    data: ReturnType<typeof parseArrayBuffer>
} | {
    type: 'error',
    error: any
}

self.onmessage = (event: MessageEvent<ParseZipData>) => {
    try {
        const data = parseArrayBuffer(event.data)
        self.postMessage({
            type: 'result',
            data
        })
    } catch(e) {
        self.postMessage({
            type: 'error',
            error: e
        })
    }    
}
