import net from 'net'
import fs from "fs";
import path from "path";
import { Packr, UnpackrStream } from "msgpackr";

async function run() {
  const logFileHandle = fs.createWriteStream("test.log", { flags: "a" });
  logFileHandle.write(`test!\n`);
  process.on("uncaughtException", (error) => {
    logFileHandle.write(`uncaughtException: ${JSON.stringify(error)}`);
    process.exit(1);
  });

  const packr = new Packr({ useRecords: false });
  // These values are set by neovim when starting the bun process
  const ENV = {
    NVIM: process.env["NVIM"],
    DEV: Boolean(process.env["IS_DEV"]),
  };

  if (!ENV.NVIM) throw Error("socket missing");
  const unpackrStream = new UnpackrStream({ useRecords: false });
  const nvimSocket = net.createConnection(ENV.NVIM);

  unpackrStream.on("data", (message: unknown) => {
    (async (msg) => {
      logFileHandle.write(`unpackrStream.data: ${JSON.stringify(msg)}`);
    })(message).catch((err) =>
      logFileHandle.write(`msg handle error: ${JSON.stringify(err)}`),
    );
  });

  let lastReqId = 1;
  const call = (func: string, args: unknown[]) => {
    const reqId = ++lastReqId;
    const request: RPCRequest = [0, reqId, func, args];
    logFileHandle.write(`writing to nvimSocket: ${JSON.stringify(request)}\n`),
      nvimSocket.write(packr.pack(request) as unknown as Uint8Array);
  };

  const shortFile = fs.readFileSync(
    path.resolve("./fixtures/file-small.ts"),
  );
  const shortLines = shortFile.toString().split("\n");

  const file = fs.readFileSync(
    path.resolve("./fixtures/file-big.ts"),
  );
  const lines = file.toString().split("\n");

  type RPCRequest = [0, id: number, method: string, args: unknown[]];
  call("nvim_buf_set_lines", [0, 0, -1, false, shortLines]);
  call("nvim_buf_set_lines", [0, 0, -1, false, lines]);
  call("nvim_buf_get_lines", [0, 0, -1, false]);

  await new Promise((resolve) => setTimeout(resolve, 1000));
}

run().then(
  () => {
    console.log('success')
    process.exit(0);
  },
  (err) => {
    console.error(err);
    process.exit(1);
  },
);
