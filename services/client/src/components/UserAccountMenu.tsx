import React from 'react';

import axios from 'axios';
import { Link as RouterLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Menu, { MenuProps } from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import Divider from '@material-ui/core/Divider';
import AccountCircleIcon from '@material-ui/icons/AccountCircle';
import ExitToAppIcon from '@material-ui/icons/ExitToApp';

import { getResponseErrors } from '../utils/errors';
import { User } from '../contexts/SessionContext';
import useSession from '../hooks/useSession';
import useSnackbar from '../hooks/useSnackbar';

import useStyles from './UserAccountMenu.styles';

export interface UserAccountMenuProps extends MenuProps {
    toggleMenu: () => void;
}

function UserAccountMenu(
    { open, toggleMenu, ...rest }: UserAccountMenuProps,
    ref: React.ForwardedRef<HTMLDivElement>
) {
    const classes = useStyles();
    const { t } = useTranslation(['common', 'error']);
    const [{ user }, setSession] = useSession();
    const [showSnackbar] = useSnackbar();

    function getUserDisplayName({ email, firstName, lastName }: User) {
        const displayName = [];

        if (firstName) {
            displayName.push(firstName);
        }

        if (lastName) {
            displayName.push(lastName);
        }

        if (!displayName.length) {
            displayName.push(email);
        }

        return displayName.join(' ');
    }

    async function handleLogoutClick() {
        toggleMenu();

        try {
            const response = await axios.post('/api/auth/logout');

            if (response.data.success) {
                setSession({
                    user: null
                });
            }
        } catch (error) {
            const errors = getResponseErrors(error, t);

            if (Array.isArray(errors)) {
                showSnackbar({
                    message: errors,
                    severity: 'error'
                });
            }
        }
    }

    return (
        <Menu ref={ref} open={open} {...rest}>
            <MenuItem component={RouterLink} to="/profile" alignItems="center" onClick={toggleMenu}>
                <ListItemIcon className={classes.listItemIcon}>
                    <AccountCircleIcon />
                </ListItemIcon>
                <ListItemText secondary={getUserDisplayName(user as User)}>
                    {t('common:my_profile')}
                </ListItemText>
            </MenuItem>
            <Divider light />
            <MenuItem component="a" onClick={handleLogoutClick}>
                <ListItemIcon className={classes.listItemIcon}>
                    <ExitToAppIcon />
                </ListItemIcon>
                <ListItemText>{t('common:log_out')}</ListItemText>
            </MenuItem>
        </Menu>
    );
}

export default React.forwardRef(UserAccountMenu);
