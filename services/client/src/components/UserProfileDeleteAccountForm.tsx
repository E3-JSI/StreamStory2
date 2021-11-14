import React, { useRef, useState } from 'react';

import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import Alert from '@material-ui/lab/Alert';
import DeleteForeverIcon from '@material-ui/icons/DeleteForever';

import { deleteCurrentUser, DeleteCurrentUserResponse } from '../api/users';
import { submitForm } from '../utils/forms';
import useSession from '../hooks/useSession';
import useSnackbar from '../hooks/useSnackbar';
import UserProfileForm, { FormResponseHandler } from './UserProfileForm';
import ConfirmationDialog from './ConfirmationDialog';

type FormRequestData = Record<string, never>;
type FormResponseData = DeleteCurrentUserResponse;
type FormErrors = Record<string, never>;

function UserProfileDeleteAccountForm(): JSX.Element {
    const { t } = useTranslation();
    const [, /* session */ setSession] = useSession();
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [showSnackbar] = useSnackbar();
    const form = useForm();

    const formRef = useRef<HTMLFormElement>(null);

    const handleResponse: FormResponseHandler<FormResponseData, FormRequestData> = (response) => {
        if (response.data.success) {
            setSession({
                user: null,
            });
            showSnackbar({
                title: t('successful_account_deletion.title'),
                message: t('successful_account_deletion.message'),
                severity: 'success',
                autoHideDuration: null,
            });
        }
    };

    function handleSubmitClick(event: React.MouseEvent<HTMLButtonElement>) {
        setIsDeleteDialogOpen(true);
        event.preventDefault();
    }

    function handleDialogAccept() {
        setIsDeleteDialogOpen(false);
        submitForm(formRef);
    }

    function handleDialogClose() {
        setIsDeleteDialogOpen(false);
    }

    return (
        <UserProfileForm<FormRequestData, FormResponseData, FormErrors>
            form={form}
            action={deleteCurrentUser}
            onResponse={handleResponse}
            submitButton={{
                children: t('delete'),
                color: 'secondary',
                startIcon: <DeleteForeverIcon />,
                onClick: handleSubmitClick,
                disabled: false,
            }}
            ref={formRef}
        >
            <Alert severity="warning" variant="standard">
                {t('delete_account_warning')}
            </Alert>
            <ConfirmationDialog
                id="delete-account-dialog"
                title={t('delete_account')}
                content={t('delete_account_confirmation')}
                open={isDeleteDialogOpen}
                onClose={handleDialogClose}
                onAccept={handleDialogAccept}
                onDecline={handleDialogClose}
            />
        </UserProfileForm>
    );
}

export default UserProfileDeleteAccountForm;
