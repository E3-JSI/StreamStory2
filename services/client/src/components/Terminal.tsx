import React, { useEffect, useState } from 'react';

import clsx from 'clsx';
import { useTranslation } from 'react-i18next';
import IconButton from '@material-ui/core/IconButton';
import Paper from '@material-ui/core/Paper';
import Tooltip from '@material-ui/core/Tooltip';
import Typography from '@material-ui/core/Typography';
import FileCopyOutlinedIcon from '@material-ui/icons/FileCopyOutlined';

import useStyles from './Terminal.styles';

export interface TerminalProps {
    title: string;
    lines: string[];
    hint: string;
}

function Terminal({ title, lines, hint }: TerminalProps): JSX.Element {
    const classes = useStyles();
    const { t } = useTranslation();
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        if (!copied) {
            return undefined;
        }

        const timeout = window.setTimeout(() => setCopied(false), 2000);
        return () => window.clearTimeout(timeout);
    }, [copied]);

    function handleCopyClick() {
        if (navigator.clipboard) {
            navigator.clipboard
                .writeText(lines.join('\n'))
                .then(() => setCopied(true))
                .catch(() => setCopied(false));
        }
    }

    return (
        <Paper elevation={2} className={classes.root}>
            <div className={classes.titleBar}>
                <span className={classes.dots} aria-hidden="true">
                    <span className={clsx(classes.dot, classes.dotClose)} />
                    <span className={clsx(classes.dot, classes.dotMinimize)} />
                    <span className={clsx(classes.dot, classes.dotZoom)} />
                </span>
                <Typography component="span" className={classes.title}>
                    {title}
                </Typography>
                <Tooltip title={copied ? t('copied') : t('copy_commands')}>
                    <IconButton
                        size="small"
                        onClick={handleCopyClick}
                        aria-label={t('copy_commands')}
                    >
                        <FileCopyOutlinedIcon fontSize="small" />
                    </IconButton>
                </Tooltip>
            </div>
            <pre className={classes.body}>
                {lines.map((line) => (
                    <div key={line}>
                        <span className={classes.prompt}>$ </span>
                        {line}
                    </div>
                ))}
                <div className={classes.hint}>{hint}</div>
            </pre>
        </Paper>
    );
}

export default Terminal;
