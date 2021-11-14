import React from 'react';

import Box from '@material-ui/core/Box';
import Menu, { MenuProps } from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import Typography from '@material-ui/core/Typography';
import CheckIcon from '@material-ui/icons/Check';

import { updateCurrentUserSettings, User } from '../api/users';
import { AppTheme } from '../contexts/SessionContext';
import useSession from '../hooks/useSession';

import useStyles from './ThemeMenu.styles';

export interface ThemeList {
    [theme: string]: {
        label: string;
        icon: JSX.Element;
    };
}

export interface ThemeMenuProps extends MenuProps {
    themes: ThemeList;
    toggleMenu: () => void;
}

function ThemeMenu(
    { open, themes, toggleMenu, ...rest }: ThemeMenuProps,
    ref: React.ForwardedRef<HTMLUListElement>,
) {
    const classes = useStyles();
    const [{ theme, user }, setSession] = useSession();

    async function handleThemeItemClick(event: React.MouseEvent<HTMLLIElement>) {
        toggleMenu();

        const newTheme = event.currentTarget.dataset.theme as AppTheme;
        setSession({
            theme: newTheme,
        });

        if (user) {
            // Save theme selection for logged in users.
            try {
                const response = await updateCurrentUserSettings({
                    theme: newTheme,
                });

                if (response.data.user) {
                    // Sync session.
                    setSession({ user: response.data.user as User });
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
                        <ListItemIcon className="narrow">
                            <Box className={classes.listItemIcon} clone>
                                {themes[themeKey].icon}
                            </Box>
                        </ListItemIcon>
                        <Typography className={classes.listItemText}>
                            {themes[themeKey].label}
                        </Typography>
                        {selected ? (
                            <ListItemIcon className={classes.listItemIconSelected}>
                                <CheckIcon fontSize="small" />
                            </ListItemIcon>
                        ) : (
                            <ListItemIcon className={classes.listItemIconEmpty} />
                        )}
                    </MenuItem>
                );
            })}
        </Menu>
    );
}

export default React.forwardRef(ThemeMenu);
