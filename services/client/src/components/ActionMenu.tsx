import React, { useState } from 'react';

import axios from 'axios';
import { useTranslation } from 'react-i18next';
import Menu, { MenuProps } from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import DeleteIcon from '@material-ui/icons/Delete';
import PublicIcon from '@material-ui/icons/Public';
import Typography from '@material-ui/core/Typography';

import { Model } from '../types/api';
import { getResponseErrors } from '../utils/errors';
import useSnackbar from '../hooks/useSnackbar';
import ConfirmationDialog from './ConfirmationDialog';
import TransHtml from './TransHtml';

export interface DialogContent {
    title: string;
    content: React.ReactNode;
}

export interface ActionMenuProps extends MenuProps {
    model: Model;
    modelIsPublic: boolean;
    updateModel: (model: Model, remove?: boolean) => void;
    toggleMenu: () => void;
}

function ActionMenu(
    { open, model, modelIsPublic, updateModel, toggleMenu, ...rest }: ActionMenuProps,
    ref: React.ForwardedRef<HTMLUListElement>,
) {
    const { t } = useTranslation();
    const [showSnackbar] = useSnackbar();
    const [dialogState, setDialogState] = useState(0);
    const [dialogContent, setDialogContent] = useState<DialogContent | null>(null);
    const dialogContents: DialogContent[] = [
        {
            title: t('share_model'),
            content: (
                <TransHtml i18nKey="share_model_confirmation" values={{ model: model.name }} />
            ),
        },
        {
            title: t('unshare_model'),
            content: (
                <TransHtml i18nKey="unshare_model_confirmation" values={{ model: model.name }} />
            ),
        },
        {
            title: t('delete_model'),
            content: (
                <TransHtml i18nKey="delete_model_confirmation" values={{ model: model.name }} />
            ),
        },
    ];

    async function togglePublic(isPublic: boolean) {
        try {
            const response = await axios.put(`/api/models/${model.id}`, {
                public: isPublic,
            });

            if (response.data.model) {
                updateModel(response.data.model);
            }
        } catch (error) {
            const responseErrors = getResponseErrors(error, t);

            if (Array.isArray(responseErrors)) {
                const message = responseErrors;

                if (message.length) {
                    showSnackbar({
                        message: responseErrors,
                        severity: 'error',
                    });
                }
            }
        }
    }

    async function deleteModel() {
        try {
            const response = await axios.delete(`/api/models/${model.id}`);

            if (response.data.success) {
                updateModel(model, true);
                showSnackbar({
                    message: t('model_successfully_deleted'),
                    severity: 'success',
                    // autoHideDuration: null
                });
            }
        } catch (error) {
            const responseErrors = getResponseErrors(error, t);

            if (Array.isArray(responseErrors)) {
                const message = responseErrors;

                if (message.length) {
                    showSnackbar({
                        message: responseErrors,
                        severity: 'error',
                    });
                }
            }
        }
    }

    async function handleShareItemClick() {
        toggleMenu();
        setDialogContent(dialogContents[0]);
        setDialogState(1);
    }

    async function handleUnshareItemClick() {
        toggleMenu();
        setDialogContent(dialogContents[1]);
        setDialogState(2);
    }

    async function handleDeleteItemClick() {
        toggleMenu();
        setDialogContent(dialogContents[2]);
        setDialogState(3);
    }

    function handleDialogAccept() {
        setDialogState(0);

        if (dialogState === 1) {
            togglePublic(true);
        } else if (dialogState === 2) {
            togglePublic(false);
        } else if (dialogState === 3) {
            deleteModel();
        }
    }

    function handleDialogClose() {
        setDialogState(0);
    }

    return (
        <>
            <Menu ref={ref} open={open} {...rest}>
                {modelIsPublic ? (
                    <MenuItem onClick={handleUnshareItemClick}>
                        <ListItemIcon className="narrow">
                            <PublicIcon fontSize="small" />
                        </ListItemIcon>
                        <Typography>{t('unshare')}</Typography>
                    </MenuItem>
                ) : (
                    <MenuItem onClick={handleShareItemClick}>
                        <ListItemIcon className="narrow">
                            <PublicIcon fontSize="small" />
                        </ListItemIcon>
                        <Typography>{t('share')}</Typography>
                    </MenuItem>
                )}
                <MenuItem onClick={handleDeleteItemClick}>
                    <ListItemIcon className="narrow">
                        <DeleteIcon fontSize="small" />
                    </ListItemIcon>
                    <Typography>{t('delete')}</Typography>
                </MenuItem>
            </Menu>
            <ConfirmationDialog
                id="update-model-dialog"
                title={dialogContent?.title || ''}
                content={dialogContent?.content || ''}
                open={!!dialogState}
                onClose={handleDialogClose}
                onAccept={handleDialogAccept}
                onDecline={handleDialogClose}
            />
        </>
    );
}

export default React.forwardRef(ActionMenu);
