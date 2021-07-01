import { Request, Response } from 'express';

export async function createModel(req: Request, res: Response): Promise<void> {
    // TODO
    res.status(404).json({ todo: req.url });
}

export async function getModels(req: Request, res: Response): Promise<void> {
    // TODO
    res.status(404).json({ todo: req.url });
}

export async function getModel(req: Request, res: Response): Promise<void> {
    // TODO
    res.status(404).json({ todo: req.url });
}

export async function updateModel(req: Request, res: Response): Promise<void> {
    // TODO
    res.status(404).json({ todo: req.url });
}

export async function deleteModel(req: Request, res: Response): Promise<void> {
    // TODO
    res.status(404).json({ todo: req.url });
}
