import { createStyles, makeStyles, Theme } from '@material-ui/core';

const ITEM_HEIGHT = 68;

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        root: {},
        menuPaper: {
            maxHeight: ITEM_HEIGHT * 8,
            maxWidth: theme.breakpoints.values.sm,
            overflowY: 'auto',
        },
        listItemTextPrimary: {
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
        },
    }),
);

export default useStyles;
