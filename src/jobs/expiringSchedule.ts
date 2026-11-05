import { CronJob } from 'cron';
import { PaymentExpiring } from './expiring.job';

const job = new CronJob('* * * * *', async () => {
  await PaymentExpiring();
});

export default job;
