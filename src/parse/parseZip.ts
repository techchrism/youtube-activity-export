import uzip from 'uzip'
import Papa from 'papaparse'

type Entries<T> = {
    [K in keyof T]: [K, T[K]]
}[keyof T][]

type Keys<T> = Array<keyof T>

// Subset of observed data in the MyActivity.json file
type YouTubeActivityData = Array<{
    header: string
    title: string,
    titleUrl: string
    time: string
}>

export interface ParsedZip {
    playlists: {
        name: string,
        videos: {
            url: string
            added: Date
        }[]
    }[]
}

const PLAYLIST_PREFIX = 'Takeout/YouTube and YouTube Music/playlists/'
const PLAYLIST_SUFFIX = '-videos.csv'
const PLAYLIST_CSV_COLUMN_NAMES = {
    id: 'Video ID',
    timestamp: 'Playlist Video Creation Timestamp'
}
const ACTIVITY_JSON_PATH = 'Takeout/My Activity/YouTube/MyActivity.json'
const ACTIVITY_TITLE_PREFIX_PLAYLISTS = {
    'Watched ': 'Watched videos',
    'Liked ': 'Liked videos',
    'Disliked ': 'Disliked videos'
} as const

type ActivityPlaylists = Record<keyof typeof ACTIVITY_TITLE_PREFIX_PLAYLISTS, {
    videos: ParsedZip['playlists'][number]['videos'],
    existingUrls: Set<string>
}>

export function parseArrayBuffer(buffer: ArrayBuffer) {
    const zipData = uzip.parse(buffer)
    const playlists: ParsedZip['playlists'] = []

    // Parse regular playlists
    for(const [playlistFilePath, playlistCsvFile] of Object.entries(zipData).filter(([path]) => path.startsWith(PLAYLIST_PREFIX) && path.endsWith(PLAYLIST_SUFFIX))) {
        const playlistName = playlistFilePath.substring(PLAYLIST_PREFIX.length, playlistFilePath.length - PLAYLIST_SUFFIX.length)
        const csvContent = new TextDecoder().decode(playlistCsvFile)

        const table = Papa.parse(csvContent, {
            delimiter: ',',
            header: true,
            skipEmptyLines: true
        }).data

        const videos: ParsedZip['playlists'][number]['videos'] = table.map(row => {
            if(!row.hasOwnProperty(PLAYLIST_CSV_COLUMN_NAMES.id) || !row.hasOwnProperty(PLAYLIST_CSV_COLUMN_NAMES.timestamp)) return null
            return {
                url: 'https://www.youtube.com/watch?v=' + row[PLAYLIST_CSV_COLUMN_NAMES.id],
                added: new Date(row[PLAYLIST_CSV_COLUMN_NAMES.timestamp])
            }
        }).filter(item => item !== null)

        playlists.push({
            name: playlistName,
            videos
        })
    }

    // Parse activity json
    if(zipData.hasOwnProperty(ACTIVITY_JSON_PATH)) {
        const activityData = JSON.parse(new TextDecoder().decode(zipData[ACTIVITY_JSON_PATH])) as YouTubeActivityData

        const vids: ActivityPlaylists = (Object.keys(ACTIVITY_TITLE_PREFIX_PLAYLISTS) as Keys<typeof ACTIVITY_TITLE_PREFIX_PLAYLISTS>).reduce((result, prefix) => {
            result[prefix] = {
                videos: [],
                existingUrls: new Set<string>()
            };
            return result
        }, {}) as ActivityPlaylists

        for(const item of activityData.filter(item => item.header === 'YouTube')) {
            for(const prefix of (Object.keys(ACTIVITY_TITLE_PREFIX_PLAYLISTS) as Keys<typeof ACTIVITY_TITLE_PREFIX_PLAYLISTS>)) {
                if(item.title.startsWith(prefix) && !vids[prefix].existingUrls.has(item.titleUrl)) {
                    vids[prefix].existingUrls.add(item.titleUrl)
                    vids[prefix].videos.push({
                        url: item.titleUrl,
                        added: new Date(item.time)
                    })
                    break
                }
            }
        }

        for(const [prefix, name] of Object.entries(ACTIVITY_TITLE_PREFIX_PLAYLISTS) as Entries<typeof ACTIVITY_TITLE_PREFIX_PLAYLISTS>) {
            playlists.push({
                name,
                videos: vids[prefix].videos
            })
        }
    }
    return {playlists}
}

export async function parseZip(zip: File): Promise<ParsedZip> {
    return parseArrayBuffer(await zip.arrayBuffer())
}
