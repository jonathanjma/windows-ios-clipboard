# Windows-iOS Clipboard

A universal clipboard that allows for easier copying and pasting of text, images, and files across different operating systems (ex. Windows-iOS, Linux-iOS, Windows-Linux, etc).

## How to Use
1. Download the
   - Python script (for Windows, Linux, macOS):
     - Download ```win-ios-clipboard.zip``` from the [releases page](https://github.com/jonathanjma/windows-ios-clipboard/releases/latest)
     - If Python is not installed on your computer, download the latest version [here](https://www.python.org/downloads/) and install it
   - Apple shortcut (for iOS, iPadOS, macOS):
     - _Clipboard Copy_ shortcut: https://www.icloud.com/shortcuts/200add8cdf1a4a32b46fd9aaa57f77ab
     - _Clipboard Paste_ shortcut: https://www.icloud.com/shortcuts/bae2c9978bad4c1fb9356c743b518992
2. Unzip the Python script and/or add the Apple shortcut to the Shortcuts app
3. Enter your email and create a password in the appropriate fields
   - Python script: open ```desktop_script.py``` in any text editor and save the file when you are done
   - Shortcuts: click 3 dots in the top-right corner of the _Copy_ **and** _Paste_ shortcut tiles
4. To run the clipboard
   - Python script: Run the ```run_clipboard.cmd``` script for windows or ```run_clipboard.sh``` for Linux/macOS
     - This should create a tray icon you can right-click to copy and paste from your clipboard
   - Shortcuts: 
     - Tap on the appropriate _Copy_ or _Paste_ shortcut in the Shortcuts app (or see below for adding them to your home screen)
     - Access the _Copy_ shortcut from the Apple Share Sheet
5. Optional usability improvements
   - Python script: To configure the clipboard to automatically start on windows startup, navigate to ```shell:startup``` in Windows Explorer
     and create a ```.cmd``` file with the contents ```start pythonw <path to desktop_script.py>``` (make sure to substitute the correct filepath).
   - Shortcuts: To add the shortcuts to your home screen for easy access, enter the edit shortcut screen. 
     Then, click the name of the shortcut at the top of the screen and click 'Add to Home Screen'.

## API Info
Information about the Windows-iOS Clipboard API is provided below 
(useful if you would like to implement an API client in another language)

- Base URL: https://win-ios-clipboard.web.app
- Authentication: Basic HTTP authentication required 
  - ```Authorization``` header set to ```Basic ``` followed with the base64 encoded string ```<username>:<password>```

### Endpoints
/api (GET)
- Shows basic API info (ex. name, version, author)

/paste (GET)
- Returns the last value copied onto the clipboard
- Data is returned in 2 ways depending on the last copied value:
  - Text: returned with ```Content-Type: application/json``` (so JSON format) under the key ```value```
    - example: ```{'value': <latest clipboard value>}```
  - File: returned in the body of the HTTP response with the ```Content-Type``` header set to the MIME type of the copied file
    - the ```File-Extension``` header is set to the file extension of the copied file
    - example: if a PNG file was the last copied value, ```Content-Type: image/png``` and the image would be sent in the body of the response

/copy (POST)
- Updates the latest clipboard entry
- Data must be sent using ```Content-Type: multipart/form-data```:
  - Text should be sent under the key ```value```
  - Files should be sent under the key ```value```
- Notes:
  - If both text and a file is sent, only the text is copied to the clipboard
  - Only 1 file can be sent at a time
  - File size limit is 10 MB
