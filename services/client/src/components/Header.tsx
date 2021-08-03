import React, { useRef, useState } from 'react';

import { Link as RouterLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useMediaQuery } from '@material-ui/core';
import { Theme } from '@material-ui/core/styles';
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
import { PageVariant } from './Page';
import ElevationScroll from './ElevationScroll';
import Logo from './Logo';
import ThemeMenu from './ThemeMenu';
import UserAccountMenu from './UserAccountMenu';

import useStyles from './Header.styles';

export type HeaderVariant = PageVariant;

export interface HeaderProps {
    variant?: HeaderVariant;
}

function Header({ variant = 'dashboard' }: HeaderProps): JSX.Element {
    const classes = useStyles();
    const { t } = useTranslation(['common']);
    const accountButtonRef = useRef(null);
    const themeButtonRef = useRef(null);
    const [{
        isSideNavOpen, isSideNavExpanded, theme: appTheme, user
    }, setSession] = useSession();
    const [isThemeMenuOpen, setIsThemeMenuOpen] = useState(false);
    const [isUserAccountMenuOpen, setIsUserAccountMenuOpen] = useState(false);
    const isScreenWidthGteMd = useMediaQuery((theme: Theme) => theme.breakpoints.up('md'));

    const isSimpleHeader = variant === 'simple';
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
        setIsThemeMenuOpen((value) => !value);
    }

    function toggleUserAccountMenu() {
        setIsUserAccountMenuOpen((value) => !value);
    }

    function handleMenuIconClick() {
        // Toggle sidebar.
        if (variant === 'dashboard' && isScreenWidthGteMd) {
            setSession({
                isSideNavExpanded: !isSideNavExpanded
            });
        } else {
            setSession({
                isSideNavOpen: !isSideNavOpen
            });
        }
    }

    return (
        <ElevationScroll>
            <AppBar position="fixed" color="transparent" className={classes.root}>
                <Toolbar>
                    {user !== null && (
                        <Tooltip
                            title={
                                variant === 'dashboard'
                                    ? t(
                                        isSideNavExpanded
                                            ? 'common:collapse_menu'
                                            : 'common:expand_menu'
                                    )
                                    : t(isSideNavOpen ? 'common:close_menu' : 'common:open_menu')
                            }
                        >
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
                            edge={isSimpleHeader ? 'end' : undefined}
                            color="inherit"
                            onClick={toggleThemeMenu}
                            aria-label={t('common:change_theme')}
                            aria-controls="theme-menu"
                            aria-haspopup="true"
                        >
                            {themes[appTheme].icon}
                        </IconButton>
                    </Tooltip>
                    <ThemeMenu
                        id="theme-menu"
                        anchorEl={themeButtonRef.current}
                        open={isThemeMenuOpen}
                        toggleMenu={toggleThemeMenu}
                        onClose={toggleThemeMenu}
                        keepMounted
                    />
                    {!isSimpleHeader && user === null && (
                        <Button
                            component={RouterLink}
                            to="/login"
                            className={classes.loginButton}
                            color="inherit"
                        >
                            {t('common:login')}
                        </Button>
                    )}
                    {!isSimpleHeader && user !== null && (
                        <div>
                            <Tooltip title={t('common:manage_your_account')}>
                                <IconButton
                                    ref={accountButtonRef}
                                    className={classes.avatarButton}
                                    color="inherit"
                                    // edge="end"
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
                                open={isUserAccountMenuOpen}
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
