import type { Component } from 'solid-js'
import { IoOpenOutline } from 'solid-icons/io'
import FileUpload from "./FileUpload"

const App: Component = () => {
  return (
    <div class="hero mt-20 bg-base-200">
      <div class="hero-content text-center">
        <div class="max-w-2xl">
          <h1 class="text-5xl font-bold">YouTube Activity Export</h1>
          <p class="py-6 text-lg">
            This is a simple tool to view and export videos from the YouTube activity log.
            It enables exporting a list of liked videos, even if the length is over 5,000 (YouTube API limit).
          </p>
          <h2 class="text-3xl font-semibold mb-2">Instructions</h2>
          <div class="w-fit mx-auto text-lg text-left">
            <ol class="list-decimal pl-8">
              <li>Go to <a href="https://takeout.google.com/" class="underline" target="_blank" rel="noopener noreferrer"><span class="underline">Google Takeout </span><IoOpenOutline class="inline"/></a></li>
              <li>Under "Create a new export", click "Deselect all"</li>
              <li>
                Scroll down to "My Activity", select its checkbox, and underneath...
                <ol class="list-decimal pl-8">
                  <li>click "Multiple formats" then for "Activity Records", select "JSON" as the format and click "OK"</li>
                  <li>click "All activity data included" then click "Deselect all" and select just "YouTube" then click "OK"</li>
                </ol>
              </li>
              <li>
                Scroll down to "YouTube and YouTube Music", select its checkbox, and underneath click "All YouTube data included" then click "Deselect all" and select just "playlists" then click "OK"
              </li>
              <li>Click "Next Step"</li>
              <li>Leave the settings on their defaults (export once, file type zip, file size 2GB)</li>
              <li>Click "Create Export" and wait for the email indicating your data download is ready! For my data, it took about 10 minutes.</li>
            </ol>
          </div>
          <div class="divider"/>
          <FileUpload/>
        </div>
      </div>
    </div>
  );
};

export default App;
