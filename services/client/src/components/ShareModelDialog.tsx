import React, { useState } from 'react';

import { useTranslation } from 'react-i18next';
import { useForm, SubmitHandler } from 'react-hook-form';
import Button from '@material-ui/core/Button';
import Dialog, { DialogProps } from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';

import { getUsers, User } from '../api/users';
import { getModelUsers, shareModel } from '../api/models';
import { getResponseErrors } from '../utils/errors';
import { initMuiRegister } from '../utils/forms';
import useMountEffect from '../hooks/useMountEffect';
import useSession from '../hooks/useSession';
import useSnackbar from '../hooks/useSnackbar';
import LoadingButton from './LoadingButton';
import Multiselect from './Multiselect';

type FormRequestData = {
    userIds: number[];
};
type FormErrors = Record<string, never>;

export interface ShareModelDialogProps extends DialogProps {
    modelId: number;
    onAccept: () => void;
    onDecline: React.ReactEventHandler<HTMLElement>;
}

function ShareModelDialog({
    modelId,
    onAccept,
    onDecline,
    ...other
}: ShareModelDialogProps): JSX.Element {
    const { t } = useTranslation();
    const [{ user }] = useSession();
    const [showSnackbar] = useSnackbar();
    const [users, setUsers] = useState<User[] | null>(null);
    const [modelUserIds, setModelUserIds] = useState<number[]>([]);
    const {
        formState: { isDirty, isSubmitting },
        handleSubmit: onSubmit,
        register,
    } = useForm();
    const muiRegister = initMuiRegister(register);

    async function loadUsers() {
        try {
            const response = await getUsers();

            if (response.data.users) {
                setUsers(response.data.users);
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

    async function loadModelUsers() {
        try {
            const response = await getModelUsers(modelId);

            if (response.data.userIds) {
                setModelUserIds(response.data.userIds);
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

    useMountEffect(() => {
        loadUsers();
        loadModelUsers();
    });

    const handleSubmit: SubmitHandler<FormRequestData> = async (data) => {
        try {
            const response = await shareModel(modelId, data.userIds);

            if (response?.data.success) {
                showSnackbar({
                    message: t('sharing_settings_saved'),
                    severity: 'success',
                });
                loadModelUsers();
                onAccept();
            }
        } catch (error) {
            // Handle form errors.
            const responseErrors = getResponseErrors<FormErrors>(error, t);

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
    };

    const userOptions =
        users
            ?.filter((u) => user !== null && u.id !== user.id)
            .map((u) => ({
                label: u.email,
                value: `${u.id}`,
            })) || [];
    const selectedUserIds = modelUserIds.map((id) => `${id}`);

    return (
        <Dialog aria-labelledby="share-model-dialog-title" {...other}>
            <DialogTitle id="share-model-dialog-title">{t('share_model')}</DialogTitle>
            <DialogContent dividers>
                <form id="share-model-form" onSubmit={onSubmit(handleSubmit)} noValidate>
                    <Multiselect
                        id="share-model-select"
                        label={t('users')}
                        options={userOptions}
                        value={selectedUserIds}
                        searchPlaceholder={t('search_users')}
                        selectionI18nKey="m_of_n_users_selected"
                        emptyI18nKey="n_users"
                        {...muiRegister('userIds')}
                    />
                </form>
            </DialogContent>
            <DialogActions>
                <Button onClick={onDecline} color="primary" autoFocus>
                    {t('cancel')}
                </Button>
                <LoadingButton
                    type="submit"
                    form="share-model-form"
                    color="secondary"
                    loading={isSubmitting}
                    disabled={!isDirty}
                >
                    {t('save')}
                </LoadingButton>
            </DialogActions>
        </Dialog>
    );
}

export default ShareModelDialog;
