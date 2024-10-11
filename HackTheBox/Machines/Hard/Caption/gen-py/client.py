from thrift import Thrift
from thrift.transport import TSocket, TTransport
from thrift.protocol import TBinaryProtocol
from log_service import LogService

def main():
    transport = TSocket.TSocket('localhost', 9090)
    
    transport = TTransport.TBufferedTransport(transport)
    
    protocol = TBinaryProtocol.TBinaryProtocol(transport)
    
    client = LogService.Client(protocol)
    
    transport.open()
    
    try:
        log_file_path = "/tmp/malicious.log"
        
        response = client.ReadLogFile(log_file_path)
        print("Server response:", response)
        
    except Thrift.TException as tx:
        print(f"Thrift execption: {tx}")
    
    transport.close()
    
if __name__ == '__main__':
    main()
