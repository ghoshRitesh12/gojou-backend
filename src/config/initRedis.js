import redis from 'redis';

const client = redis.createClient({
  port: 6379,
  host: '127.0.0.1'
});

client.on('ready', () => {
  console.log('📝 ready to use redis'); 
})

client.on('error', err => {
  console.log(err.message); 
})

client.on('end', err => {
  console.log('redis disconnected'); 
})

process.on('SIGINT', () => {
  client.quit();
})


export default client
