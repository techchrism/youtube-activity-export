import type {Component} from 'solid-js'
import {createEffect, createResource, createSignal, Show} from 'solid-js'
import {ParsedZip} from '../parse/parseZip'
import ParseZipWorker from '../parse/parseZipWorker?worker'
import { ParseZipMessage } from '../parse/parseZipWorker'
import { BiRegularUpload } from 'solid-icons/bi'

export type FileUploadProps = {
    onParse?: (parsedZip: ParsedZip) => void
}

const FileUpload: Component<FileUploadProps> = (props) => {
    let hiddenInput
    const parseZipWorker = new ParseZipWorker()
    const [file, setFile] = createSignal<File | undefined>(undefined)

    const [parsedData] = createResource(file, async (file: File | undefined): Promise<ParsedZip | undefined> => {
        if(file === undefined) {
            return undefined
        }
        const buffer = await file.arrayBuffer()
        return await new Promise((resolve, reject) => {
            const messageHandler = (message: MessageEvent<ParseZipMessage>) => {
                if(message.data.type === 'error') {
                    parseZipWorker.removeEventListener('message', messageHandler)
                    reject(message.data.error)
                } else if(message.data.type === 'result') {
                    parseZipWorker.removeEventListener('message', messageHandler)
                    resolve(message.data.data)
                }
            }
            parseZipWorker.addEventListener('message', messageHandler)
            parseZipWorker.postMessage(buffer)
        })
    })

    createEffect(() => {
        const parsed = parsedData()
        if(parsed !== undefined) {
            props.onParse?.(parsed)
        }
    })

    function uploadClick() {
        hiddenInput.click()
    }

    function onChanged(event: Event) {
        setFile((event.target as HTMLInputElement).files[0])
    }

    return (
        <>
            <input type="file" accept=".zip" class="hidden" ref={hiddenInput} onChange={onChanged}/>
            <button class="btn btn-primary btn-lg" disabled={parsedData.loading} onClick={uploadClick}>
                <Show when={parsedData.loading} fallback={<BiRegularUpload />}>
                    <span class="loading loading-spinner loading-md"/>
                </Show>
                Load Takeout Zip
            </button>
            <Show when={parsedData.state === 'errored'}>
                <div class="alert alert-error shadow-lg mt-2">
                    <div>
                        <span>{parsedData.error.toString()}</span>
                    </div>
                </div>
            </Show>
            <div class="m-1 font-light">
                Note: This is a client-side webapp - all processing happens on your device and no data is uploaded to a server
            </div>
        </>
    )
}

export default FileUpload