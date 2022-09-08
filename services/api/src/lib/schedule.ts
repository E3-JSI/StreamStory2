import axios from 'axios';
import cron from 'node-cron';

import modelling from '../config/modelling';
import * as models from '../db/models';
import * as dataSources from '../db/dataSources';
import * as notifications from '../db/notifications';
import { DataPoint, getEnterTriggerStates, getExitTriggerStates, isDataValid } from './Modelling';

async function classify(): Promise<void> {
    const activeModels = await models.getActive();
    if (!activeModels.length) {
        return;
    }

    activeModels.forEach(async (model) => {
        const m = model.model;
        if (!model.dataSourceId || !m) {
            console.log(`Online model ${model.id} is broken`);
            return;
        }

        try {
            const dataSource = await dataSources.findById(model.dataSourceId);
            if (!dataSource) {
                console.log(`Online model ${model.id} is missing datasource (${model.dataSourceId})`);
                return;
            }

            console.log(`Retrieving latest data for online model ${model.id}`);

            const { data } = await axios.get<{ series: DataPoint[] }>(
                `${dataSource.url}/series/last`
            );

            if (!data.series || !data.series[0]) {
                console.log(`Failed to retrieve latest data for online model ${model.id}`);
                return;
            }

            const lastData = data.series[0];

            if (!model.state || JSON.stringify(model.state.data) !== JSON.stringify(lastData)) {
                // if (!isDataValid(lastData, m)) {
                //     console.log(`Invalid data for model ${model.id}:`, lastData);
                //     return;
                // }

                console.log(`Classifying data using model ${model.id}:`, lastData);
                notifications.add(
                    model.userId,
                    model.id,
                    'new_data',
                    `New data for model ${model.id} "${model.name}"`,
                    `<pre>${JSON.stringify(lastData, null, 2)}</pre>`
                );

                // Classify and update model's state.
                const res = await modelling.classifyDataPoint(lastData, m);
                if (res.status === 'ok' && res.classifications) {
                    if (model.state && res.classifications[0] !== model.state.state) {
                        const enterTriggerStates = getEnterTriggerStates(res.classifications[0], model.state.state, m);
                        const exitTriggerStates = getExitTriggerStates(res.classifications[0], model.state.state, m);
                        enterTriggerStates.forEach(state => {
                            notifications.add(
                                model.userId,
                                model.id,
                                'state_change',
                                `Model ${model.id} "${model.name}" entered trigger state`,
                                `<pre>${JSON.stringify(state, null, 2)}</pre>`
                            );
                        });
                        exitTriggerStates.forEach(state => {
                            notifications.add(
                                model.userId,
                                model.id,
                                'state_change',
                                `Model ${model.id} "${model.name}" exited trigger state`,
                                `<pre>${JSON.stringify(state, null, 2)}</pre>`
                            );
                        });
                        // notifications.add(
                        //     model.userId,
                        //     model.id,
                        //     'state_change',
                        //     `State of model ${model.id} "${model.name}" changed`,
                        //     `<p>Model changed state from ${model.state.state} to ${res.classifications[0]}</p>`
                        // );
                    }

                    await models.updateState(model.id, {
                        state: res.classifications[0],
                        data: lastData,
                    });
                } else {
                    console.log(`Invalid response from model ${model.id}:`, res);
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
