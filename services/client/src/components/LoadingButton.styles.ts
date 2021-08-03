import { createStyles, makeStyles } from '@material-ui/core';

const useStyles = makeStyles((/* theme: Theme */) => createStyles({
    progress: {
        position: 'absolute',
        top: '50%',
        left: '50%'
    }
}));

export default useStyles;
