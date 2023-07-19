"""
Enter an email and a password by replacing the text in the "email" and "password" fields below.
Can can be anything you want, just make sure to use the same login info across all your devices.
"""

email = "replace with email"
password = "replace with password"

''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''

import sys
import subprocess

# install dependencies if they are not already installed
deps = ['pyclip', 'pyjpgclipboard', 'pystray', 'Pillow', 'requests', 'pillow-heif']
def setup():
    reqs = str(subprocess.check_output([sys.executable, '-m', 'pip', 'freeze']))
    for dep in deps:
        if dep not in reqs:
            print('installing package: ' + dep)
            subprocess.check_call([sys.executable, '-m', 'pip', 'install', dep])

setup()

import pyclip
import pyjpgclipboard
import requests
import pystray
from PIL import Image, ImageGrab
from pillow_heif import register_heif_opener
from pyclip.win_clip import UnparsableClipboardFormatException
from io import BytesIO
import base64
import time
import tempfile
from datetime import datetime
from pathlib import Path

baseUrl = 'https://win-ios-clipboard.web.app'
# baseUrl = 'http://127.0.0.1:5001/win-ios-clipboard/us-central1/api'

# paste data from clipboard
def clipboard_paste():
    global icon, email, password
    start = datetime.now()
    clip_response = requests.get(baseUrl + '/paste', auth=(email, password))
    if clip_response.status_code == 200:
        content_type = clip_response.headers.get('Content-Type')

        # clipboard has text value
        if 'application/json' in content_type:
            text_value = clip_response.json()['value']
            print(text_value)

            icon.notify('Received Item: ' + text_value[:200])
            pyclip.copy(text_value)

        # clipboard has file value
        else:
            file_ext = clip_response.headers.get('File-Extension')
            file_path = '/paste.' + file_ext
            # if file is image, copy it to the clipboard
            if file_ext in ['png', 'jpg', 'jpeg', 'heic']:
                file_path = tempfile.gettempdir() + file_path
                # read file from http response
                with open(file_path, 'wb') as fd:
                    for chunk in clip_response.iter_content(chunk_size=128):
                        fd.write(chunk)
                # convert file so that it can be copied to the clipboard
                img = Image.open(file_path)
                output = BytesIO()
                img.convert("RGB").save(output, "BMP")
                data = output.getvalue()[14:]
                output.close()
                # save converted file and copy it to the clipboard
                with open(file_path, 'wb') as f:
                    f.write(data)
                pyjpgclipboard.clipboard_load_jpg(file_path)
                icon.notify('Copied image to clipboard')

            # for any other file, save it to the user's downloads folder
            else:
                with open(str(Path.home() / "Downloads") + file_path, 'wb') as fd:
                    for chunk in clip_response.iter_content(chunk_size=128):
                        fd.write(chunk)
                icon.notify('Saved file to downloads folder')

        print(f'\nClipboard Paste took {(datetime.now()-start).microseconds/1000} ms')
    else:
        print(f'Error {clip_response.status_code}')
        icon.notify('**An error has occurred** \nMake sure your email and password have been entered correctly')

# copy new item to the clipboard
def clipboard_copy():
    global icon, email, password
    start = datetime.now()

    # attempt default clipboard paste (works for text and file explorer file copying)
    try:
        clip_in = pyclip.paste()
    except UnparsableClipboardFormatException:
        # use Pillow to paste screenshot from clipboard
        print("pyclip failed, attempting Pillow ImageGrab")
        try:
            img = ImageGrab.grabclipboard()
            img.save(tempfile.gettempdir() + '/copy.png', 'PNG')
            with open(tempfile.gettempdir() + '/copy.png', 'rb') as f:
                clip_in = f.read()
        except TypeError:
            icon.notify("Clipboard Format Unsupported")
            return

    # check if binary file is copied by converting input to text
    # can't tell if a text file is copied because pyclip.paste() only returns file contents
    binary_file = False
    try:
        clip_in.decode("utf-8")
    except UnicodeDecodeError:
        print('binary file')
        binary_file = True

    if not binary_file:
        clip_response = requests.post(baseUrl + '/copy', auth=(email, password),
                                      data={'value': clip_in})
    else:
        clip_response = requests.post(baseUrl + '/copy', auth=(email, password),
                                      files={'value': clip_in})

    if clip_response.status_code == 200:
        clip_response = clip_response.json()['value']
        print(f'\nClipboard Copy took {(datetime.now()-start).microseconds/1000} ms')

        if not binary_file:
            print(clip_response)
            icon.notify('Copied Item: ' + clip_response[:200])
        else:
            icon.notify('Copied file to clipboard')
    else:
        print(f'Error {clip_response.status_code}')
        icon.notify('**An error has occurred** \nMake sure your email and password have been entered correctly')

def quit():
    global icon
    icon.notify('Quitting')
    time.sleep(3)
    icon.stop()

print('Starting clipboard...')

register_heif_opener() # allows Pillow to handle heic files during pasting

# encode icon as base64 to avoid file path issues
image = Image.open(BytesIO(base64.b64decode('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'
                                            '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'
                                            'UCnKGKxqP4MPkkZCOTyKQoDbQ3u6Nu+fNuSAc0GkvIpivSqFRfzKpfBeCocGI4azMjJWQFWQI4CJQyhHCHZCitgVoEChtCsdJyPFZCoQHIDd49Em2yKFWAFdCqA0xQ5cQgxM9qhMw8nYwVYAUkKEHft3X1FyQ3cBGF8upQfbQX4FEV6jfgUhXbsDE3R0RMtTULYZTy7f3PwKQr/tr1kzwPhnr7q5Dthn2TjbI4VYAW0Fchtj0QnjnhdtrYNTsEKsAJZKEBHCLGV+9Qz6PujWRjlrKwAK2BMgUKG0JhgnJoVkKpAW1RMS0I4cMpXaglsjBVgBUZUINbbW5schvK7oYFgSZ6ioFMD/JxSgE6V8CkKU9FQnISQ3wkN6MenKNKLxacoDATRJ0lP7ZjhiRlT4nEmViBrBQLBYDtDmLWMbIAVMK9AWa6o54kZ8/pxTlZAhgKdgXtf2ZXDw1EZWrINVsCUAu2B0oL4DF/QVHbOxAqwAlkpAP4+ygvl53FPaFBGuociGIwfiuYnRQFesjEeDuDvUF5JPq91GZWO72U3qhinz6QA+DsZ+PK8CTF8eo1VYgVYAYsVIO5KC/M6eKeMxcJzcaxAqgJLzqqNMoQcE6yAzQowhDY3ABfvawXi33ZiCH0dA+y8zQq0U/nJjdt0sQJPk+pskXA4jFMD/FmeoXLRh55OfX+HH50KxIMoDiE+vdaEf9TozOj7ZF1dLaKz86TvdRgqAJ2iYAj1hwW4OzEwHC0vDO7Wn5VTsgKsgAwFwF39AIS1pQXPyzDKNlgBVkC/AuDu5QEIx5cXPssL9vrF45SsQLYKEG/g7oUBCC+bUbMzW6OcnxVgBYwpAO4ODkBoLCunZgVYAQkKdCZtpH5b5jj+4xgJxj1vgk5R0MMnKT5p6t7eiEjq4vkAkONg/TAIa0MFG3CR/eVy7HvbCp+i8Hb7WuEdeHs9Wc7AjpmpFcX/wZMzVsjPZfhdAeIMvP1+GISTxhS/4Xdx2H9WwCoFwNvGYRCeP7kibFUFuBxWwOcKtIK3gUO8gzZwYxvNPp+Lw+6zAsoVAGdvphYyCMKZVaHVymvABbACPlcAnD2QKsGgz9+fVVP6+KaGtl+DVJ/LNLL7fIoivT58ikIbG5qUWTF/8qCecBCEGKd23fz0VhqrMoUj6MmnKNKLw6cotCFEikNDUw2DraSo4K+6THEiVoAVMKwA+Bq2CjEMwjmVRbfxeqFhbTkDK6CpAHE1r7r4V5o94fK6ie9qWuMErAArYEoBfGJ0kyaEiQT7TZXAmVgBVmAkBTan+2XaCZh5tWWrWEtWgBWQqwC4+td0FtPe0Isp1OcxS0rfnpFbC49Y49MC6RuSdckc4Imliad1Q5hIWI9/TvYIN1Ld4FMUUuX0i7GMB+czdnXoOr/tF3XYT1ZAtQLg6Z5MZWSEEEPSF3ipQnXTsH0/KJAYiv6XYQgpA94J/+YHkdhHVkClAuBoxGOCI8681I0b9XXuDVU2D9v2ugLEDzi6dSQ/R4QQC4vbvC4S+8cKKFagCxxtNQ0hZcS3MB5VXEk2zwp4VgHwc7+Wc5oLgZ89o2IVD0m1ZOTfswLDFSBuFk2r/ImWNpoQLphSSXeoDTt+oWWYf88KsAJiG44HRrR00ISQDFw+vWox94ZaUvLvWYFPFCBePjNp9HV6NNEFIe7V3gFjrXoMchpWgBWIK9CMCZkterTQBSEZwor/tXoMchpWgBWI8/ItvTrohpA2daOL7ddrmNOxAn5VAJz0gJf/1uu/bgjJ4Ozq0C16DXM6VsCvCpxZUXyDEd8NQbjyoikP8gSNEXk5rd8UAB8dNy2c+pgRvw1BmOgNv2mkAE7LCvhJAfSC3zfqr2EI0RuuBe29Rgvi9KyA1xUAFzH0gmuM+mkYwkRv+FWjBXF6VsDrCmDOZIUZH01BiN7wKVAfv+qXH1aAFRACPBwFF4+b0cIUhFQQdtFcwJM0ZiTnPF5TgDgADxea9Svth570GMMumoY7/7h9PdIu0JPerjQ9rY2iu4+XN+3SP9tyA+Gj2ZpQnh+HdjeCB9M3mpmGkDxbOqvmknXvH+m24qtsfTnGqxooKBPvrL1DeSNwAWoVOOv0CYYLMBMvhgtBBuoFl59z2qezuc7MeGSn1BQnLCL3vrLr57jr/i4zDhjJ0xkoEWOMZEikLSkdIyIQih93KlBg8rObFC9WPDgv+ENwkNVqgel3wqSDd39u+t30Uqra4ePBGpErGCbVOnvBPsUJxYvqB3Hfgvj/abblZA0hVQBHNupUTtIUxnrE/raCbH3l/D5SgOKF4kbVkziqdLEM+1IgxJGNQ3gv/K2MCmWysTFWIaK4NjGHe0OVMrveNsUHxQnFi8oH8f4S4v4DGWVIgZAqsvrK2Svw16FVRqUy2Xg/diYPSVUK7AHbNBSlOFH50GkixPsSWWVkNTEztBI4Q3UBrtvepWK2NJQrxHPROeKcwG7Dvpt9uTdcEGewXQHqBZ+LzREULyqe+B2DtWWLZNqWCiHOUO3G2iENS78ms5JJW50iT7wVO1dcim8S9+H/63kmVVozS6anLpxGrQJ5iI'
                                            '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')))

# setup and start tray icon
menu = pystray.Menu(
    pystray.MenuItem('Clipboard Copy', clipboard_copy),
    pystray.MenuItem('Clipboard Paste', clipboard_paste),
    pystray.Menu.SEPARATOR,
    pystray.MenuItem('Quit', quit)
)

icon = pystray.Icon('Windows-iOS Clipboard', image, 'Windows-iOS Clipboard', menu)
icon.run()
