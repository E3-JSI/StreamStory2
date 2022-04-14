import axios from 'axios';
import cron from 'node-cron';

import modelling from '../config/modelling';
import * as models from '../db/models';
import * as dataSources from '../db/dataSources';
import { DataPoint, isDataValid } from './Modelling';

async function classify(): Promise<void> {
    const activeModels = await models.getActive();
    if (!activeModels.length) {
        return;
    }

    activeModels.forEach(async (model) => {
        if (!model.dataSourceId || !model.model) {
            return;
        }

        try {
            const dataSource = await dataSources.findById(model.dataSourceId);
            if (!dataSource) {
                console.log(`Model "${model.name}" is missing datasource (${model.dataSourceId})`);
                return;
            }

            // console.log(`Retrieving data for active online model "${model.name}"`);

            const { data } = await axios.get<{ series: DataPoint[] }>(
                `${dataSource.url}/series/last`
            );

            if (!data.series || !data.series[0]) {
                return;
            }

            const lastData = data.series[0];

            if (!model.state || JSON.stringify(model.state.data) !== JSON.stringify(lastData)) {
                if (!isDataValid(lastData, model.model)) {
                    console.log('Invalid data:', lastData);
                    return;
                }

                console.log(`Classifying data for model "${model.name}":`, lastData);

                // Classify and update model's state.
                const res = await modelling.classifyDataPoint(lastData, model.model);
                if (res.status === 'ok' && res.classifications) {
                    await models.updateState(model.id, {
                        state: res.classifications[0],
                        data: lastData,
                    });
                } else {
                    console.log('Invalid response:', res);
                }
            }
        } catch (error) {
            console.log(error);
        }
    });
}

function schedule(): void {
    cron.schedule('* * * * *', classify);
}

export default schedule;
