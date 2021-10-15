import React, { useRef, useState } from 'react';

import clsx from 'clsx';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@material-ui/core/styles';
import { PaperProps } from '@material-ui/core/Paper';
import Box from '@material-ui/core/Box';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import CardHeader from '@material-ui/core/CardHeader';
import Checkbox from '@material-ui/core/Checkbox';
import Divider from '@material-ui/core/Divider';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import IconButton from '@material-ui/core/IconButton';
import InputBase from '@material-ui/core/InputBase';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import Switch from '@material-ui/core/Switch';
import Tooltip from '@material-ui/core/Tooltip';
import Typography from '@material-ui/core/Typography';
import CloseIcon from '@material-ui/icons/Close';
import SearchIcon from '@material-ui/icons/Search';

import { Option } from '../types/select';
import { setRef, setInputRef, triggerChangeEvent } from '../utils/forms';
import useDeepCompareEffect from '../hooks/useDeepCompareEffect';
import Mark from './Mark';

import useStyles from './Multiselect.styles';

interface MultiselectOption extends Option {
    selected: boolean;
}

export interface MultiselectProps extends Omit<PaperProps, 'onChange'> {
    id: string;
    label: string;
    options: Option[];
    name?: string;
    value?: string | string[];
    defaultValue?: string | string[];
    inputProps?: React.SelectHTMLAttributes<HTMLSelectElement> &
        React.RefAttributes<HTMLSelectElement>;
    inputRef?: React.ForwardedRef<HTMLSelectElement>;
    status?: boolean;
    switchControl?: boolean | { offLabel: string; onLabel: string };
    searchPlaceholder?: string;
    selectionI18nKey?: string;
    emptyI18nKey?: string;
    disabled?: boolean;
    // onChange?: (event: React.ChangeEvent<HTMLSelectElement>) => void;
    onChange?: React.FormEventHandler<HTMLElement>;
}

function Multiselect({
    id,
    label,
    name,
    options,
    value,
    defaultValue,
    inputProps,
    inputRef,
    status = true,
    variant = 'outlined',
    switchControl = false,
    searchPlaceholder = '',
    selectionI18nKey = 'm_of_n_items_selected',
    emptyI18nKey = 'n_items',
    disabled = false,
    // onChange,
    ...other
}: MultiselectProps): JSX.Element {
    const classes = useStyles();
    const muiTheme = useTheme();
    const { t } = useTranslation();
    const [currentOptions, setCurrentOptions] = useState<MultiselectOption[]>(
        options.map(getOptionMapping()),
    );
    const [search, setSearch] = useState<string | null>(null);
    const selectRef = useRef<HTMLSelectElement | null>(null);
    const selectId = inputProps?.id ?? `${id}-select`;
    const selectedValues = currentOptions.reduce<string[]>(
        (values, option) => (option.selected ? [...values, option.value] : values),
        [],
    );
    const selectedCount = selectedValues.length;

    useDeepCompareEffect(() => {
        // Re-initialize selection state when options change.
        setCurrentOptions(options.map(getOptionMapping()));
        setSearch(null);
    }, [options, value]);

    function getOptionMapping() {
        const initialValue = defaultValue !== undefined ? defaultValue : value;
        let initialValues: string[] = [];

        if (initialValue !== undefined) {
            initialValues = Array.isArray(initialValue) ? initialValue : [initialValue];
        }

        return (option: Option) => ({
            ...option,
            selected: initialValues.indexOf(option.value) > -1,
        });
    }

    function setSelectRef(instance: HTMLSelectElement | null) {
        selectRef.current = instance;

        if (inputProps) {
            setRef(inputProps, instance);
        }

        if (inputRef) {
            setInputRef(inputRef, instance);
        }
    }

    function matchSearch(option: Option): boolean {
        return search === null || option.label.search(new RegExp(search as string, 'i')) > -1;
    }

    function countSelected(): number {
        return currentOptions.reduce((count, option) => count + Number(option.selected), 0);
    }

    function toggleSearch(visible?: boolean) {
        const isSearchVisible = visible !== undefined ? visible : !(search !== null);
        setSearch(isSearchVisible ? '' : null);
    }

    function handleSearchChange(event: React.ChangeEvent<HTMLInputElement>) {
        event.stopPropagation();
        setSearch(event.target.value);
    }

    function handleSearchInputKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
        if (event.code === 'Escape') {
            event.stopPropagation();
            toggleSearch(false);
        }
    }

    function handleToggleSearch() {
        toggleSearch();
    }

    function handleToggleAllClick() {
        const selected = countSelected() < currentOptions.length;
        setCurrentOptions(currentOptions.map((option) => ({ ...option, selected })));
        triggerChangeEvent(selectRef);
    }

    function handleItemClick(event: React.MouseEvent<HTMLDivElement>, i: number) {
        event.preventDefault();
        setCurrentOptions((state) => {
            const newState = [...state];
            newState[i] = { ...state[i], selected: !state[i].selected };
            return newState;
        });
        triggerChangeEvent(selectRef);
    }

    function handleSelectChange(event: React.ChangeEvent<HTMLSelectElement>) {
        // event.stopPropagation();

        // if (onChange) {
        //     onChange(event);
        // }

        if (inputProps?.onChange) {
            inputProps.onChange(event);
        }
    }

    function handleCheckboxChange(event: React.ChangeEvent<HTMLInputElement>) {
        event.stopPropagation();
    }

    return (
        <Card variant={variant} {...other}>
            <CardHeader
                className={classes.cardHeader}
                classes={{
                    avatar: classes.avatar,
                    content: classes.cardHeaderContent,
                }}
                avatar={
                    search === null &&
                    !switchControl && (
                        <Checkbox
                            className={classes.checkbox}
                            checked={selectedCount > 0 && selectedCount === currentOptions.length}
                            indeterminate={
                                selectedCount > 0 && selectedCount < currentOptions.length
                            }
                            size="small"
                            color="primary"
                            disabled={!currentOptions.length || disabled}
                            inputProps={{ 'aria-label': t('select_all_items') }}
                            onClick={handleToggleAllClick}
                            onChange={handleCheckboxChange}
                        />
                    )
                }
                title={
                    <>
                        {search === null ? (
                            <Typography
                                className={clsx(classes.title, {
                                    [classes.textDisabled]: !currentOptions.length || disabled,
                                })}
                                variant="body2"
                                component="label"
                                htmlFor={selectId}
                                // color="error"
                                noWrap
                            >
                                {label}
                            </Typography>
                        ) : (
                            <InputBase
                                classes={{
                                    root: classes.searchControlRoot,
                                    input: classes.searchControlInput,
                                }}
                                placeholder={searchPlaceholder || t('search')}
                                value={search}
                                disabled={disabled}
                                onChange={handleSearchChange}
                                onKeyDown={handleSearchInputKeyDown}
                                autoFocus
                            />
                        )}
                        <Tooltip
                            title={
                                !currentOptions.length
                                    ? ''
                                    : (search !== null && t('close_search')) ||
                                      searchPlaceholder ||
                                      t('search')
                            }
                            enterDelay={muiTheme.timing.tooltipEnterDelay}
                        >
                            <Box component="span">
                                <IconButton
                                    className={classes.searchButton}
                                    size="small"
                                    edge="end"
                                    color={search !== null ? 'secondary' : 'default'}
                                    disabled={!currentOptions.length || disabled}
                                    onClick={handleToggleSearch}
                                >
                                    {search !== null ? (
                                        <CloseIcon fontSize="small" />
                                    ) : (
                                        <SearchIcon fontSize="small" />
                                    )}
                                </IconButton>
                            </Box>
                        </Tooltip>
                    </>
                }
                disableTypography
            />
            <Divider />
            <CardContent
                className={clsx(classes.cardContent, {
                    [classes.cardContentNoStatus]: !status,
                })}
            >
                <List className={classes.list} component="div" role="list" dense>
                    {currentOptions.map(
                        (option, i) =>
                            matchSearch(option) && (
                                <ListItem
                                    key={option.value}
                                    className={classes.listItem}
                                    role="listitem"
                                    data-value={option.value}
                                    disabled={!!option?.disabled || disabled}
                                    onClick={(e) => {
                                        handleItemClick(e, i);
                                    }}
                                    button
                                >
                                    {!switchControl && (
                                        <ListItemIcon className={classes.listItemIcon}>
                                            <Checkbox
                                                id={`${id}-checkbox-${option.value}`}
                                                className={classes.checkbox}
                                                checked={option.selected}
                                                value={option.value}
                                                size="small"
                                                color="primary"
                                                tabIndex={-1}
                                                onChange={handleCheckboxChange}
                                            />
                                        </ListItemIcon>
                                    )}
                                    <ListItemText
                                        className={classes.listItemText}
                                        classes={{ primary: classes.listItemTextContent }}
                                        primaryTypographyProps={{
                                            className: classes.listItemlabel,
                                            component: 'label',
                                            htmlFor: `${id}-checkbox-${option.value}`,
                                        }}
                                    >
                                        <Mark term={search ?? ''}>{option.label}</Mark>
                                    </ListItemText>
                                    {switchControl && (
                                        <ListItemIcon className={classes.listItemIconEnd}>
                                            <FormControlLabel
                                                control={
                                                    <Switch
                                                        id={`${id}-checkbox-${option.value}`}
                                                        checked={option.selected}
                                                        value={option.value}
                                                        size="small"
                                                        color="primary"
                                                        tabIndex={-1}
                                                        onChange={handleCheckboxChange}
                                                    />
                                                }
                                                label={
                                                    <Typography
                                                        variant="caption"
                                                        color="textSecondary"
                                                    >
                                                        {typeof switchControl === 'object' &&
                                                            (option.selected
                                                                ? switchControl.onLabel
                                                                : switchControl.offLabel)}
                                                    </Typography>
                                                }
                                                labelPlacement="start"
                                            />
                                        </ListItemIcon>
                                    )}
                                </ListItem>
                            ),
                    )}
                </List>
                <Box display="none">
                    <select
                        id={selectId}
                        ref={setSelectRef}
                        name={name}
                        value={selectedValues}
                        {...inputProps}
                        onChange={handleSelectChange}
                        multiple
                    >
                        {currentOptions.map((option) => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </select>
                </Box>
            </CardContent>
            {status && (
                <>
                    <Divider />
                    <CardHeader
                        className={classes.cardHeader}
                        subheader={t(
                            (currentOptions.length > 0
                                ? selectionI18nKey
                                : emptyI18nKey) as Parameters<typeof t>[0],
                            {
                                selected: selectedCount,
                                count: currentOptions.length,
                            },
                        )}
                        subheaderTypographyProps={{
                            variant: 'body2',
                            className: clsx({
                                [classes.textDisabled]: disabled,
                            })
                        }}
                    />
                </>
            )}
        </Card>
    );
}

export default Multiselect;
