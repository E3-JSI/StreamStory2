import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';

const useStyles = makeStyles((theme: Theme) => {
    const dark = theme.palette.type === 'dark';

    return createStyles({
        root: {
            maxWidth: 720,
            margin: '0 auto',
            textAlign: 'left',
            border: `1px solid ${theme.palette.divider}`,
            borderRadius: theme.spacing(1),
            overflow: 'hidden',
        },
        titleBar: {
            display: 'flex',
            alignItems: 'center',
            padding: theme.spacing(0.75, 1, 0.75, 1.5),
            borderBottom: `1px solid ${theme.palette.divider}`,
            backgroundColor: dark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.04)',
        },
        dots: {
            display: 'inline-flex',
            alignItems: 'center',
        },
        dot: {
            display: 'inline-block',
            width: 12,
            height: 12,
            marginRight: theme.spacing(1),
            borderRadius: '50%',
        },
        dotClose: {
            backgroundColor: '#ff5f57',
        },
        dotMinimize: {
            backgroundColor: '#febc2e',
        },
        dotZoom: {
            backgroundColor: '#28c840',
        },
        title: {
            flexGrow: 1,
            marginLeft: theme.spacing(1),
            textAlign: 'center',
            fontSize: '0.8125rem',
            color: theme.palette.text.secondary,
        },
        body: {
            margin: 0,
            padding: theme.spacing(2, 2.5),
            overflowX: 'auto',
            fontFamily: 'SFMono-Regular, Menlo, Consolas, "Liberation Mono", monospace',
            fontSize: '0.875rem',
            lineHeight: 1.8,
            color: theme.palette.text.primary,
        },
        prompt: {
            color: theme.palette.text.secondary,
            userSelect: 'none',
        },
        hint: {
            color: theme.palette.text.secondary,
        },
    });
});

export default useStyles;
