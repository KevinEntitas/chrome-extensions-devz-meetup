const { stdin, stdout } = process;
const fs = require('fs');

const snippetsPath = "/Users/kevinbogdan/Library/Application Support/Code/User/snippets/javascript.json"

const getSnippetData = () => {
  return fs.readFileSync(snippetsPath).toString()
}

const logFile = fs.createWriteStream(
  "/Users/kevinbogdan/dev/chrome-extension/devz-demo/vs-snippet-saver/native/native-host.log",
  { flags: 'a' }
);

function log(message) {
  const timestamp = new Date().toISOString();
  logFile.write(`${timestamp}: ${message}\n`);
}

log("Started host...")

let buffer = Buffer.alloc(0);

stdin.on('data', (chunk) => {
  buffer = Buffer.concat([buffer, chunk]);

  while (buffer.length >= 4) {
    const messageLength = buffer.readUInt32LE(0);

    if (buffer.length >= 4 + messageLength) {
      const messageBuffer = buffer.slice(4, 4 + messageLength);
      let message;

      try {
        message = JSON.parse(messageBuffer.toString('utf8')).snippet;
        log(`Received message ${JSON.stringify(message)}`)
        const snippetString = getSnippetData()
        log(snippetString)
        const snippet = JSON.parse(snippetString)
        log(JSON.stringify(snippet))
        snippet[message.title] = {
          "prefix": [
            message.prefix
          ],
          "body": [
            message.content
          ],
          "description": message.desc
        }
        log(JSON.stringify(snippet))
        try {
          fs.writeFileSync(snippetsPath, JSON.stringify(snippet))
        } catch (error) {
          log(`error ${error.message}`)
        }

      } catch (error) {
        log(`error ${error.message}`)
        process.stderr.write('Error parsing message: ' + error.message + '\n');
        buffer = buffer.slice(4 + messageLength);
        continue;
      }

      const response = { message: "ACK" };
      sendMessage(response);

      buffer = buffer.slice(4 + messageLength);
    } else {
      break;
    }
  }
});

stdin.on('end', () => {
  process.exit(0);
});

function sendMessage(message) {
  const json = JSON.stringify(message);
  const jsonBuffer = Buffer.from(json, 'utf8');
  const header = Buffer.alloc(4);
  header.writeUInt32LE(jsonBuffer.length, 0);
  stdout.write(header);
  stdout.write(jsonBuffer);
}