import React from 'react';

import { useParams } from 'react-router-dom';

import { patterns } from '../utils/validation';
import UserAccountForm from '../components/UserAccountForm';

export interface PasswordResetUrlParams {
    token?: string;
}

function Login(): JSX.Element {
    const { token } = useParams<PasswordResetUrlParams>();

    const isValidToken = token && token.match(patterns.userToken);

    return <UserAccountForm variant={isValidToken ? 'password-reset' : 'password-reset-init'} />;
}

export default Login;
