import React from 'react';

import { useTranslation } from 'react-i18next';
import Button from '@material-ui/core/Button';
import Dialog, { DialogProps } from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';

export interface ConfirmationDialogProps extends DialogProps {
    id: string;
    title: string;
    content: React.ReactNode;
    acceptLabel?: string;
    declineLabel?: string;
    onAccept?: React.ReactEventHandler<HTMLElement>;
    onDecline?: React.ReactEventHandler<HTMLElement>;
}

function ConfirmationDialog({
    id,
    title,
    content,
    acceptLabel,
    declineLabel,
    onAccept,
    onDecline,
    ...other
}: ConfirmationDialogProps): JSX.Element {
    const { t } = useTranslation();

    return (
        <Dialog aria-labelledby={`${id}-title`} aria-describedby={`${id}-description`} {...other}>
            <DialogTitle id={`${id}-title`}>{title}</DialogTitle>
            <DialogContent dividers>
                <DialogContentText id={`${id}-description`} style={{ marginBottom: 0 }}>
                    {content}
                </DialogContentText>
            </DialogContent>
            {(onDecline || onAccept) && (
                <DialogActions>
                    {onDecline && (
                        <Button onClick={onDecline} color="primary" autoFocus>
                            {declineLabel || t('cancel')}
                        </Button>
                    )}
                    {onAccept && (
                        <Button onClick={onAccept} color="secondary" autoFocus={!onDecline}>
                            {acceptLabel || t('ok')}
                        </Button>
                    )}
                </DialogActions>
            )}
        </Dialog>
    );
}

export default ConfirmationDialog;
