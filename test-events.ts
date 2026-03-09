
import { OpenClawClient } from './src/lib/openclaw/client';

const client = new OpenClawClient('ws://127.0.0.1:18789', process.env.OPENCLAW_GATEWAY_TOKEN);

console.log('Connecting...');
client.connect().then(() => {
  console.log('Connected.');
  
  // The client emits 'notification' for any event with a method
  client.on('notification', (data) => {
    console.log('\n--- Received Notification ---');
    console.dir(data, { depth: null });
  });

  // Keep alive
  setInterval(() => {}, 1000);
}).catch(console.error);
