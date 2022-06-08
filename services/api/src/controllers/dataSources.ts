import { NextFunction, Request, Response } from 'express';

import * as dataSources from '../db/dataSources';
import * as models from '../db/models';
import { DataSource } from '../db/dataSources';
import { User, UserGroup } from '../db/users';

type DataSourceResponse = DataSource;

/**
 * Generate data source response from data source.
 * @param dataSource Data source.
 * @returns Data source response object.
 */
function getDataSourceResponse(dataSource: DataSource): DataSourceResponse {
    const dataSourceResponse = dataSource;
    return dataSourceResponse;
}

export async function getDataSources(
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> {
    try {
        const user = req.user as User;
        const userId = req.query.userId ? Number(req.query.userId) : user.id;

        if (user.id !== userId && user.groupId !== UserGroup.Admin) {
            res.status(401).json({
                error: ['unauthorized'],
            });
            return;
        }

        const dataSourceList = await dataSources.get(userId);
        res.status(200).json({
            dataSources: dataSourceList.map((dataSource) => getDataSourceResponse(dataSource)),
        });
    } catch (error) {
        next(error);
    }
}

export async function getDataSource(
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> {
    try {
        const user = req.user as User;
        const id = Number(req.params.id);
        const dataSource = await dataSources.findById(id);

        if (dataSource && dataSource.userId !== user.id && user.groupId !== UserGroup.Admin) {
            res.status(401).json({
                error: ['unauthorized'],
            });
            return;
        }

        res.status(200).json({
            dataSource: dataSource && getDataSourceResponse(dataSource),
        });
    } catch (error) {
        next(error);
    }
}

export async function addDataSource(
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> {
    try {
        const user = req.user as User;
        const userId = req.body.userId ? Number(req.body.userId) : user.id;

        if (user.id !== userId && user.groupId !== UserGroup.Admin) {
            res.status(401).json({
                error: ['unauthorized'],
            });
            return;
        }

        const { name, description, url, timeWindowStart, timeWindowEnd, interval } = req.body;

        // TODO: form validation/sanitation (use: express-validation!?).
        const id = await dataSources.add(
            userId,
            name,
            description,
            url,
            timeWindowStart,
            timeWindowEnd,
            interval
        );

        if (!id) {
            res.status(500).json({
                error: ['data_source_addition_failed'],
            });
            return;
        }

        // Return added data source.
        const dataSource = await dataSources.findById(id);

        if (!dataSource) {
            res.status(500).json({
                error: ['db_query_failed'],
            });
            return;
        }

        res.status(200).json({
            dataSource: getDataSourceResponse(dataSource),
        });
    } catch (error) {
        next(error);
    }
}

export async function updateDataSource(
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> {
    try {
        const user = req.user as User;
        const id = Number(req.params.id);
        const dataSource = await dataSources.findById(id);

        if (dataSource && dataSource.userId !== user.id && user.groupId !== UserGroup.Admin) {
            res.status(401).json({
                error: ['unauthorized'],
            });
            return;
        }

        const { name, description, url, timeWindowStart, timeWindowEnd, interval } = req.body;

        // TODO: form validation/sanitation (use: express-validation!?).
        const success = dataSources.update(
            id,
            name,
            description,
            url,
            timeWindowStart,
            timeWindowEnd,
            interval
        );

        if (!success) {
            res.status(500).json({
                error: ['data_source_update_failed'],
            });
            return;
        }

        // Return updated data source.
        const updatedDataSource = await dataSources.findById(id);

        if (!updatedDataSource) {
            res.status(500).json({
                error: ['db_query_failed'],
            });
            return;
        }

        res.status(200).json({
            dataSource: getDataSourceResponse(updatedDataSource),
        });
    } catch (error) {
        next(error);
    }
}

export async function deleteDataSource(
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> {
    try {
        const user = req.user as User;
        const id = Number(req.params.id);
        const dataSource = await dataSources.findById(id);

        if (dataSource && dataSource.userId !== user.id && user.groupId !== UserGroup.Admin) {
            res.status(401).json({
                error: ['unauthorized'],
            });
            return;
        }

        const relatedModels = await models.findByDataSourceId(id);
        if (relatedModels.length) {
            res.status(500).json({
                error: ['data_source_used_by_other_models'],
            });
            return;
        }

        const success = await dataSources.del(id);

        if (!success) {
            res.status(500).json({
                error: ['data_source_deletion_failed'],
            });
            return;
        }

        res.status(200).json({
            success,
        });
    } catch (error) {
        next(error);
    }
}
