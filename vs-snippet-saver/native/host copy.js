#!/usr/bin/env node
console.log("Host is running...", __dirname)

const fs = require('fs');
const path = require('path');

// Setup logging to file for debugging
const logFile = fs.createWriteStream(
  path.join("/Users/kevinbogdan/dev/chrome-extension/devz-demo/vs-snippet-saver/native", 'native-host.log'),
  { flags: 'a' }
);

function log(message) {
  const timestamp = new Date().toISOString();
  logFile.write(`${timestamp}: ${message}\n`);
}

// Function to read messages from Chrome
function readMessage() {
  return new Promise((resolve) => {
    // First 4 bytes are the length of the message
    const stdin = process.stdin;
    const buffer = Buffer.alloc(4);

    stdin.read(4, (err, bytesRead, buf) => {
      if (bytesRead !== 4) {
        resolve(null);
        return;
      }

      const messageLength = buf.readUInt32LE(0);
      const messageBuffer = Buffer.alloc(messageLength);

      stdin.read(messageLength, (err, bytesRead, buf) => {
        if (bytesRead !== messageLength) {
          resolve(null);
          return;
        }

        const message = JSON.parse(buf.toString('utf8'));
        resolve(message);
      });
    });
  });
}

// Function to send messages to Chrome
function sendMessage(message) {
  try {
    const messageBuffer = Buffer.from(JSON.stringify(message));
    const headerBuffer = Buffer.alloc(4);
    headerBuffer.writeUInt32LE(messageBuffer.length, 0);

    process.stdout.write(headerBuffer);
    process.stdout.write(messageBuffer);

    log(`Sent message: ${JSON.stringify(message)}`);
  } catch (error) {
    log(`Error sending message: ${error}`);
  }
}

// Main message handling loop
async function main() {
  try {
    log('Native host started');

    // Make stdin not close on EOF
    process.stdin.resume();
    process.stdin.setEncoding('utf8');

    while (true) {
      const message = await readMessage();
      if (!message) {
        log('No message received, continuing...');
        continue;
      }

      const response = {
        echo: message,
        timestamp: new Date().toISOString()
      };

      sendMessage(response);
    }
  } catch (error) {
    log(`Fatal error: ${error}`);
    process.exit(1);
  }
}

// Handle process events
process.on('uncaughtException', (error) => {
  log(`Uncaught exception: ${error}`);
});

process.on('exit', (code) => {
  log(`Process exiting with code: ${code}`);
});

// Start the host
main();