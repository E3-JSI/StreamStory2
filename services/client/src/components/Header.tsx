import React, { useRef, useState } from 'react';

import clsx from 'clsx';
import { Link as RouterLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useMediaQuery, useScrollTrigger } from '@material-ui/core';
import { Theme, useTheme } from '@material-ui/core/styles';
import AppBar from '@material-ui/core/AppBar';
import Avatar from '@material-ui/core/Avatar';
import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';
import IconButton from '@material-ui/core/IconButton';
import Link from '@material-ui/core/Link';
import Toolbar from '@material-ui/core/Toolbar';
import Tooltip from '@material-ui/core/Tooltip';
import Brightness2Icon from '@material-ui/icons/Brightness2';
import BrightnessHighIcon from '@material-ui/icons/BrightnessHigh';
import BrightnessMediumIcon from '@material-ui/icons/BrightnessMedium';
import MenuIcon from '@material-ui/icons/Menu';

import { User } from '../types/api';
import useSession from '../hooks/useSession';
import { PageVariant } from './Page';
import Logo from './Logo';
import ThemeMenu from './ThemeMenu';
import UserAccountMenu from './UserAccountMenu';

import useStyles from './Header.styles';

export type HeaderVariant = PageVariant;

export interface HeaderProps {
    variant?: HeaderVariant;
}

function Header({ variant = 'application' }: HeaderProps): JSX.Element {
    const classes = useStyles();
    const muiTheme = useTheme();
    const { t } = useTranslation();
    const accountButtonRef = useRef(null);
    const themeButtonRef = useRef(null);
    const [{ isSideNavOpen, isSideNavExpanded, theme: appTheme, user }, setSession] = useSession();
    const [isThemeMenuOpen, setIsThemeMenuOpen] = useState(false);
    const [isUserAccountMenuOpen, setIsUserAccountMenuOpen] = useState(false);
    const isScreenWidthGteMd = useMediaQuery((theme: Theme) => theme.breakpoints.up('md'));
    const visibilityTrigger = useScrollTrigger();

    const isSimpleHeader = variant === 'simple';
    const isPublicHeader = variant !== 'application';
    const iconColor = isPublicHeader ? 'default' : 'inherit';
    const themes = {
        light: {
            label: t('light'),
            icon: <BrightnessHighIcon />,
        },
        dark: {
            label: t('dark'),
            icon: <Brightness2Icon />,
        },
        system: {
            label: t('system'),
            icon: <BrightnessMediumIcon />,
        },
    };
    const menuButtonTooltip =
        variant === 'application' && isScreenWidthGteMd
            ? t(isSideNavExpanded ? 'collapse_menu' : 'expand_menu')
            : t(isSideNavOpen ? 'close_menu' : 'open_menu');

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
        if (variant === 'application' && isScreenWidthGteMd) {
            setSession({
                isSideNavExpanded: !isSideNavExpanded,
            });
        } else {
            setSession({
                isSideNavOpen: !isSideNavOpen,
            });
        }
    }

    return (
        <AppBar
            position="fixed"
            color="transparent"
            className={clsx(classes.root, {
                [classes.rootPublic]: isPublicHeader,
                [classes.rootHidden]: isPublicHeader && visibilityTrigger,
            })}
        >
            <Toolbar>
                {user !== null && (
                    <Tooltip
                        title={menuButtonTooltip}
                        enterDelay={muiTheme.timing.tooltipEnterDelay}
                    >
                        <IconButton
                            edge="start"
                            className={classes.menuButton}
                            color={iconColor}
                            aria-label={menuButtonTooltip}
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
                        className={clsx(classes.logoLink, {
                            [classes.logoLinkPublic]: isPublicHeader,
                        })}
                        variant="h6"
                        color="inherit"
                    >
                        <Logo />
                    </Link>
                </Box>
                <Tooltip
                    title={t('change_theme')}
                    enterDelay={muiTheme.timing.tooltipEnterDelay}
                >
                    <IconButton
                        ref={themeButtonRef}
                        edge={isSimpleHeader ? 'end' : undefined}
                        color={iconColor}
                        onClick={toggleThemeMenu}
                        aria-label={t('change_theme')}
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
                    themes={themes}
                    toggleMenu={toggleThemeMenu}
                    onClose={toggleThemeMenu}
                    // keepMounted
                />
                {!isSimpleHeader && user === null && (
                    <Button
                        component={RouterLink}
                        to="/login"
                        className={classes.loginButton}
                        color="primary"
                    >
                        {t('login')}
                    </Button>
                )}
                {!isSimpleHeader && user !== null && (
                    <div>
                        <Tooltip
                            title={t('manage_your_account')}
                            enterDelay={muiTheme.timing.tooltipEnterDelay}
                        >
                            <IconButton
                                ref={accountButtonRef}
                                className={classes.avatarButton}
                                color="inherit"
                                // edge="end"
                                onClick={toggleUserAccountMenu}
                                aria-label={t('manage_your_account')}
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
                            // keepMounted
                        />
                    </div>
                )}
            </Toolbar>
        </AppBar>
    );
}

export default Header;
