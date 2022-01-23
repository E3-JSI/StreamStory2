import { createStyles, makeStyles } from '@material-ui/core';

const useStyles = makeStyles((/* theme: Theme */) =>
    createStyles({
        intervalWrapper: {
            flexGrow: 1,
        },
        timeUnit: {
            minWidth: 120,
        },
    }));

export default useStyles;
