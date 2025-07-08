const commandRegistry = {
  '/help': 'Displays a list of available commands.',
  '/ping': 'Responds with "pong" to check if the agent is active.',
  '/time': 'Responds with the current server date and time.',
};

function handleCommand(message) {
  const [command] = message.split(' ');

  switch (command) {
    case '/help':
      const helpText = Object.entries(commandRegistry)
        .map(([cmd, desc]) => `${cmd}: ${desc}`)
        .join('\n');
      return `Available commands:\n${helpText}`;
    
    case '/ping':
      return 'pong';

    case '/time':
      return `The current server time is: ${new Date().toLocaleString()}`;

    default:
      return `Unknown command: "${command}". Type /help for a list of available commands.`;
  }
}

export default function handler(req, res) {
  if (req.method === 'POST') {
    const { message } = req.body;
    let reply;

    if (message.startsWith('/')) {
      reply = handleCommand(message);
    } else {
      reply = `I am a simple bot. I only respond to commands starting with "/". Type /help for a list of commands.`;
    }

    res.status(200).json({ reply });
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
