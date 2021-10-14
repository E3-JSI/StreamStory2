interface Timing {
    tooltipEnterDelay: number;
}

export declare module '@material-ui/core/styles/createMuiTheme' {
    export interface ThemeOptions {
        timing?: Timing;
    }

    export interface Theme {
        timing: Partial<Timing>;
    }
}
