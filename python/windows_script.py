import win32clipboard
import requests
import pystray
import PIL.Image
import time

def get_clipboard():
    global icon
    clip_response = requests.get('https://win-ios-clipboard.web.app/get').json()['latest_value']
    icon.notify('Received Item: ' + clip_response, title='Windows-iOS Clipboard')
    print(clip_response)
    win32clipboard.OpenClipboard()
    win32clipboard.EmptyClipboard()
    win32clipboard.SetClipboardText(clip_response)
    win32clipboard.CloseClipboard()

def push_clipboard():
    global icon
    win32clipboard.OpenClipboard()
    clip_in = win32clipboard.GetClipboardData()
    clip_in = clip_in.replace(' ', '%20')
    win32clipboard.CloseClipboard()
    clip_response = requests.get('https://win-ios-clipboard.web.app/push?value=' + clip_in).json()['latest_value']
    icon.notify('Copied Item: ' + clip_response, title='Windows-iOS Clipboard')
    print(clip_response)

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
