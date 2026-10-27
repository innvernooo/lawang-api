import { CronJob } from 'cron';
import { PaymentExpiring } from './expiring.job';

const job = new CronJob('* * * * *', async () => {
  console.log('Running Cron');
  await PaymentExpiring();
});

export default job;
