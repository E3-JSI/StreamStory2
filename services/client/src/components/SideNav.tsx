import React from 'react';

import clsx from 'clsx';
import { NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { createStyles, makeStyles } from '@material-ui/core/styles';
import Drawer from '@material-ui/core/Drawer';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import Tooltip from '@material-ui/core/Tooltip';
import CollectionsBookmarkIcon from '@material-ui/icons/CollectionsBookmark';
import PlayCircleFilledIcon from '@material-ui/icons/PlayCircleFilled';
import BubbleChartIcon from '@material-ui/icons/BubbleChart';

import useSession from '../hooks/useSession';

export const sidebarWidth = {
    sm: 190,
    lg: 210
};

const useStyles = makeStyles((theme) => createStyles({
    root: {
        flexShrink: 0,
        whiteSpace: 'nowrap'
    },
    rootOpen: {
        width: sidebarWidth.sm,
        [theme.breakpoints.up('sm')]: {
            width: sidebarWidth.lg
        },
        transition: theme.transitions.create('width', {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen
        })
    },
    rootClosed: {
        overflowX: 'hidden',
        width: theme.spacing(7) + 1,
        '& .MuiListItemText-root': {
            opacity: 0
        },
        [theme.breakpoints.up('sm')]: {
            width: theme.spacing(9) + 1
        },
        transition: theme.transitions.create('width', {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen
        })
    },
    toolbarPlaceholder: {
        ...theme.mixins.toolbar
    },
    drawerContainer: {
        overflowX: 'hidden',
        overflowY: 'auto'
    },
    navItem: {
        paddingLeft: theme.spacing(2),
        paddingRight: theme.spacing(2),
        '&.active': {
            backgroundColor: theme.palette.action.selected
        },
        [theme.breakpoints.up('sm')]: {
            paddingLeft: theme.spacing(3),
            paddingRight: theme.spacing(3)
        }
    },
    navItemIcon: {
        minWidth: theme.spacing(5),
        [theme.breakpoints.up('sm')]: {
            minWidth: theme.spacing(6)
        }
    },
    navItemText: {
        transition: theme.transitions.create('opacity', {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.standard
        })
    }
}));

function SideNav(): JSX.Element {
    const classes = useStyles();
    const { t } = useTranslation(['common']);
    const [{ sidebarOpen, currentModel }] = useSession();
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

    return (
        <Drawer
            variant="permanent"
            className={clsx(classes.root, {
                [classes.rootOpen]: sidebarOpen,
                [classes.rootClosed]: !sidebarOpen
            })}
            classes={{
                paper: clsx({
                    [classes.rootOpen]: sidebarOpen,
                    [classes.rootClosed]: !sidebarOpen
                })
            }}
        >
            <div className={classes.toolbarPlaceholder} />
            <div className={classes.drawerContainer}>
                <List component="nav">
                    {items.map((item) => (item.skip ? null : (
                        <Tooltip
                            key={item.path}
                            title={sidebarOpen ? '' : item.title}
                            placement="right"
                        >
                            <ListItem
                                component={NavLink}
                                to={item.path}
                                className={classes.navItem}
                                divider={item.divider}
                                button
                            >
                                <ListItemIcon className={classes.navItemIcon}>
                                    {item.icon}
                                </ListItemIcon>
                                <ListItemText
                                    primary={item.title}
                                    className={classes.navItemText}
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
