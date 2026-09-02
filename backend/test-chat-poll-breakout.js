const { io } = require('socket.io-client');

const socket = io('http://localhost:5000', {
  extraHeaders: { 'x-demo-role': 'admin' },
});

socket.on('connect', () => {
  console.log('connected as', socket.id);
  socket.emit('room:join', 'test-room', (ack) => console.log('join ack:', ack));
});

// Chat
socket.on('chat:message', (msg) => console.log('CHAT MESSAGE:', msg));

setTimeout(() => {
  socket.emit('chat:message', { roomName: 'test-room', text: 'hello everyone' }, (ack) =>
    console.log('chat ack:', ack)
  );
}, 1000);

// Poll
socket.on('poll:started', (poll) => console.log('POLL STARTED:', poll));
socket.on('poll:results', (results) => console.log('POLL RESULTS:', results));
socket.on('poll:ended', (data) => console.log('POLL ENDED:', data));

let pollId;
setTimeout(() => {
  socket.emit(
    'poll:create',
    { roomName: 'test-room', question: 'Best language?', options: ['JS', 'Python', 'Go'] },
    (ack) => {
      console.log('poll create ack:', ack);
      pollId = ack.pollId;
    }
  );
}, 2000);

setTimeout(() => {
  socket.emit('poll:vote', { roomName: 'test-room', optionIndex: 1 }, (ack) =>
    console.log('vote ack:', ack)
  );
}, 3000);

setTimeout(() => {
  socket.emit('poll:ended', { roomName: 'test-room' }, (ack) => console.log('poll end ack:', ack));
}, 4000);

// Breakout
socket.on('breakout:started', (data) => console.log('BREAKOUT STARTED:', data));
socket.on('breakout:assign', (data) => console.log('BREAKOUT ASSIGN:', data));
socket.on('breakout:ended', (data) => console.log('BREAKOUT ENDED:', data));

setTimeout(() => {
  socket.emit('breakout:create', { roomName: 'test-room', groupCount: 2 }, (ack) =>
    console.log('breakout create ack:', ack)
  );
}, 5000);

setTimeout(() => {
  socket.emit('breakout:ended', { roomName: 'test-room' }, (ack) =>
    console.log('breakout end ack:', ack)
  );
  setTimeout(() => process.exit(0), 500);
}, 6500);

socket.on('connect_error', (err) => console.log('connection failed:', err.message));