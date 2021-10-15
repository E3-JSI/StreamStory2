import Modelling from '../lib/Modelling';

const modelling = new Modelling({
    // protocol: 'http:',
    hostname: process.env.MODELLING_HOST || 'modelling',
    port: Number(process.env.MODELLING_PORT || 8096),
});

export default modelling;
