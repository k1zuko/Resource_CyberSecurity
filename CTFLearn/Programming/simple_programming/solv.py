juml = 0
with open('data.dat', 'r') as this:
    for data in this:
        if data.count('0') % 3 == 0 or data.count('1') % 2 == 0:
            juml += 1
    print("jumlah =", juml)
