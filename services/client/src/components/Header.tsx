import React, { useRef, useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';

import { useTranslation } from 'react-i18next';
import { createStyles, makeStyles } from '@material-ui/core/styles';
import AppBar from '@material-ui/core/AppBar';
import Avatar from '@material-ui/core/Avatar';
import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';
import IconButton from '@material-ui/core/IconButton';
import Link from '@material-ui/core/Link';
import Toolbar from '@material-ui/core/Toolbar';
import Tooltip from '@material-ui/core/Tooltip';
import BrightnessHighIcon from '@material-ui/icons/BrightnessHigh';
import BrightnessLowIcon from '@material-ui/icons/BrightnessLow';
import MenuIcon from '@material-ui/icons/Menu';
import SettingsBrightnessIcon from '@material-ui/icons/SettingsBrightness';

import { User } from '../contexts/SessionContext';
import useSession from '../hooks/useSession';
import ElevationScroll from './ElevationScroll';
import Logo from './Logo';
import ThemeMenu from './ThemeMenu';
import UserAccountMenu from './UserAccountMenu';

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
        marginLeft: theme.spacing(1),
        textTransform: 'none',
        backgroundColor: 'rgba(255, 255, 255, 0.16)'
    },
    avatar: {
        // width: theme.spacing(4),
        // height: theme.spacing(4),
        // textTransform: 'uppercase',
        color: theme.palette.getContrastText(theme.palette.primary.light),
        backgroundColor: theme.palette.primary.light
    }
}));

function Header({ variant = 'full' }: HeaderProps): JSX.Element {
    const classes = useStyles();
    const { t } = useTranslation(['common']);
    const accountButtonRef = useRef(null);
    const themeButtonRef = useRef(null);
    const [{ sidebarOpen, theme, user }, setSession] = useSession();
    const [themeMenuOpen, setThemeMenuOpen] = useState(false);
    const [userAccountMenuOpen, setUserAccountMenuOpen] = useState(false);

    const loggedIn = user !== null;
    const simple = variant === 'simple';
    const themes = {
        system: {
            label: t('common:system'),
            icon: <SettingsBrightnessIcon />
        },
        light: {
            label: t('common:light'),
            icon: <BrightnessHighIcon />
        },
        dark: {
            label: t('common:dark'),
            icon: <BrightnessLowIcon />
        }
    };

    function getInitials({ email, firstName, lastName }: User) {
        const initials = [];

        if (firstName) {
            initials.push(firstName[0]);
        }

        if (lastName) {
            initials.push(lastName[0]);
        }

        if (!initials.length) {
            initials.push(email[0].toUpperCase());
        }

        return initials.join('');
    }

    function toggleThemeMenu() {
        setThemeMenuOpen((value) => !value);
    }

    function toggleUserAccountMenu() {
        setUserAccountMenuOpen((value) => !value);
    }

    function handleMenuIconClick() {
        // Toggle sidebar.
        setSession({
            sidebarOpen: !sidebarOpen
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
                    <Tooltip title={t('common:change_theme')}>
                        <IconButton
                            ref={themeButtonRef}
                            color="inherit"
                            onClick={toggleThemeMenu}
                            aria-label={t('common:change_theme')}
                            aria-controls="theme-menu"
                            aria-haspopup="true"
                        >
                            {themes[theme].icon}
                        </IconButton>
                    </Tooltip>
                    <ThemeMenu
                        id="theme-menu"
                        anchorEl={themeButtonRef.current}
                        open={themeMenuOpen}
                        toggleMenu={toggleThemeMenu}
                        onClose={toggleThemeMenu}
                        keepMounted
                    />
                    {!simple && !loggedIn && (
                        <Button
                            component={RouterLink}
                            to="/login"
                            className={classes.loginButton}
                            color="inherit"
                        >
                            {t('common:login')}
                        </Button>
                    )}
                    {!simple && user !== null && (
                        <div>
                            <Tooltip title={t('common:manage_your_account')}>
                                <IconButton
                                    ref={accountButtonRef}
                                    color="inherit"
                                    edge="end"
                                    onClick={toggleUserAccountMenu}
                                    aria-label={t('common:manage_your_account')}
                                    aria-controls="account-menu"
                                    aria-haspopup="true"
                                >
                                    <Avatar className={classes.avatar}>{getInitials(user)}</Avatar>
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
                                toggleMenu={toggleUserAccountMenu}
                                onClose={toggleUserAccountMenu}
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
