import React from 'react';

import axios from 'axios';
import { Link as RouterLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
// import { createStyles, makeStyles } from '@material-ui/core/styles';
import Menu, { MenuProps } from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemAvatar from '@material-ui/core/ListItemAvatar';
import ListItemText from '@material-ui/core/ListItemText';
import Avatar from '@material-ui/core/Avatar';
import Divider from '@material-ui/core/Divider';
import ExitToAppIcon from '@material-ui/icons/ExitToApp';
import PersonIcon from '@material-ui/icons/Person';

import useSession from '../hooks/useSession';
import useSnackbar from '../hooks/useSnackbar';
import { getResponseErrors } from '../utils/errors';

export interface UserAccountMenuProps extends MenuProps {
    toggleMenu: () => void;
}

// const useStyles = makeStyles((theme) => createStyles({
//     menuItemIcon: {
//         minWidth: 24 + theme.spacing(2)
//     }
// }));

const UserAccountMenu = React.forwardRef(
    (
        { open, toggleMenu, ...rest }: UserAccountMenuProps,
        ref: React.ForwardedRef<HTMLDivElement>
    ) => {
        // const classes = useStyles();
        const { t } = useTranslation(['common', 'error']);

        const [{ user }, setSession] = useSession();
        const [showSnackbar] = useSnackbar();

        async function handleLogoutClick() {
            toggleMenu();

            try {
                const response = await axios.delete('/api/auth/logout');

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
                <MenuItem
                    component={RouterLink}
                    to="/profile"
                    alignItems="flex-start"
                    onClick={toggleMenu}
                >
                    <ListItemAvatar>
                        <Avatar>
                            <PersonIcon />
                        </Avatar>
                    </ListItemAvatar>
                    <ListItemText secondary={user?.email}>{t('common:profile')}</ListItemText>
                </MenuItem>
                <Divider light />
                <MenuItem component="a" onClick={handleLogoutClick}>
                    <ListItemIcon>
                        <ExitToAppIcon />
                    </ListItemIcon>
                    <ListItemText>{t('common:log_out')}</ListItemText>
                </MenuItem>
            </Menu>
        );
    }
);

export default UserAccountMenu;
