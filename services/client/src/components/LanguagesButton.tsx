import React, { useRef, useState } from 'react';

import { useTranslation } from 'react-i18next';
import { useTheme } from '@material-ui/core/styles';
import { PropTypes } from '@material-ui/core';
import Badge from '@material-ui/core/Badge';
import IconButton from '@material-ui/core/IconButton';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import Tooltip from '@material-ui/core/Tooltip';
import Typography from '@material-ui/core/Typography';
import TranslateIcon from '@material-ui/icons/Translate';
import CheckIcon from '@material-ui/icons/Check';

import { updateCurrentUserSettings, User } from '../api/users';
import config from '../config';
import useSession from '../hooks/useSession';

import useStyles from './LanguagesButton.styles';
import languages from '../i18n/languages.json';

export interface LanguageButtonProps {
    color: PropTypes.Color;
}

function LanguagesButton({ color, ...rest }: LanguageButtonProps): JSX.Element {
    const classes = useStyles();
    const muiTheme = useTheme();
    const { t, i18n } = useTranslation();
    const [{ user }, setSession] = useSession();
    const buttonRef = useRef(null);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const languageCodes = config.languages;

    function toggleMenu() {
        setIsMenuOpen((value) => !value);
    }

    async function switchLanguage(languageCode: string) {
        toggleMenu();
        i18n.changeLanguage(languageCode);
        setSession({
            language: languageCode,
        });

        if (user) {
            // Save language selection for logged in users.
            try {
                const response = await updateCurrentUserSettings({
                    language: languageCode,
                });

                if (response.data.user) {
                    // Sync session.
                    setSession({ user: response.data.user as User });
                }
            } catch {
                // Failed to save new language selection.
            }
        }
    }

    return languageCodes && languageCodes.length > 1 ? (
        <>
            <Tooltip title={t('switch_language')} enterDelay={muiTheme.timing.tooltipEnterDelay}>
                <IconButton
                    ref={buttonRef}
                    color={color}
                    onClick={toggleMenu}
                    aria-label={t('switch_language')}
                    aria-controls="languages-menu"
                    aria-haspopup="true"
                >
                    <Badge
                        badgeContent={i18n.language}
                        anchorOrigin={{
                            vertical: 'bottom',
                            horizontal: 'left',
                        }}
                    >
                        <TranslateIcon />
                    </Badge>
                </IconButton>
            </Tooltip>
            <Menu
                id="languages-menu"
                anchorEl={buttonRef.current}
                open={isMenuOpen}
                onClose={toggleMenu}
                {...rest}
            >
                {languageCodes
                    // .filter((languageCode) => languageCode !== i18n.language)
                    .map((languageCode) => {
                        const nativeName =
                            languages[languageCode as keyof typeof languages]?.nativeName ||
                            languageCode;
                        const selected = languageCode === i18n.language;
                        return (
                            <MenuItem
                                key={languageCode}
                                data-language={languageCode}
                                selected={selected}
                                alignItems="flex-start"
                                onClick={() => {
                                    switchLanguage(languageCode);
                                }}
                            >
                                <Typography className={classes.listItemText}>
                                    {nativeName}
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
        </>
    ) : (
        <></>
    );
}

export default LanguagesButton;
