import React, { useRef } from 'react';

import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import Alert from '@material-ui/lab/Alert';
import DeleteForeverIcon from '@material-ui/icons/DeleteForever';

import { submitForm } from '../utils/forms';
import useSession from '../hooks/useSession';
import useSnackbar from '../hooks/useSnackbar';
import UserProfileForm, { FormResponseHandler } from './UserProfileForm';
import ConfirmationDialog from './ConfirmationDialog';

export type FormRequestData = Record<string, never>;

export interface FormResponseData {
    success?: boolean;
    error?: string[] | string;
}

export type FormErrors = Record<string, never>;

function UserProfileDeleteAccountForm(): JSX.Element {
    const { t } = useTranslation(['common']);

    const [, /* session */ setSession] = useSession();
    const [dialogOpen, setDialogOpen] = React.useState(false);
    const [showSnackbar] = useSnackbar();
    const form = useForm();

    const formRef = useRef<HTMLFormElement>(null);

    const handleResponse: FormResponseHandler<FormResponseData, FormRequestData> = (response) => {
        if (response.data.success) {
            setSession({
                user: null
            });
            showSnackbar({
                title: t('common:successful_account_deletion.title'),
                message: t('common:successful_account_deletion.message'),
                severity: 'success',
                autoHideDuration: null
            });
        }
    };

    function handleSubmitClick(event: React.MouseEvent<HTMLButtonElement>) {
        setDialogOpen(true);
        event.preventDefault();
    }

    function handleDialogClose() {
        setDialogOpen(false);
    }

    function handleDialogYesClick() {
        setDialogOpen(false);
        submitForm(formRef);
    }

    return (
        <UserProfileForm<FormRequestData, FormResponseData, FormErrors>
            form={form}
            method="delete"
            handleResponse={handleResponse}
            submitButton={{
                children: t('common:delete'),
                color: 'secondary',
                startIcon: <DeleteForeverIcon />,
                onClick: handleSubmitClick,
                disabled: false
            }}
            ref={formRef}
        >
            <Alert severity="warning" variant="standard">
                {t('common:delete_account_warning')}
            </Alert>
            <ConfirmationDialog
                id="delete-account-dialog"
                title={t('common:delete_account')}
                content={t('common:delete_account_confirmation')}
                open={dialogOpen}
                onClose={handleDialogClose}
                handleCancelClick={handleDialogClose}
                handleOkClick={handleDialogYesClick}
            />
        </UserProfileForm>
    );
}

export default UserProfileDeleteAccountForm;
