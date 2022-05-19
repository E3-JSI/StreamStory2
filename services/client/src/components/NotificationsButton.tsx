import React, { useRef, useState } from 'react';

import { Link as RouterLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ListItemText, PropTypes } from '@material-ui/core';
import { useTheme } from '@material-ui/core/styles';
import Badge from '@material-ui/core/Badge';
import Divider from '@material-ui/core/Divider';
import IconButton from '@material-ui/core/IconButton';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import Tooltip from '@material-ui/core/Tooltip';
import NotificationsIcon from '@material-ui/icons/Notifications';

import useSession from '../hooks/useSession';
import useStyles from './NotificationsButton.styles';

const maxNotifications = 7;

export interface NotificationsButtonProps {
    color: PropTypes.Color;
}

function NotificationsButton({ color, ...rest }: NotificationsButtonProps): JSX.Element {
    const classes = useStyles();
    const muiTheme = useTheme();
    const { t, i18n } = useTranslation();
    const [{ notifications }] = useSession();
    const buttonRef = useRef(null);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const dateTimeFormatter = new Intl.DateTimeFormat(i18n.language, {
        dateStyle: 'short',
        timeStyle: 'medium',
    });

    function toggleMenu() {
        setIsMenuOpen((value) => !value);
    }
    
    return (
        <>
            <Tooltip title={t('show_notifications')} enterDelay={muiTheme.timing.tooltipEnterDelay}>
                <IconButton
                    ref={buttonRef}
                    color={color}
                    onClick={toggleMenu}
                    aria-label={t('show_notifications')}
                    aria-controls="notifications-menu"
                    aria-haspopup="true"
                >
                    <Badge badgeContent={notifications.length} color="secondary">
                        <NotificationsIcon />
                    </Badge>
                </IconButton>
            </Tooltip>
            <Menu
                id="notifications-menu"
                anchorEl={buttonRef.current}
                open={isMenuOpen}
                getContentAnchorEl={null}
                anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'center',
                }}
                transformOrigin={{
                    vertical: 'top',
                    horizontal: 'center',
                }}
                PaperProps={{
                    className: classes.menuPaper,
                }}
                onClose={toggleMenu}
                {...rest}
            >
                {notifications
                    .sort((a, b) => b.time - a.time)
                    .slice(0, maxNotifications)
                    .map((notification) => (
                        <MenuItem
                            key={notification.id}
                            component={RouterLink}
                            to={`/profile/notifications/${notification.id}`}
                            alignItems="flex-start"
                            onClick={toggleMenu}
                        >
                            <ListItemText
                                classes={{
                                    primary: classes.listItemTextPrimary,
                                }}
                                secondary={dateTimeFormatter.format(new Date(notification.time))}
                            >
                                {notification.title}
                            </ListItemText>
                        </MenuItem>
                    ))}
                {notifications.length > maxNotifications && (
                    <>
                        <Divider light />
                        <MenuItem
                            component={RouterLink}
                            to="/profile/notifications"
                            alignItems="flex-start"
                            onClick={toggleMenu}
                        >
                            <ListItemText
                                classes={{
                                    primary: classes.listItemTextPrimary,
                                }}
                            >
                                {t("see_more")}
                            </ListItemText>
                        </MenuItem>
                    </>
                )}
            </Menu>
        </>
    );
}

export default NotificationsButton;
