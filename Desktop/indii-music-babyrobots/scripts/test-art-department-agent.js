
import { PrismaClient } from '@prisma/client';
import fetch from 'node-fetch';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting Art Department agent test...');

  // 1. Create a dummy user and track
  const user = await prisma.user.create({
    data: {
      email: `test-user-${Date.now()}@example.com`,
      passwordHash: 'password',
      profileType: 'artist',
      artistProfile: {
        create: {
          artistName: 'The Test Crew',
        },
      },
    },
  });

  const track = await prisma.track.create({
    data: {
      title: 'Cybernetic Dreams',
      mood: 'futuristic',
      genre: 'Synthwave',
      artistId: user.id,
    },
  });

  console.log(`Created user ${user.id} and track ${track.id}`);

  // 2. Create a task for the agent
  const task = await prisma.task.create({
    data: {
      title: `Generate album art concepts for "${track.title}"`,
      userId: user.id,
      projectId: track.id, // Using projectId to link to the track
      agentId: 'art_department',
    },
  });

  console.log(`Created task ${task.id} for agent 'art_department'`);

  // 3. Trigger the AI agent via the API
  console.log('Invoking /api/ai endpoint...');
  const response = await fetch('http://localhost:3000/api/ai', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ taskId: task.id }),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`API call failed with status ${response.status}: ${errorBody}`);
  }

  console.log('API call successful. Waiting for task completion...');

  // 4. Poll for the result
  let updatedTask;
  for (let i = 0; i < 10; i++) {
    await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second
    updatedTask = await prisma.task.findUnique({ where: { id: task.id } });
    if (updatedTask.status === 'completed') {
      console.log('Task completed successfully!');
      break;
    }
  }

  // 5. Verify the result
  if (updatedTask.status !== 'completed' || !updatedTask.result) {
    console.error('Test Failed: Task was not completed or has no result.');
    console.log('Final task state:', updatedTask);
  } else {
    console.log('Test Passed!');
    console.log('Generated Concepts:', updatedTask.result.concepts);
  }

  // Cleanup
  await prisma.track.delete({ where: { id: track.id } });
  await prisma.user.delete({ where: { id: user.id } });
  console.log('Cleaned up test data.');
}

main().catch(e => {
  console.error('An error occurred during the test:', e);
  process.exit(1);
}).finally(async () => {
  await prisma.$disconnect();
});
