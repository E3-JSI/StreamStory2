import { createStyles, makeStyles } from '@material-ui/core';

const useStyles = makeStyles((/* theme: Theme */) =>
    createStyles({
        tabsPaper: {
            position: 'relative',
            flexGrow: 1,
        },
    }));

export default useStyles;
