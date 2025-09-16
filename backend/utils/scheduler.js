import cron from 'node-cron';
import { checkTimeBasedSummaries } from '../controllers/summaryController.js';
import { cleanupOldFiles } from './fileGenerator.js';

let schedulerStarted = false;

export function startScheduler() {
  if (schedulerStarted) {
    console.log('Scheduler already started');
    return;
  }

  console.log('Starting summary scheduler...');

  // Run every 5 minutes to check for meetings that need time-based summaries
  cron.schedule('*/5 * * * *', async () => {
    try {
      console.log('Running time-based summary check...');
      await checkTimeBasedSummaries();
    } catch (error) {
      console.error('Error in time-based summary check:', error);
    }
  });

  // Run every hour to cleanup old files
  cron.schedule('0 * * * *', async () => {
    try {
      console.log('Running file cleanup...');
      cleanupOldFiles();
    } catch (error) {
      console.error('Error in file cleanup:', error);
    }
  });

  // Run cleanup on startup
  setTimeout(() => {
    cleanupOldFiles();
  }, 5000); // 5 seconds after startup

  schedulerStarted = true;
  console.log('Summary scheduler started successfully');
}

export function stopScheduler() {
  if (schedulerStarted) {
    cron.getTasks().forEach(task => task.stop());
    schedulerStarted = false;
    console.log('Summary scheduler stopped');
  }
}

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('Shutting down scheduler...');
  stopScheduler();
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('Shutting down scheduler...');
  stopScheduler();
  process.exit(0);
});
