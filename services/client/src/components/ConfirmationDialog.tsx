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
    cancelLabel?: string;
    okLabel?: string;
    handleCancelClick?: React.ReactEventHandler<HTMLElement>;
    handleOkClick?: React.ReactEventHandler<HTMLElement>;
}

function ConfirmationDialog({
    id,
    title,
    content,
    cancelLabel,
    okLabel,
    handleCancelClick,
    handleOkClick,
    ...other
}: ConfirmationDialogProps): JSX.Element {
    const { t } = useTranslation(['common']);

    return (
        <Dialog aria-labelledby={`${id}-title`} aria-describedby={`${id}-description`} {...other}>
            <DialogTitle id={`${id}-title`}>{title}</DialogTitle>
            <DialogContent>
                <DialogContentText id={`${id}-description`}>{content}</DialogContentText>
            </DialogContent>
            {(handleCancelClick || handleOkClick) && (
                <DialogActions>
                    {handleCancelClick && (
                        <Button onClick={handleCancelClick} color="primary" autoFocus>
                            {cancelLabel || t('common:cancel')}
                        </Button>
                    )}
                    {handleOkClick && (
                        <Button
                            onClick={handleOkClick}
                            color="secondary"
                            autoFocus={!handleCancelClick}
                        >
                            {okLabel || t('common:ok')}
                        </Button>
                    )}
                </DialogActions>
            )}
        </Dialog>
    );
}

export default ConfirmationDialog;
