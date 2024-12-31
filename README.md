To repro:

- set up [bun](https://bun.sh/)
- install deps `bun install`
- start neovim with the minimal config `nvim -n --clean -u minimal-init-test.lua`

The script [index.ts](https://github.com/dlants/neovim-mini-repro/blob/main/index.ts) reads the two fixture files (short and long), and attemts to send them into the current buffer via nvim_buf_set_lines.

Observe that the nvim window contains the contents of the short file, not the long file. This is because the first set_lines command succeeds but the second one does not.

Observe the test.log file, which contains messages sent to nvim_buf_set_lines with the contents of the short & long file, an ack of the short write, but no ack of the long write or any subsequent commands (get_lines)
