// TODO: Remove!

import React from 'react';

import { NavLink } from 'react-router-dom';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import Tooltip from '@material-ui/core/Tooltip';

export interface SideNavItemProps {
    path: string;
    title: string;
    icon: JSX.Element;
    showTooltip?: boolean;
    divider?: boolean;
}

const useStyles = makeStyles((theme: Theme) => createStyles({
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

function SideNavItem(
    {
        path, title, icon, showTooltip = true, divider = false
    }: SideNavItemProps,
    ref: React.ForwardedRef<HTMLAnchorElement>
): JSX.Element {
    const classes = useStyles();

    return (
        <Tooltip title={showTooltip ? title : ''} placement="right">
            <ListItem
                component={NavLink}
                to={path}
                ref={ref}
                className={classes.navItem}
                divider={divider}
                button
            >
                <ListItemIcon className={classes.navItemIcon}>{icon}</ListItemIcon>
                <ListItemText primary={title} className={classes.navItemText} />
            </ListItem>
        </Tooltip>
    );
}

export default React.forwardRef(SideNavItem);
