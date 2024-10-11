import hashlib
import binascii
from pwn import log

salt = binascii.unhexlify('227d873cca89103cd83a976bdac52486')
key = '97907280dc24fe517c43475bd218bfad56c25d4d11037d8b6da440efd4d691adfead40330b2aa6aaf1f33621d0d73228fc16'
dklen = 50
iterations = 50000

def hash(password, salt, iterations, dklen):
    hashValue = hashlib.pbkdf2_hmac(
        hash_name='sha256',
        password=password,
        salt=salt,
        iterations=iterations,
        dklen=dklen
    )
    return hashValue

# Crack
dict = '/usr/share/seclists/Passwords/Leaked-Databases/rockyou.txt'
bar = log.progress('Cracking PBKDF2')
with open(dict, 'r', encoding='utf-8') as f:
    for line in f:
        password = line.strip().encode('utf-8')
        hashValue = hash(password, salt, iterations, dklen)
        target = binascii.unhexlify(key)
        
        bar.status(f'Trying: {password}, hash: {hashValue}')
        if hashValue == target:
            bar.success(f'Found password: {password}')
            break
        
    bar.failure('Hash is not crackable.')