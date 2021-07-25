import React from 'react';

import { useParams } from 'react-router-dom';

import { patterns } from '../utils/forms';
import UserAccountForm from '../components/UserAccountForm';

export interface PasswordResetUrlParams {
    token?: string;
}

function PasswordReset(): JSX.Element {
    const { token } = useParams<PasswordResetUrlParams>();

    const tokenValid = token && token.match(patterns.userToken);

    return <UserAccountForm variant={tokenValid ? 'password-reset' : 'password-reset-init'} />;
}

export default PasswordReset;
