import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';

// Link and selection colours match the model view (see MarkovChain.tsx).
const linkColor = '#a0a0a0';
const selectedColor = '#337ab7';

const useStyles = makeStyles((theme: Theme) => {
    const dark = theme.palette.type === 'dark';

    return createStyles({
        '@keyframes flow': {
            to: {
                strokeDashoffset: '-44',
            },
        },
        root: {
            display: 'block',
            width: '100%',
            height: '100%',
            '& .ss-glow': {
                opacity: dark ? 0.24 : 0.12,
            },
            '& .ss-node-glow': {
                opacity: dark ? 0.32 : 0.2,
            },
            '& .ss-link': {
                stroke: linkColor,
            },
            '& .ss-marker': {
                fill: linkColor,
            },
            '& .ss-link-sel, & .ss-sel': {
                stroke: selectedColor,
            },
            '& .ss-marker-sel': {
                fill: selectedColor,
            },
            '& .ss-flow': {
                stroke: dark ? '#bbdefb' : '#e3f2fd',
                strokeDasharray: '5 17',
                animation: '$flow 1.1s linear infinite',
            },
            '& .ss-pill': {
                fill: theme.palette.background.paper,
                stroke: theme.palette.divider,
            },
            '& .ss-pill-sel': {
                stroke: selectedColor,
            },
            '& .ss-pill-text': {
                fill: theme.palette.text.primary,
            },
            '& .ss-pill-text-sel': {
                fill: selectedColor,
            },
            '& .ss-caption': {
                fill: theme.palette.text.secondary,
            },
            '@media (prefers-reduced-motion: reduce)': {
                '& .ss-flow': {
                    animation: 'none',
                },
            },
        },
    });
});

export default useStyles;
