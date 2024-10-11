def ExtGCD(a, b):
    if a == 0:
        return b, 0, 1
    
    gcd, x1, y1 = ExtGCD(b % a, a)
    
    x = y1 - (b // a) * x1
    y = x1
    
    return gcd, x, y

print(ExtGCD(26513, 32321))