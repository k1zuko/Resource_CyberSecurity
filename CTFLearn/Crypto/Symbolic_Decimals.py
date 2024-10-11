sym = "^&,*$,&),!@#,*#,!!^,(&,!!$,(%,$^,(%,*&,(&,!!$,!!%,(%,$^,(%,&),!!!,!!$,(%,$^,(%,&^,!)%,!)@,!)!,!@%"
asc = ''
for i in range(len(sym)):
    if sym[i] == '!':
        asc = asc + '1'
    elif sym[i] == '@':
        asc = asc + '2'
    elif sym[i] == '#':
        asc = asc + '3'
    elif sym[i] == '$':
        asc = asc + '4'
    elif sym[i] == '%':
        asc = asc + '5'
    elif sym[i] == '^':
        asc = asc + '6'
    elif sym[i] == '&':
        asc = asc + '7'
    elif sym[i] == '*':
        asc = asc + '8'
    elif sym[i] == '(':
        asc = asc + '9'
    elif sym[i] == ')':
        asc = asc + '0'
    else:
        asc = asc + ' '
temp = asc.split()
print("Decode this to ascii:", temp)
res = ''
for j in temp:
    res = res + chr(int(j))
print("Nih hasilnya:", res)