import pyclip
import requests
import pystray
import PIL.Image
import time
from datetime import datetime

'''
enter your email (does not have to be your real one) and a password (can be anything you want) below
'''
email = 'sus_elephant@gmail.com'
password = 'sussyamogus'

''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''

def get_clipboard():
    global icon, email, password
    start = datetime.now()
    clip_response = requests.post('https://win-ios-clipboard.web.app/get', auth=(email, password))
    if clip_response.status_code == 200:
        clip_response = clip_response.json()['latest_value']
        print(f'\nClipboard Get took {(datetime.now()-start).microseconds/1000} ms')

        print(clip_response)
        icon.notify('Received Item: ' + clip_response[:200], title='Windows-iOS Clipboard')

        pyclip.copy(clip_response)
    else:
        print(f'Error {clip_response.status_code}')
        icon.notify('**An error has occurred** \nMake sure your email and password have been entered correctly',
                    title='Windows-iOS Clipboard')

def push_clipboard():
    global icon, email, password
    clip_in = pyclip.paste()

    start = datetime.now()
    clip_response = requests.post('https://win-ios-clipboard.web.app/push', auth=(email, password),
                                  data={'value': clip_in})
    if clip_response.status_code == 200:
        clip_response = clip_response.json()['latest_value']
        print(f'\nClipboard Push took {(datetime.now()-start).microseconds/1000} ms')

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

print('Starting clipboard...')

image = PIL.Image.open('clipboard.png')

menu = pystray.Menu(
    pystray.MenuItem('Get Clipboard', get_clipboard),
    pystray.MenuItem('Push Clipboard', push_clipboard),
    pystray.Menu.SEPARATOR,
    pystray.MenuItem('Quit', quit)
)

icon = pystray.Icon('Windows-iOS Clipboard', image, 'Windows-iOS Clipboard', menu)
icon.run()
