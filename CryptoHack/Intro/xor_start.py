from pwn import xor

flag = xor(b'label', 13).decode()

print('crypto{'+ flag + '}')