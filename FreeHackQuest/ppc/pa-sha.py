passwd = ''
i = 0
while len(passwd) <= 9125:
    passwd += str(i + 1)
    i += 1
    
print(passwd)