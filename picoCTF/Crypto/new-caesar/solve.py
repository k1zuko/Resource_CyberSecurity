import string

LOWERCASE_OFFSET = ord("a")
ALPHABET = string.ascii_lowercase[:16]

# def b16_encode(plain):
# 	enc = ""
# 	for c in plain:
# 		binary = "{0:08b}".format(ord(c))
# 		enc += ALPHABET[int(binary[:4], 2)]
# 		enc += ALPHABET[int(binary[4:], 2)]
# 	return enc

# def shift(c, k):
# 	t1 = ord(c) - LOWERCASE_OFFSET
# 	t2 = ord(k) - LOWERCASE_OFFSET
# 	return ALPHABET[(t1 + t2) % len(ALPHABET)]

# flag = "redacted"
# key = "redacted"
# assert all([k in ALPHABET for k in key])
# assert len(key) == 1

# b16 = b16_encode(flag)
# enc = ""
# for i, c in enumerate(b16):
# 	enc += shift(c, key[i % len(key)])
# print(enc)

def b16_decode(cipher):
    dec = ""
    for c in range(0, len(cipher), 2):
        b = ""
        b += "{0:04b}".format(ALPHABET.index(cipher[c]))
        b += "{0:04b}".format(ALPHABET.index(cipher[c + 1]))
        
        dec += chr(int(b, 2))
    return dec

def unshift(c, k):
    t1 = ord(c) - LOWERCASE_OFFSET
    t2 = ord(k) - LOWERCASE_OFFSET
    return ALPHABET[(t1 - t2) % len(ALPHABET)]

enc = "mlnklfnknljflfmhjimkmhjhmljhjomhmmjkjpmmjmjkjpjojgjmjpjojojnjojmmkmlmijimhjmmj"

for key in ALPHABET:
    s = ""
    
    for i, c in enumerate(enc):
        s += unshift(c, key[i % len(key)])
        
    s = b16_decode(s)
    
    print(s)