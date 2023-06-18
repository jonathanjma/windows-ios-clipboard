# Windows-iOS Clipboard

A universal clipboard that allows for easier copying and pasting across different operating systems (ex. windows-iOS, linux-iOS, windows-linux, etc).

## How to Use
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

## API Info
Information about the Windows-iOS Clipboard API is provided below 
(useful if you would like to implement an API client in another language)

- Base url: https://win-ios-clipboard.web.app
- Authentication: Basic HTTP authentication required 
  - ```Authorization``` header with the base64 encoded string ```Basic <username>:<password>```

### Endpoints
/api (GET)
- Shows basic API info (ex. name, version, author)

/paste (GET)
- Returns the last value copied onto the clipboard
- Data is returned in 2 ways depending on the last copied value:
  - Text: returned with ```Content-Type: application/json``` (so JSON format) under the key ```value```
    - example: ```{'value': <latest clipboard value>}```
  - File: returned in the body of the HTTP response with the ```Content-Type``` header set to the MIME type of the copied file
    - example: if a PNG file was the last copied value, ```Content-Type: image/png``` and the image would be sent in the body of the response

/copy (POST)
- Updates the latest clipboard entry
- Data must be sent using ```Content-Type: multipart/form-data```:
  - Text should be sent under the key ```value```
  - Files should be sent under the key ```value```
- Notes:
  - If both text and a file is sent, only the text is copied to the clipboard
  - Only 1 file can be sent at a time
  - Max file size limit is 10 MB