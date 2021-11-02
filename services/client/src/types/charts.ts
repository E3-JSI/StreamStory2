import { easeLinear, easeQuad } from 'd3';

export enum LinkType {
    BIDIRECT = 'bidirect',
    SELF = 'self',
    SINGLE = 'single',
}

export const TRANSITION_PROPS: ITransitionProps = {
    tEnter: {
        duration: 300,
        ease: easeLinear,
    } as ITransition,
    tExit: {
        duration: 150,
        ease: easeQuad,
    } as ITransition,
} as ITransitionProps;

export interface ITransitionProps {
    tEnter: ITransition;
    tUpdate: ITransition;
    tExit: ITransition;
}

export interface ITransition {
    duration: number;
    ease: any;
}