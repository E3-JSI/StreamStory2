import React, { useState } from 'react';

import axios from 'axios';
import { useTranslation } from 'react-i18next';
import Menu, { MenuProps } from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import DeleteIcon from '@material-ui/icons/Delete';
import PlayArrowIcon from '@material-ui/icons/PlayArrow';
import PauseIcon from '@material-ui/icons/Pause';
import PublicIcon from '@material-ui/icons/Public';
import Typography from '@material-ui/core/Typography';

import { Model } from '../types/api';
import { getResponseErrors } from '../utils/errors';
import useSnackbar from '../hooks/useSnackbar';
import ConfirmationDialog from './ConfirmationDialog';
import TransHtml from './TransHtml';
import PublicOffIcon from './icons/PublicOff';

enum DialogState {
    None,
    Share,
    Unshare,
    Activate,
    Deactivate,
    Delete,
}

export interface DialogContent {
    title: string;
    content: React.ReactNode;
}

export interface ActionMenuProps extends MenuProps {
    model: Model;
    online: boolean;
    active: boolean;
    public: boolean;
    updateModel: (model: Model, remove?: boolean) => void;
    toggleMenu: () => void;
}

function ActionMenu(
    {
        open,
        model,
        online: isOnline,
        active: isActive,
        public: isPublic,
        updateModel,
        toggleMenu,
        ...rest
    }: ActionMenuProps,
    ref: React.ForwardedRef<HTMLUListElement>,
) {
    const { t } = useTranslation();
    const [showSnackbar] = useSnackbar();
    const [dialogState, setDialogState] = useState(DialogState.None);
    const [dialogContent, setDialogContent] = useState<DialogContent | null>(null);
    const dialogContents: Record<DialogState, DialogContent | null> = {
        [DialogState.None]: null,
        [DialogState.Share]: {
            title: t('share_model'),
            content: (
                <TransHtml i18nKey="share_model_confirmation" values={{ model: model.name }} />
            ),
        },
        [DialogState.Unshare]: {
            title: t('unshare_model'),
            content: (
                <TransHtml i18nKey="unshare_model_confirmation" values={{ model: model.name }} />
            ),
        },
        [DialogState.Activate]: {
            title: t('activate_model'),
            content: (
                <TransHtml i18nKey="activate_model_confirmation" values={{ model: model.name }} />
            ),
        },
        [DialogState.Deactivate]: {
            title: t('deactivate_model'),
            content: (
                <TransHtml i18nKey="deactivate_model_confirmation" values={{ model: model.name }} />
            ),
        },
        [DialogState.Delete]: {
            title: t('delete_model'),
            content: (
                <TransHtml i18nKey="delete_model_confirmation" values={{ model: model.name }} />
            ),
        },
    };

    async function toggleModelState(state: boolean) {
        try {
            const response = await axios.put(
                `/api/models/${model.id}`,
                isOnline
                    ? {
                          active: state,
                      }
                    : {
                          public: state,
                      },
            );

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

    function handleShareItemClick() {
        toggleMenu();
        setDialogState(DialogState.Share);
        setDialogContent(dialogContents[DialogState.Share]);
    }

    function handleUnshareItemClick() {
        toggleMenu();
        setDialogState(DialogState.Unshare);
        setDialogContent(dialogContents[DialogState.Unshare]);
    }

    function handleActivateItemClick() {
        toggleMenu();
        setDialogState(DialogState.Activate);
        setDialogContent(dialogContents[DialogState.Activate]);
    }

    function handleDeactivateItemClick() {
        toggleMenu();
        setDialogState(DialogState.Deactivate);
        setDialogContent(dialogContents[DialogState.Deactivate]);
    }

    function handleDeleteItemClick() {
        toggleMenu();
        setDialogState(DialogState.Delete);
        setDialogContent(dialogContents[DialogState.Delete]);
    }

    function handleDialogAccept() {
        if (dialogState === DialogState.Share || dialogState === DialogState.Activate) {
            toggleModelState(true);
        } else if (dialogState === DialogState.Unshare || dialogState === DialogState.Deactivate) {
            toggleModelState(false);
        } else if (dialogState === DialogState.Delete) {
            deleteModel();
        }

        setDialogState(DialogState.None);
    }

    function handleDialogClose() {
        setDialogState(DialogState.None);
    }

    return (
        <>
            <Menu ref={ref} open={open} {...rest}>
                {!isOnline && isPublic && (
                    <MenuItem onClick={handleUnshareItemClick}>
                        <ListItemIcon className="narrow">
                            <PublicOffIcon fontSize="small" />
                        </ListItemIcon>
                        <Typography>{t('unshare')}</Typography>
                    </MenuItem>
                )}
                {!isOnline && !isPublic && (
                    <MenuItem onClick={handleShareItemClick}>
                        <ListItemIcon className="narrow">
                            <PublicIcon fontSize="small" />
                        </ListItemIcon>
                        <Typography>{t('share')}</Typography>
                    </MenuItem>
                )}
                {isOnline && isActive && (
                    <MenuItem onClick={handleDeactivateItemClick}>
                        <ListItemIcon className="narrow">
                            <PauseIcon fontSize="small" />
                        </ListItemIcon>
                        <Typography>{t('deactivate')}</Typography>
                    </MenuItem>
                )}
                {isOnline && !isActive && (
                    <MenuItem onClick={handleActivateItemClick}>
                        <ListItemIcon className="narrow">
                            <PlayArrowIcon fontSize="small" />
                        </ListItemIcon>
                        <Typography>{t('activate')}</Typography>
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
                open={dialogState !== DialogState.None}
                onClose={handleDialogClose}
                onAccept={handleDialogAccept}
                onDecline={handleDialogClose}
            />
        </>
    );
}

export default React.forwardRef(ActionMenu);
