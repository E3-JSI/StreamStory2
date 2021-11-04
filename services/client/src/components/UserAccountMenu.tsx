import React from 'react';

import axios from 'axios';
import { Link as RouterLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Divider from '@material-ui/core/Divider';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import Menu, { MenuProps } from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import Typography from '@material-ui/core/Typography';
import AccountCircleIcon from '@material-ui/icons/AccountCircle';
import ExitToAppIcon from '@material-ui/icons/ExitToApp';

import { AuthResponse } from '../api/auth';
import { User } from '../api/users';
import { getResponseErrors } from '../utils/errors';
import useSession from '../hooks/useSession';
import useSnackbar from '../hooks/useSnackbar';

export interface UserAccountMenuProps extends MenuProps {
    toggleMenu: () => void;
}

function UserAccountMenu(
    { open, toggleMenu, ...rest }: UserAccountMenuProps,
    ref: React.ForwardedRef<HTMLDivElement>,
) {
    const { t } = useTranslation();
    const [{ user }, setSession] = useSession();
    const [showSnackbar] = useSnackbar();

    function getUserDisplayName({ email, name }: User) {
        const displayName = [];

        if (name) {
            displayName.push(name);
        }

        if (!displayName.length) {
            displayName.push(email);
        }

        return displayName.join(' ');
    }

    async function handleLogoutClick() {
        toggleMenu();

        try {
            const response = await axios.post<AuthResponse>('/api/auth/logout');

            if (response.data.success) {
                setSession({
                    user: null,
                });
            }
        } catch (error) {
            const errors = getResponseErrors(error, t);

            if (Array.isArray(errors)) {
                showSnackbar({
                    message: errors,
                    severity: 'error',
                });
            }
        }
    }

    return (
        <Menu ref={ref} open={open} {...rest}>
            <MenuItem
                component={RouterLink}
                to="/profile"
                alignItems="flex-start"
                onClick={toggleMenu}
            >
                <ListItemIcon className="narrow">
                    <AccountCircleIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText secondary={getUserDisplayName(user as User)}>
                    {t('my_profile')}
                </ListItemText>
            </MenuItem>
            <Divider light />
            <MenuItem component="a" onClick={handleLogoutClick}>
                <ListItemIcon className="narrow">
                    <ExitToAppIcon fontSize="small" />
                </ListItemIcon>
                <Typography>{t('log_out')}</Typography>
            </MenuItem>
        </Menu>
    );
}

export default React.forwardRef(UserAccountMenu);
