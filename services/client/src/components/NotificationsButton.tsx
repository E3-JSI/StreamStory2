import React, { useRef, useState } from 'react';

import { Link as RouterLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ListItemText, PropTypes } from '@material-ui/core';
import { useTheme } from '@material-ui/core/styles';
import Badge from '@material-ui/core/Badge';
import IconButton from '@material-ui/core/IconButton';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import Tooltip from '@material-ui/core/Tooltip';
import NotificationsIcon from '@material-ui/icons/Notifications';

import useSession from '../hooks/useSession';

const ITEM_HEIGHT = 68;

export interface NotificationsButtonProps {
    color: PropTypes.Color;
}

function NotificationsButton({ color, ...rest }: NotificationsButtonProps): JSX.Element {
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
            <Tooltip
                title={`${notifications.length} notifications`}
                enterDelay={muiTheme.timing.tooltipEnterDelay}
            >
                <IconButton
                    ref={buttonRef}
                    color={color}
                    onClick={toggleMenu}
                    aria-label={t('change_theme')}
                    aria-controls="notifications-menu"
                    aria-haspopup="true"
                >
                    <Badge badgeContent={notifications.length} color="secondary">
                        <NotificationsIcon />
                    </Badge>
                </IconButton>
            </Tooltip>
            <Menu
                anchorEl={buttonRef.current}
                open={isMenuOpen}
                anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'center',
                }}
                transformOrigin={{
                    vertical: 'top',
                    horizontal: 'center',
                }}
                PaperProps={{
                    style: {
                        maxHeight: ITEM_HEIGHT * 8,
                        // width: '20ch',
                    },
                }}
                onClose={toggleMenu}
                {...rest}
            >
                {notifications.map((notification) => (
                    <MenuItem
                        key={notification.id}
                        component={RouterLink}
                        to="/profile/notifications"
                        alignItems="flex-start"
                        onClick={toggleMenu}
                    >
                        <ListItemText
                            secondary={dateTimeFormatter.format(new Date(notification.time))}
                        >
                            {notification.title}
                        </ListItemText>
                    </MenuItem>
                ))}
            </Menu>
        </>
    );
}

export default NotificationsButton;
