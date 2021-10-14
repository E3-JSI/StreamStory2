import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';

import { setColorOpacity } from '../utils/misc';

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        marked: {
            fontStyle: 'normal',
            backgroundColor: setColorOpacity(
                theme.palette.secondary.main,
                theme.palette.type === 'light' ? 0.1 : 0.2,
            ),
            boxShadow: `0 2px 0 0 ${setColorOpacity(theme.palette.secondary.main, 0.8)}`,
        },
    }),
);

export default useStyles;
