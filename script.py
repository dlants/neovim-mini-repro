import msgpack
import socket
import os

def send_to_nvim(sock_path):
    # Read the test files
    with open('./fixtures/file-small.ts', 'r') as f:
        small_lines = f.read().splitlines()

    with open('./fixtures/file-big.ts', 'r') as f:
        big_lines = f.read().splitlines()

    # Connect to Neovim's socket
    sock = socket.socket(socket.AF_UNIX, socket.SOCK_STREAM)
    sock.connect(sock_path)

    # Format RPC messages
    small_msg = msgpack.packb([0, 1, "nvim_buf_set_lines", [0, 0, -1, False, small_lines]])
    big_msg = msgpack.packb([0, 2, "nvim_buf_set_lines", [0, 0, -1, False, big_lines]])

    print("Sending small message...")
    sock.sendall(small_msg)

    print("Sending large message...")
    sock.sendall(big_msg)

    # Try to read response
    response = sock.recv(4096)
    print(f"Response: {msgpack.unpackb(response)}")

    sock.close()

if __name__ == "__main__":
    sock_path = os.environ.get("NVIM")
    if not sock_path:
        print("NVIM socket path not found in environment")
        exit(1)

    send_to_nvim(sock_path)
