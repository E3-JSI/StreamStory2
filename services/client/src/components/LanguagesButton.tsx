import React, { useRef, useState } from 'react';

import { useTranslation } from 'react-i18next';
import { ListItemText, PropTypes } from '@material-ui/core';
import { useTheme } from '@material-ui/core/styles';
import Badge from '@material-ui/core/Badge';
import IconButton from '@material-ui/core/IconButton';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import Tooltip from '@material-ui/core/Tooltip';
import TranslateIcon from '@material-ui/icons/Translate';

import { updateCurrentUserSettings, User } from '../api/users';
import config from '../config';
import useSession from '../hooks/useSession';

import languages from '../i18n/languages.json';

export interface LanguageButtonProps {
    color: PropTypes.Color;
}

function LanguagesButton({ color, ...rest }: LanguageButtonProps): JSX.Element {
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
                        return (
                            <MenuItem
                                key={languageCode}
                                data-language={languageCode}
                                selected={languageCode === i18n.language}
                                alignItems="flex-start"
                                onClick={() => {
                                    switchLanguage(languageCode);
                                }}
                            >
                                <ListItemText>{nativeName}</ListItemText>
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
