import React, { useState } from 'react';

import { useTranslation } from 'react-i18next';
import Menu, { MenuProps } from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import Typography from '@material-ui/core/Typography';
import DeleteIcon from '@material-ui/icons/Delete';
import PlayArrowIcon from '@material-ui/icons/PlayArrow';
import PauseIcon from '@material-ui/icons/Pause';
import PublicIcon from '@material-ui/icons/Public';
import ShareIcon from '@material-ui/icons/Share';

import { deleteModel, updateModel, Model } from '../api/models';
import { getResponseErrors } from '../utils/errors';
import useSnackbar from '../hooks/useSnackbar';
import useSession from '../hooks/useSession';
import ConfirmationDialog from './ConfirmationDialog';
import ShareModelDialog from './ShareModelDialog';
import TransHtml from './TransHtml';
import PublicOffIcon from './icons/PublicOff';

enum ConfirmationDialogState {
    None,
    Publish,
    Unpublish,
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
    onModelUpdate: (model: Model, remove?: boolean) => void;
    onToggle: () => void;
}

function ActionMenu(
    {
        open,
        model,
        online: isOnline,
        active: isActive,
        public: isPublic,
        onModelUpdate,
        onToggle,
        ...rest
    }: ActionMenuProps,
    ref: React.ForwardedRef<HTMLUListElement>,
) {
    const { t } = useTranslation();
    const [{ currentModel }, setSession] = useSession();
    const [showSnackbar] = useSnackbar();
    const [confirmationDialogState, setConfirmationDialogState] = useState(
        ConfirmationDialogState.None,
    );
    const [confirmationDialogContent, setConfirmationDialogContent] =
        useState<DialogContent | null>(null);
    const confirmationDialogContents: Record<ConfirmationDialogState, DialogContent | null> = {
        [ConfirmationDialogState.None]: null,
        [ConfirmationDialogState.Publish]: {
            title: t('publish_model'),
            content: (
                <TransHtml i18nKey="publish_model_confirmation" values={{ model: model.name }} />
            ),
        },
        [ConfirmationDialogState.Unpublish]: {
            title: t('unpublish_model'),
            content: (
                <TransHtml i18nKey="unpublish_model_confirmation" values={{ model: model.name }} />
            ),
        },
        [ConfirmationDialogState.Activate]: {
            title: t('activate_model'),
            content: (
                <TransHtml i18nKey="activate_model_confirmation" values={{ model: model.name }} />
            ),
        },
        [ConfirmationDialogState.Deactivate]: {
            title: t('deactivate_model'),
            content: (
                <TransHtml i18nKey="deactivate_model_confirmation" values={{ model: model.name }} />
            ),
        },
        [ConfirmationDialogState.Delete]: {
            title: t('delete_model'),
            content: (
                <TransHtml i18nKey="delete_model_confirmation" values={{ model: model.name }} />
            ),
        },
    };
    const [isShareDialogOpen, setIsShareDialogOpen] = useState(false);

    async function toggleModelState(state: boolean) {
        try {
            const response = await updateModel(
                model.id,
                isOnline
                    ? {
                          active: state,
                      }
                    : {
                          public: state,
                      },
            );

            if (response.data.model) {
                onModelUpdate(response.data.model as Model);
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

    async function delModel() {
        try {
            const response = await deleteModel(model.id);

            if (response.data.success) {
                onModelUpdate(model, true);
                setSession({
                    currentModel: currentModel.filter((m) => m.id !== model.id),
                });
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
        onToggle();
        setIsShareDialogOpen(true);
    }

    function handlePublishItemClick() {
        onToggle();
        setConfirmationDialogState(ConfirmationDialogState.Publish);
        setConfirmationDialogContent(confirmationDialogContents[ConfirmationDialogState.Publish]);
    }

    function handleUnpublishItemClick() {
        onToggle();
        setConfirmationDialogState(ConfirmationDialogState.Unpublish);
        setConfirmationDialogContent(confirmationDialogContents[ConfirmationDialogState.Unpublish]);
    }

    function handleActivateItemClick() {
        onToggle();
        setConfirmationDialogState(ConfirmationDialogState.Activate);
        setConfirmationDialogContent(confirmationDialogContents[ConfirmationDialogState.Activate]);
    }

    function handleDeactivateItemClick() {
        onToggle();
        setConfirmationDialogState(ConfirmationDialogState.Deactivate);
        setConfirmationDialogContent(
            confirmationDialogContents[ConfirmationDialogState.Deactivate],
        );
    }

    function handleDeleteItemClick() {
        onToggle();
        setConfirmationDialogState(ConfirmationDialogState.Delete);
        setConfirmationDialogContent(confirmationDialogContents[ConfirmationDialogState.Delete]);
    }

    function handleConfirmationDialogAccept() {
        if (
            confirmationDialogState === ConfirmationDialogState.Publish ||
            confirmationDialogState === ConfirmationDialogState.Activate
        ) {
            toggleModelState(true);
        } else if (
            confirmationDialogState === ConfirmationDialogState.Unpublish ||
            confirmationDialogState === ConfirmationDialogState.Deactivate
        ) {
            toggleModelState(false);
        } else if (confirmationDialogState === ConfirmationDialogState.Delete) {
            delModel();
        }

        setConfirmationDialogState(ConfirmationDialogState.None);
    }

    function handleConfirmationDialogClose() {
        setConfirmationDialogState(ConfirmationDialogState.None);
    }

    function handleShareDialogClose() {
        setIsShareDialogOpen(false);
    }

    return (
        <>
            <Menu ref={ref} open={open} {...rest}>
                <MenuItem onClick={handleShareItemClick}>
                    <ListItemIcon className="narrow">
                        <ShareIcon fontSize="small" />
                    </ListItemIcon>
                    <Typography>{t('share')}</Typography>
                </MenuItem>
                {!isOnline && isPublic && (
                    <MenuItem onClick={handleUnpublishItemClick}>
                        <ListItemIcon className="narrow">
                            <PublicOffIcon fontSize="small" />
                        </ListItemIcon>
                        <Typography>{t('unpublish')}</Typography>
                    </MenuItem>
                )}
                {!isOnline && !isPublic && (
                    <MenuItem onClick={handlePublishItemClick}>
                        <ListItemIcon className="narrow">
                            <PublicIcon fontSize="small" />
                        </ListItemIcon>
                        <Typography>{t('publish')}</Typography>
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
                title={confirmationDialogContent?.title || ''}
                content={confirmationDialogContent?.content || ''}
                open={confirmationDialogState !== ConfirmationDialogState.None}
                onClose={handleConfirmationDialogClose}
                onAccept={handleConfirmationDialogAccept}
                onDecline={handleConfirmationDialogClose}
            />
            <ShareModelDialog
                modelId={model.id}
                open={isShareDialogOpen}
                maxWidth="sm"
                onClose={handleShareDialogClose}
                onAccept={handleShareDialogClose}
                onDecline={handleShareDialogClose}
                fullWidth
            />
        </>
    );
}

export default React.forwardRef(ActionMenu);
