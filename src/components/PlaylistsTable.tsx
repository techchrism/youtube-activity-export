import {createEffect, createMemo, createSignal, For, type Component} from 'solid-js'
import {ParsedZip} from '../parse/parseZip'
import uzip from 'uzip'
import filenamify from 'filenamify'
import PlaylistTableRow from './PlaylistTableRow'
import { BiSolidDownload } from 'solid-icons/bi'

export type PlaylistTableProps = {
    parsedZip: ParsedZip
}

const PlaylistTable: Component<PlaylistTableProps> = (props) => {
    const [selected, setSelected] = createSignal<boolean[]>([])
    createEffect(() => {
        setSelected(props.parsedZip.playlists.map(p => true))
    })

    const selectedCount = createMemo(() => selected().reduce((result, checked) => result + (checked ? 1 : 0), 0))
    const allSelected = createMemo(() => selectedCount() === props.parsedZip.playlists.length)

    function toggleSelected(index: number) {
        setSelected(prev => {
            const newArr = [...prev]
            newArr[index] = !newArr[index]
            return newArr
        })
    }

    function setAllSelected(value: boolean) {
        setSelected(selected().map(_ => value))
    }

    function download() {
        const files: Record<string, Uint8Array> = {}

        props.parsedZip.playlists.filter((_, i) => selected()[i]).forEach(playlist => {
            const safeName = filenamify(playlist.name.replace(/[\W_]+/g, '_'), {replacement: '_'})
            files[`playlists/${safeName}.txt`] = new TextEncoder().encode(playlist.videos.map(v => v.url).join('\n'))
            files[`playlists/${safeName}.json`] = new TextEncoder().encode(JSON.stringify(playlist))
        })

        files['combined.txt'] = new TextEncoder().encode(Array.from(props.parsedZip.playlists
            .filter((_, i) => selected()[i])
            .map(p => p.videos.map(v => v.url))
            .reduce((result, urls) => {
                urls.forEach(url => result.add(url))
                return result
            }, new Set<string>()))
            .join('\n'))

        const zip = uzip.encode(files)

        const downloadUrl = URL.createObjectURL(new Blob([new DataView(zip)], {type: 'application/zip'}))
        const a = document.createElement('a')
        a.href = downloadUrl
        a.download = `playlist${selectedCount() === 1 ? '' : 's'}.zip`
        document.body.appendChild(a)
        a.click()
        URL.revokeObjectURL(downloadUrl)
        document.body.removeChild(a)
    }

    return (
        <>
            <table class="table text-xl mb-4">
                <thead class="text-lg">
                    <tr>
                        <th>
                            <input type="checkbox" title="Toggle All" class="checkbox" checked={allSelected()} onClick={() => setAllSelected(!allSelected())}/>
                        </th>
                        <th>Playlist Name</th>
                        <th>Videos</th>
                        <th></th>
                    </tr>
                </thead>
                <tbody>
                    <For each={props.parsedZip.playlists}>
                        {(item, index) => <PlaylistTableRow playlist={item} selected={selected()[index()]} onSelectionToggle={() => toggleSelected(index())}/>}
                    </For>
                </tbody>
            </table>

            <button class="btn btn-success btn-lg" disabled={selectedCount() === 0} onClick={download}>
                <BiSolidDownload />
                Download {selectedCount()} playlist{selectedCount() === 1 ? '' : 's'}
            </button>
        </>
    )
}

export default PlaylistTable