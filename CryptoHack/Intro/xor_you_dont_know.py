from pwn import xor

raw = '0e0b213f26041e480b26217f27342e175d0e070a3c5b103e2526217f27342e175d0e077e263451150104'
byte = bytes.fromhex(raw)

key = xor(byte, b"crypto{")
flag = xor(byte, b"myXORkey")

print(key.decode())
print(flag.decode())