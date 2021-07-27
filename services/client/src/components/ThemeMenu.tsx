import React from 'react';

import axios from 'axios';
import clsx from 'clsx';
import { useTranslation } from 'react-i18next';
import { createStyles, makeStyles, Theme } from '@material-ui/core';
import Menu, { MenuProps } from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import BrightnessHighIcon from '@material-ui/icons/BrightnessHigh';
import BrightnessLowIcon from '@material-ui/icons/BrightnessLow';
import CheckIcon from '@material-ui/icons/Check';
import SettingsBrightnessIcon from '@material-ui/icons/SettingsBrightness';

import { getUserSession, AppTheme } from '../contexts/SessionContext';
import useSession from '../hooks/useSession';

export interface ThemeMenuProps extends MenuProps {
    toggleMenu: () => void;
}

const useStyles = makeStyles((theme: Theme) => createStyles({
    listItemIcon: {
        minWidth: 0,
        marginRight: theme.spacing(2)
    },
    listItemIconSelected: {
        marginRight: 0,
        marginLeft: theme.spacing(2),
        color: theme.palette.success.main
    },
    listItemIconEmpty: {
        minWidth: theme.spacing(5)
    }
}));

function ThemeMenu(
    { open, toggleMenu, ...rest }: ThemeMenuProps,
    ref: React.ForwardedRef<HTMLUListElement>
) {
    const classes = useStyles();
    const { t } = useTranslation(['common']);
    const [{ theme, user }, setSession] = useSession();

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

    async function handleThemeItemClick(event: React.MouseEvent<HTMLLIElement>) {
        toggleMenu();

        const newTheme = event.currentTarget.dataset.theme as AppTheme;
        setSession({
            theme: newTheme
        });

        if (user) {
            // Save theme selection for logged in users.
            try {
                const response = await axios.put('/api/users/current', {
                    theme: newTheme
                });

                if (response.data.user) {
                    // Sync session.
                    setSession(getUserSession(response.data.user));
                }
            } catch {
                // Failed to save new theme selection.
            }
        }
    }

    return (
        <Menu ref={ref} open={open} {...rest}>
            {Object.keys(themes).map((key) => {
                const themeKey = key as AppTheme;
                const selected = themeKey === theme;
                return (
                    <MenuItem
                        key={key}
                        selected={selected}
                        onClick={handleThemeItemClick}
                        data-theme={themeKey}
                    >
                        {/* {selected ? (
                            <ListItemIcon
                                className={clsx(classes.listItemIcon, classes.listItemIconSelected)}
                            >
                                <CheckIcon />
                            </ListItemIcon>
                        ) : (
                            <ListItemIcon className={classes.listItemIcon}>
                                {themes[themeKey].icon}
                            </ListItemIcon>
                        )} */}

                        <ListItemIcon className={classes.listItemIcon}>
                            {themes[themeKey].icon}
                        </ListItemIcon>
                        <ListItemText>{themes[themeKey].label}</ListItemText>
                        {selected ? (
                            <ListItemIcon
                                className={clsx(classes.listItemIcon, classes.listItemIconSelected)}
                            >
                                <CheckIcon />
                            </ListItemIcon>
                        ) : (
                            <ListItemIcon className={classes.listItemIconEmpty}>
                                {/* {themes[themeKey].icon} */}
                            </ListItemIcon>
                        )}
                    </MenuItem>
                );
            })}
        </Menu>
    );
}

export default React.forwardRef(ThemeMenu);
