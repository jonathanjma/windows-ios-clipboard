import win32clipboard
import requests
import pystray
import PIL.Image
import time
from datetime import datetime

username = 'sus_elephant@gmail.com'
password = 'sussyamogus'

def get_clipboard():
    global icon, username, password
    start = datetime.now()
    clip_response = requests.post('https://win-ios-clipboard.web.app/get', auth=(username, password))
    if clip_response.status_code == 200:
        clip_response = clip_response.json()['latest_value']
        print(f'Clipboard Get took {(datetime.now()-start).microseconds/1000} ms')

        print(clip_response)
        icon.notify('Received Item: ' + clip_response[:200], title='Windows-iOS Clipboard')

        win32clipboard.OpenClipboard()
        win32clipboard.EmptyClipboard()
        win32clipboard.SetClipboardText(clip_response)
        win32clipboard.CloseClipboard()
    else:
        print(f'Error {clip_response.status_code}')
        icon.notify('**An error has occurred** \nMake sure your email and password have been entered correctly',
                    title='Windows-iOS Clipboard')

def push_clipboard():
    global icon, username, password
    win32clipboard.OpenClipboard()
    clip_in = win32clipboard.GetClipboardData()
    win32clipboard.CloseClipboard()

    start = datetime.now()
    clip_response = requests.post('https://win-ios-clipboard.web.app/push', auth=(username, password),
                                  data={'value': clip_in})
    if clip_response.status_code == 200:
        clip_response = clip_response.json()['latest_value']
        print(f'Clipboard Push took {(datetime.now()-start).microseconds/1000} ms')

        print(clip_response)
        icon.notify('Copied Item: ' + clip_response[:200], title='Windows-iOS Clipboard')
    else:
        print(f'Error {clip_response.status_code}')
        icon.notify('**An error has occurred** \nMake sure your email and password have been entered correctly',
                    title='Windows-iOS Clipboard')

def quit():
    global icon
    icon.notify('Quitting', title='Windows-iOS Clipboard')
    time.sleep(3)
    icon.stop()

image = PIL.Image.open('clipboard.png')

menu = pystray.Menu(
    pystray.MenuItem('Get Clipboard', get_clipboard),
    pystray.MenuItem('Push Clipboard', push_clipboard),
    pystray.Menu.SEPARATOR,
    pystray.MenuItem('Quit', quit)
)

icon = pystray.Icon('Windows-iOS Clipboard', image, 'Windows-iOS Clipboard', menu)
icon.run()
