import cron from 'node-cron';

function classify() {
    console.log('Classify');
}

function schedule(): void {
    cron.schedule('* * * * *', classify);
}

export default schedule;
