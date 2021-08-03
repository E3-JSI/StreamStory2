import React from 'react';

import clsx from 'clsx';
import { NavLink, Link as RouterLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@material-ui/core/styles';
import Drawer, { DrawerProps } from '@material-ui/core/Drawer';
import IconButton from '@material-ui/core/IconButton';
import Link from '@material-ui/core/Link';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import Toolbar from '@material-ui/core/Toolbar';
import Tooltip from '@material-ui/core/Tooltip';
import CollectionsBookmarkIcon from '@material-ui/icons/CollectionsBookmark';
import PlayCircleFilledIcon from '@material-ui/icons/PlayCircleFilled';
import BubbleChartIcon from '@material-ui/icons/BubbleChart';
import CloseIcon from '@material-ui/icons/Close';

import useSession from '../hooks/useSession';
import Logo from './Logo';
import useClientRect from '../hooks/useClientRect';

import useStyles from './SideNav.styles';

export interface SideNavProps {
    variant?: Exclude<DrawerProps['variant'], 'persistent'>;
}

export const sideNavWidth = {
    collapsed: 0,
    expanded: 0
};

function SideNav({ variant = 'permanent' }: SideNavProps): JSX.Element {
    const classes = useStyles();
    const { t } = useTranslation(['common']);
    const [{ isSideNavOpen, isSideNavExpanded, currentModel }, setSession] = useSession();
    const [drawerRect, drawerRef] = useClientRect();
    const theme = useTheme();
    const isPermanentSideNav = variant === 'permanent';
    const items = [
        {
            path: '/dashboard/offline-models',
            title: t('common:offline_models'),
            icon: <CollectionsBookmarkIcon />,
            divider: false,
            skip: false
        },
        {
            path: '/dashboard/online-models',
            title: t('common:online_models'),
            icon: <PlayCircleFilledIcon />,
            divider: currentModel !== null,
            skip: false
        },
        {
            path: `/model/${currentModel}`,
            title: t('common:current_model'),
            icon: <BubbleChartIcon />,
            divider: false,
            skip: currentModel === null
        }
    ];

    let width: string | number = 'auto';

    if (!sideNavWidth.collapsed) {
        sideNavWidth.collapsed = theme.spacing(9) + 1;
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
                isSideNavOpen: open
            });
        };
    }

    return (
        <Drawer
            variant={variant}
            open={isSideNavOpen || isPermanentSideNav}
            className={clsx(classes.root, {
                [classes.drawer]: isPermanentSideNav
            })}
            classes={{
                paper: clsx(classes.paper, {
                    [classes.drawer]: isPermanentSideNav
                })
            }}
            PaperProps={{
                ref: drawerRef,
                style: { width }
            }}
            style={{ width }}
            onClose={toggleDrawer(false)}
        >
            <Toolbar className={classes.toolbar}>
                {!isPermanentSideNav && (
                    <>
                        <Tooltip title={t('common:close_menu')}>
                            <IconButton
                                className={classes.closeButton}
                                edge="start"
                                onClick={toggleDrawer(false)}
                                autoFocus
                            >
                                <CloseIcon />
                            </IconButton>
                        </Tooltip>
                        <Link
                            component={RouterLink}
                            to="/"
                            className={classes.titleLink}
                            variant="h6"
                            color="inherit"
                            onClick={toggleDrawer(false)}
                        >
                            <Logo />
                        </Link>
                    </>
                )}
            </Toolbar>
            <div
                role="presentation"
                className={classes.drawerContainer}
                onClick={toggleDrawer(false)}
            >
                <List component="nav">
                    {items.map((item) => (item.skip ? null : (
                        <Tooltip
                            key={item.path}
                            title={isSideNavExpanded || isSideNavOpen ? '' : item.title}
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
                                                    !isSideNavExpanded
                                                    && isPermanentSideNav
                                                    && sideNavWidth.expanded
                                        })
                                    }}
                                />
                            </ListItem>
                        </Tooltip>
                    )))}
                </List>
            </div>
        </Drawer>
    );
}

export default SideNav;
