import { Component, createMemo, createSignal, Show } from 'solid-js'
import { ParsedZip } from '../parse/parseZip'
import { FaSolidPlay, FaSolidShuffle } from 'solid-icons/fa'

export type PlaylistTableRowProps = {
    playlist: ParsedZip['playlists'][number]
    selected: boolean
    onSelectionToggle: () => any
}

const PlaylistTableRow: Component<PlaylistTableRowProps> = (props) => {
    const [randomVideoUrl, setRandomVideoUrl] = createSignal<string | undefined>()
    const randomEmbedUrl = createMemo(() => randomVideoUrl()?.replace('watch?v=', 'embed/'))

    function showRandomVideo() {
        setRandomVideoUrl(props.playlist.videos[Math.floor(Math.random() * props.playlist.videos.length)].url)
    }

    return <>
        <tr>
            <td>
                <input type="checkbox" class="checkbox" checked={props.selected} onClick={props.onSelectionToggle}/>
            </td>
            <td>{props.playlist.name}</td>
            <td>{props.playlist.videos.length}</td>
            <td>
                <button class="btn btn-square btn-outline gap-1" title="Play Random Video" onClick={showRandomVideo}>
                    <FaSolidPlay/>
                    <FaSolidShuffle/>
                </button>
            </td>
        </tr>

        <Show when={randomEmbedUrl()}>
            {(url) => <tr>
                <td colspan={4} class="text-center">
                    <iframe
                        class="w-full aspect-video"
                        src={url() + '?autoplay=1'}
                        sandbox="allow-scripts allow-same-origin allow-popups"
                        allowfullscreen
                        allow="autoplay"
                    />
                    <button class="btn btn-error text-lg mt-2" onClick={() => setRandomVideoUrl(undefined)}>Close</button>
                </td>
            </tr>}
        </Show>
    </>
}

export default PlaylistTableRow
