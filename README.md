# Windows-iOS Clipboard

A universal clipboard that allows for easier copying and pasting across different operating systems (ex. windows-iOS, linux-iOS, windows-linux, etc).

### How to Use
1. Download the
   - Python script (for windows, linux, macOS):
     - Download the ```win-ios-clipboard.zip``` zipped folder from the [releases page](https://github.com/jonathanjma/windows-ios-clipboard/releases/latest)
   - Apple shortcut (for iOS, iPadOS, macOS):
     - Get latest item shortcut: https://www.icloud.com/shortcuts/fe83120edd414803a5c38c4f565e39bd
     - Push new item shortcut: https://www.icloud.com/shortcuts/c3dec9a5b76d4b069b2ffbaa1a6a649d
2. Unzip the python script and/or add the apple shortcut to the Shortcuts app
3. Enter your email and create a password in the appropriate fields
   - Python script: open ```desktop_script.py``` in any text editor and save the file when you are done
   - Shortcuts: click 3 dots in the top-right corner of the Push **and** Get shortcuts
4. To run the clipboard
   - Python script: Open the ```run_clipboard.cmd``` file for windows or ```run_clipboard.sh``` for linux/macOS
     - this should create a tray icon you can right-click to get the latest or push a new clipboard entry
   - Shortcuts: 
     - tap on the appropriate Get or Push shortcut in the Shortcuts app (or see below for adding them to your home screen)
     - access the Push shortcut in the Apple Share Sheet
5. Optional usability improvements
   - Python script: you can have the clipboard auto start on windows startup by navigating to ```shell:startup``` in windows explorer and creating a ```.cmd``` file with the contents ```start pythonw <path of desktop_script.py>``` (make sure to substitute the correct filepath)
   - Shortcuts: to add the shortcuts to your home screen for easy access, you can find that option by clicking on the icon right next to the 'x' or 'Done' button in the edit shortcut view

### API Info 
(if you would like to implement a client in another language)

All endpoints
- Base url: https://win-ios-clipboard.web.app
- Authentication: basic http authentication required (adding an 'authorization' header with the format- ```Basic username:password```)
  - 403 unauthorized returned if authentication not successful
- Must use POST request

/api
- shows basic api info (name, version, author)

/get
- returns latest clipboard entry in json format under the key ```latest_value```
  - for example: ```{'latest_value': <latest clipboard value>}```

/push
- updates latest clipboard entry
- new clipboard entry show be a json payload with the value under the key ```value```
  - for example: ```{'value': <new clipboard value>}```