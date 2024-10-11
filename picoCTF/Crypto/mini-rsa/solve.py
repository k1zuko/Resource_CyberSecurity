import libnum

c = open("./ciphertext", "r").read().strip().split(" ")[-1] 

e = 3

flag = libnum.nroot(c, e)
print(f"flag: {bytes.fromhex(hex(flag))}")