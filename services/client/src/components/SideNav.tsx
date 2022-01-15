import React from 'react';

import clsx from 'clsx';
import { NavLink, Link as RouterLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@material-ui/core/styles';
import Box from '@material-ui/core/Box';
import Drawer, { DrawerProps } from '@material-ui/core/Drawer';
import IconButton from '@material-ui/core/IconButton';
import Link from '@material-ui/core/Link';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import Toolbar from '@material-ui/core/Toolbar';
import Tooltip from '@material-ui/core/Tooltip';
import UpdateIcon from '@material-ui/icons/Update';
import BubbleChartIcon from '@material-ui/icons/BubbleChart';
import CloseIcon from '@material-ui/icons/Close';

import useSession from '../hooks/useSession';
import useClientRect from '../hooks/useClientRect';
import Logo from './Logo';
import UpdateDisabledIcon from './icons/UpdateDisabled';

import useStyles from './SideNav.styles';

export interface SideNavProps {
    variant?: Exclude<DrawerProps['variant'], 'persistent'>;
}

export const sideNavWidth = {
    collapsed: 0,
    expanded: 0,
};

function SideNav({ variant = 'permanent' }: SideNavProps): JSX.Element {
    const classes = useStyles();
    const muiTheme = useTheme();
    const { t } = useTranslation();
    const [{ isSideNavOpen, isSideNavExpanded, currentModel }, setSession] = useSession();
    const [drawerRect, drawerRef] = useClientRect();
    const isPermanentSideNav = variant === 'permanent';
    const items = [
        {
            path: '/dashboard/offline-models',
            title: t('offline_models'),
            icon: <UpdateDisabledIcon />,
            divider: false,
        },
        {
            path: '/dashboard/online-models',
            title: t('online_models'),
            icon: <UpdateIcon />,
            divider: currentModel.length > 0,
        },
        ...currentModel.map((model) => ({
            path: `/model/${model.id}`,
            title: model.name,
            icon: <BubbleChartIcon />,
            divider: false,
        })),
    ];

    let width: string | number = 'auto';

    if (!sideNavWidth.collapsed) {
        sideNavWidth.collapsed = muiTheme.spacing(9) + 1;
    }

    if (drawerRect !== null && !sideNavWidth.expanded) {
        sideNavWidth.expanded = drawerRect.width;
    }

    if (isPermanentSideNav && sideNavWidth.expanded) {
        width = isSideNavExpanded ? sideNavWidth.expanded : sideNavWidth.collapsed;
    }

    function toggleDrawer(open: boolean) {
        return () => {
            setSession({
                isSideNavOpen: open,
            });
        };
    }

    return (
        <Drawer
            variant={variant}
            open={isSideNavOpen || isPermanentSideNav}
            className={clsx(classes.root, {
                [classes.drawer]: isPermanentSideNav,
            })}
            classes={{
                paper: clsx(classes.paper, {
                    [classes.drawer]: isPermanentSideNav,
                }),
            }}
            PaperProps={{
                ref: drawerRef,
                style: { width },
            }}
            style={{ width }}
            onClose={toggleDrawer(false)}
        >
            <Toolbar className={classes.toolbar}>
                {!isPermanentSideNav && (
                    <>
                        <Tooltip
                            title={t('close_menu')}
                            enterDelay={muiTheme.timing.tooltipEnterDelay}
                        >
                            <IconButton
                                className={classes.closeButton}
                                edge="start"
                                aria-label={t('close_menu')}
                                onClick={toggleDrawer(false)}
                                autoFocus
                            >
                                <CloseIcon />
                            </IconButton>
                        </Tooltip>
                        <Link
                            component={RouterLink}
                            to="/"
                            className={clsx(classes.logoLink)}
                            variant="h6"
                            color="inherit"
                            onClick={toggleDrawer(false)}
                        >
                            <Logo />
                        </Link>
                    </>
                )}
            </Toolbar>
            <Box
                role="presentation"
                className={classes.drawerContainer}
                onClick={toggleDrawer(false)}
            >
                <List component="nav">
                    {items.map((item) => (
                        <Tooltip
                            key={item.path}
                            title={item.title}
                            enterDelay={muiTheme.timing.tooltipEnterDelay}
                            placement="right"
                        >
                            <ListItem
                                component={NavLink}
                                to={item.path}
                                className={clsx(classes.navItem)}
                                divider={item.divider}
                                button
                            >
                                <ListItemIcon className={clsx(classes.navItemIcon)}>
                                    {item.icon}
                                </ListItemIcon>
                                <ListItemText
                                    primary={item.title}
                                    classes={{
                                        primary: clsx(classes.navItemText, {
                                            [classes.navItemTextCollapsed]:
                                                !isSideNavExpanded &&
                                                isPermanentSideNav &&
                                                sideNavWidth.expanded,
                                        }),
                                    }}
                                />
                            </ListItem>
                        </Tooltip>
                    ))}
                </List>
            </Box>
        </Drawer>
    );
}

export default SideNav;
