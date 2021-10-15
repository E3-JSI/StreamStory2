import React, { useRef, useState } from 'react';

import clsx from 'clsx';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@material-ui/core/styles';
import { PaperProps } from '@material-ui/core/Paper';
import Box from '@material-ui/core/Box';
import Grid, { GridProps } from '@material-ui/core/Grid';
import IconButton from '@material-ui/core/IconButton';
import Tooltip from '@material-ui/core/Tooltip';
import Typography from '@material-ui/core/Typography';
import ArrowBackIcon from '@material-ui/icons/ArrowBack';
import ArrowForwardIcon from '@material-ui/icons/ArrowForward';

import { Option } from '../types/select';
import { setRef, setInputRef, triggerChangeEvent } from '../utils/forms';
import useDeepCompareEffect from '../hooks/useDeepCompareEffect';
import useDeepCompareMemoize from '../hooks/useDeepCompareMemoize';
import Multiselect, { MultiselectProps } from './Multiselect';

import useStyles from './DualMultiselect.styles';

enum OptionState {
    Available,
    AvailableChecked,
    Selected,
    SelectedChecked,
}

type MultiselectType = 'available' | 'selected';

interface DualMultiselectOption extends Option {
    state: OptionState;
}

export type SingleMultiselectProps = Omit<
    MultiselectProps,
    'id' | 'name' | 'options' | 'variant' | 'elevation' | 'square' | 'selectProps' | 'status'
>;

export interface DualMultiselectProps extends Omit<GridProps, 'onChange'> {
    id: string;
    options: Option[];
    multiselectProps: {
        [key in MultiselectType]: SingleMultiselectProps;
    };
    name?: string;
    value?: string | string[];
    defaultValue?: string | string[];
    inputProps?: React.SelectHTMLAttributes<HTMLSelectElement> &
        React.RefAttributes<HTMLSelectElement>;
    inputRef?: React.ForwardedRef<HTMLSelectElement>;
    status?: 'none' | 'single' | 'dual';
    variant?: PaperProps['variant'];
    moveToSelectedButtonLabel?: string;
    moveToAvailableButtonLabel?: string;
    selectionI18nKey?: string;
    emptyI18nKey?: string;
    disabled?: boolean;
    // onChange?: (event: React.ChangeEvent<HTMLSelectElement>) => void;
    onChange?: React.FormEventHandler<HTMLElement>;
}

function DualMultiselect({
    id,
    options,
    multiselectProps,
    name,
    value,
    defaultValue,
    inputProps,
    inputRef,
    status = 'single',
    variant,
    moveToSelectedButtonLabel,
    moveToAvailableButtonLabel,
    selectionI18nKey = 'm_of_n_items_selected',
    emptyI18nKey = 'n_items',
    disabled = false,
    // onChange,
    ...other
}: DualMultiselectProps): JSX.Element {
    const classes = useStyles();
    const muiTheme = useTheme();
    const { t } = useTranslation();
    const [currentOptions, setCurrentOptions] = useState<DualMultiselectOption[]>(
        // options.map((option) => ({ ...option, state: OptionState.Available })),
        options.map(getOptionMapping()),
    );
    const availableOptions = useDeepCompareMemoize(
        currentOptions.reduce<Option[]>(
            (prevOptions, { state, ...option }) =>
                state < OptionState.Selected ? [...prevOptions, option] : prevOptions,
            [],
        ),
    );
    const selectedOptions = useDeepCompareMemoize(
        currentOptions.reduce<Option[]>(
            (prevOptions, { state, ...option }) =>
                state > OptionState.AvailableChecked ? [...prevOptions, option] : prevOptions,
            [],
        ),
    );
    const selectRef = useRef<HTMLSelectElement | null>(null);
    const selectId = inputProps?.id ?? `${id}-select`;
    const optionStateCount = currentOptions.reduce<number[]>(
        (prevCount, option) => {
            const newCount = [...prevCount];
            newCount[option.state] += 1;

            return newCount;
        },
        [0, 0, 0, 0],
    );
    const selectedValues = selectedOptions.map((option) => option.value);

    useDeepCompareEffect(() => {
        // Re-initialize selection state when options change.
        setCurrentOptions(options.map(getOptionMapping()));
    }, [options, value]);

    function getOptionMapping() {
        const initialValue = defaultValue !== undefined ? defaultValue : value;
        let initialValues: string[] = [];

        if (initialValue !== undefined) {
            initialValues = Array.isArray(initialValue) ? initialValue : [initialValue];
        }

        return (option: Option) => ({
            ...option,
            state:
                initialValues.indexOf(option.value) > -1
                    ? OptionState.Selected
                    : OptionState.Available,
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

    function handleMultiselectChange(
        event: React.ChangeEvent<HTMLSelectElement>,
        type: MultiselectType,
    ) {
        event.stopPropagation();
        setCurrentOptions((state) => {
            const newState = [...state];
            let i = 0;

            Array.from(event.target.options).forEach((option) => {
                while (state[i].value !== option.value && i < state.length - 1) {
                    i += 1;
                }

                if (state[i].value === option.value) {
                    let optionState;

                    if (type === 'available') {
                        optionState = option.selected
                            ? OptionState.AvailableChecked
                            : OptionState.Available;
                    } else {
                        optionState = option.selected
                            ? OptionState.SelectedChecked
                            : OptionState.Selected;
                    }

                    newState[i] = {
                        ...state[i],
                        state: optionState,
                    };
                }
            });

            return newState;
        });
    }

    function handleMoveToButtonClick(type: MultiselectType) {
        setCurrentOptions((state) =>
            state.map((option) =>
                option.state % 2 === 1
                    ? {
                          ...option,
                          state:
                              type === 'available' ? OptionState.Available : OptionState.Selected,
                      }
                    : option,
            ),
        );

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

    return (
        <Grid alignContent="stretch" spacing={0} container {...other}>
            <Grid className={classes.gridItem} xs={12} sm={6} item>
                <Multiselect
                    id={`${id}-available`}
                    className={classes.multiselect}
                    options={availableOptions}
                    variant={variant}
                    status={status === 'dual'}
                    disabled={disabled}
                    onChange={(e) => {
                        handleMultiselectChange(
                            e as React.ChangeEvent<HTMLSelectElement>,
                            'available',
                        );
                    }}
                    {...multiselectProps.available}
                />
                <Tooltip
                    title={
                        optionStateCount[OptionState.AvailableChecked] === 0
                            ? ''
                            : moveToSelectedButtonLabel || t('move_to_available_items')
                    }
                    enterDelay={muiTheme.timing.tooltipEnterDelay}
                >
                    <Box className={clsx(classes.moveButton, classes.moveAvailableButton)}>
                        <IconButton
                            size="small"
                            onClick={() => {
                                handleMoveToButtonClick('selected');
                            }}
                            disabled={
                                optionStateCount[OptionState.AvailableChecked] === 0 || disabled
                            }
                        >
                            <ArrowForwardIcon />
                        </IconButton>
                    </Box>
                </Tooltip>
            </Grid>
            <Grid className={classes.gridItem} xs={12} sm={6} item>
                <Multiselect
                    id={`${id}-selected`}
                    className={classes.multiselect}
                    options={selectedOptions}
                    variant={variant}
                    status={status === 'dual'}
                    disabled={disabled}
                    onChange={(e) => {
                        handleMultiselectChange(
                            e as React.ChangeEvent<HTMLSelectElement>,
                            'selected',
                        );
                    }}
                    {...multiselectProps.selected}
                />
                <Tooltip
                    title={
                        optionStateCount[OptionState.SelectedChecked] === 0
                            ? ''
                            : moveToAvailableButtonLabel || t('move_to_selected_items')
                    }
                    enterDelay={muiTheme.timing.tooltipEnterDelay}
                >
                    <Box className={clsx(classes.moveButton, classes.moveSelectedButton)}>
                        <IconButton
                            size="small"
                            onClick={() => {
                                handleMoveToButtonClick('available');
                            }}
                            disabled={
                                optionStateCount[OptionState.SelectedChecked] === 0 || disabled
                            }
                        >
                            <ArrowBackIcon />
                        </IconButton>
                    </Box>
                </Tooltip>
            </Grid>
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
            {status === 'single' && (
                <Typography
                    className={clsx(classes.status, {
                        [classes.textDisabled]: disabled,
                    })}
                    variant="body2"
                    color="textSecondary"
                >
                    {t(
                        (currentOptions.length > 0 ? selectionI18nKey : emptyI18nKey) as Parameters<
                            typeof t
                        >[0],
                        {
                            selected: selectedOptions.length,
                            count: currentOptions.length,
                        },
                    )}
                </Typography>
            )}
        </Grid>
    );
}

export default DualMultiselect;
