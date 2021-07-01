import React, { useRef, useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';

import { useTranslation } from 'react-i18next';
import { createStyles, makeStyles } from '@material-ui/core/styles';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import IconButton from '@material-ui/core/IconButton';
import MenuIcon from '@material-ui/icons/Menu';
import Button from '@material-ui/core/Button';
import Box from '@material-ui/core/Box';
import Link from '@material-ui/core/Link';
import AccountCircleIcon from '@material-ui/icons/AccountCircle';
import Tooltip from '@material-ui/core/Tooltip';
import Brightness4Icon from '@material-ui/icons/Brightness4';
import Brightness7Icon from '@material-ui/icons/Brightness7';

import useSession from '../hooks/useSession';
import Logo from './Logo';
import UserAccountMenu from './UserAccountMenu';
import ElevationScroll from './ElevationScroll';

export type HeaderVariant = 'full' | 'simple';

export interface HeaderProps {
    variant?: HeaderVariant;
}

const useStyles = makeStyles((theme) => createStyles({
    root: {
        zIndex: theme.zIndex.drawer + 1,
        color: '#fff',
        backgroundColor: theme.palette.type === 'light' ? '#1976d2' : '#303030'
    },
    menuButton: {
        marginRight: theme.spacing(0.5),
        [theme.breakpoints.up('sm')]: {
            marginRight: theme.spacing(1.5)
        }
    },
    titleLink: {
        '&:hover': {
            textDecoration: 'none'
        }
    },
    loginButton: {
        // textTransform: 'none'
    }
}));

function Header({ variant = 'full' }: HeaderProps): JSX.Element {
    const classes = useStyles();
    const { t } = useTranslation(['common']);
    const accountButtonRef = useRef(null);
    const [{ sidebarOpen, theme, user }, setSession] = useSession();
    const [userAccountMenuOpen, setUserAccountMenuOpen] = useState(false);

    const loggedIn = user !== null;
    const isSimple = variant === 'simple';

    function toggleUserAccountMenu() {
        setUserAccountMenuOpen((value) => !value);
    }

    function handleMenuIconClick() {
        // Toggle sidebar.
        setSession({
            sidebarOpen: !sidebarOpen
        });
    }

    function handleThemeSwitchClick() {
        // Toggle theme.
        setSession({
            theme: theme === 'light' ? 'dark' : 'light'
        });
    }

    return (
        <ElevationScroll>
            <AppBar position="fixed" color="transparent" className={classes.root}>
                <Toolbar>
                    {loggedIn && (
                        <Tooltip title={t(sidebarOpen ? 'common:close_menu' : 'common:open_menu')}>
                            <IconButton
                                edge="start"
                                className={classes.menuButton}
                                color="inherit"
                                aria-label={t('common:open_sidebar')}
                                onClick={handleMenuIconClick}
                            >
                                <MenuIcon />
                            </IconButton>
                        </Tooltip>
                    )}
                    <Box flexGrow={1}>
                        <Link
                            component={RouterLink}
                            to="/"
                            className={classes.titleLink}
                            variant="h6"
                            color="inherit"
                        >
                            <Logo />
                        </Link>
                    </Box>
                    <Tooltip
                        title={t('common:switch_theme', {
                            type: t(theme === 'light' ? 'common:dark' : 'common:light')
                        })}
                    >
                        <IconButton color="inherit" onClick={handleThemeSwitchClick}>
                            {theme === 'light' ? <Brightness4Icon /> : <Brightness7Icon />}
                        </IconButton>
                    </Tooltip>
                    {!isSimple && !loggedIn && (
                        <Button
                            component={RouterLink}
                            to="/login"
                            className={classes.loginButton}
                            color="inherit"
                        >
                            {t('common:log_in')}
                        </Button>
                    )}
                    {!isSimple && loggedIn && (
                        <div>
                            <Tooltip title={t('common:manage_user_account')}>
                                <IconButton
                                    ref={accountButtonRef}
                                    color="inherit"
                                    edge="end"
                                    aria-label={t('common:manage_user_account')}
                                    aria-controls="account-menu"
                                    aria-haspopup="true"
                                    onClick={toggleUserAccountMenu}
                                >
                                    <AccountCircleIcon />
                                </IconButton>
                            </Tooltip>
                            <UserAccountMenu
                                id="account-menu"
                                // FIX: Router links cause broken html list (<a>
                                // inside <ul>). Change root element to <div>
                                // (MUI 4.x doesn't support component prop on Menu).
                                // component="div"
                                anchorEl={accountButtonRef.current}
                                open={userAccountMenuOpen}
                                anchorOrigin={{
                                    vertical: 'top',
                                    horizontal: 'right'
                                }}
                                transformOrigin={{
                                    vertical: 'top',
                                    horizontal: 'right'
                                }}
                                onClose={toggleUserAccountMenu}
                                toggleMenu={toggleUserAccountMenu}
                                keepMounted
                            />
                        </div>
                    )}
                </Toolbar>
            </AppBar>
        </ElevationScroll>
    );
}

export default Header;
