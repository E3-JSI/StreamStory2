import React from 'react';

import { useFormContext, useWatch } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import FormControl from '@material-ui/core/FormControl';
import Checkbox from '@material-ui/core/Checkbox';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import FormHelperText from '@material-ui/core/FormHelperText';
import MenuItem from '@material-ui/core/MenuItem';
import TextField from '@material-ui/core/TextField';

import { Option } from '../types/select';
import { initMuiRegister } from '../utils/forms';
import { DatasetAttribute } from './DatasetConfig';
import Fieldset from './Fieldset';
import DualMultiselect from './DualMultiselect';
import Multiselect from './Multiselect';
import TransHtml from './TransHtml';

export interface ModelFormRequestData {
    online: boolean;
    dataset: string;
    selectedAttributes: string[];
    timeAttribute: string;
    timeUnit: string;
    includeTimeAttribute: boolean;
    categoricalAttributes: string[];
    derivatives: string[];
    clusteringAlgorithm: string;
    numberOfStates?: number;
    minNumberOfStates?: number;
    maxNumberOfStates?: number;
    stateRadius?: number;
    hierarchyType: string;
    ignoredAttributes: string[];
    name: string;
    description: string;
}
export interface ModelConfigProps {
    datasetName: string;
    datasetAttributes: DatasetAttribute[];
}

function ModelConfig({ datasetAttributes, datasetName }: ModelConfigProps): JSX.Element {
    const { t } = useTranslation();
    const {
        control,
        formState: { errors },
        register,
        setValue,
    } = useFormContext();
    const muiRegister = initMuiRegister(register);

    const defaultValues = {
        selectedAttributes: [],
        timeAttribute: '',
        timeUnit: 'h',
        includeTimeAttribute: false,
        categoricalAttributes: [],
        derivatives: [],
        clusteringAlgorithm: 'kMeans',
        numberOfStates: 12,
        minNumberOfStates: 10,
        maxNumberOfStates: 30,
        stateRadius: 0.8,
        hierarchyType: 'aggClust',
        ignoredAttributes: [],
        name: '',
        description: '',
    };

    // Selected attributes
    const attributeOptions: Option[] = datasetAttributes.map((attr, i) => ({
        label: attr.name,
        value: `${i}`,
    }));
    const selectedAttributes: string[] =
        useWatch({
            control,
            name: 'selectedAttributes',
        }) ?? defaultValues.selectedAttributes;

    // Time attribute
    const timeAttributeOptions = selectedAttributes.map((value) => attributeOptions[Number(value)]);
    const timeAttribute: string =
        useWatch({
            control,
            name: 'timeAttribute',
        }) ?? defaultValues.timeAttribute;

    // Time units
    const timeUnitOptions: Option[] = [
        {
            label: t('second'),
            value: 's',
        },
        {
            label: t('minute'),
            value: 'm',
        },
        {
            label: t('hour'),
            value: 'h',
        },
        {
            label: t('day'),
            value: 'd',
        },
        {
            label: t('week'),
            value: 'w',
        },
    ];

    // Data attributes
    const dataAttributeOptions = timeAttributeOptions.filter(
        (option) => option.value !== timeAttribute,
    );

    // Categorical attributes
    const categoricalAttributes: string[] =
        useWatch({
            control,
            name: 'categoricalAttributes',
        }) ?? defaultValues.categoricalAttributes;

    // Derivatives
    const derivativeOptions = dataAttributeOptions.filter(
        (option) => categoricalAttributes && categoricalAttributes.indexOf(option.value) < 0,
    );

    // Clustering algorithm
    const algorithmOptions: Option[] = [
        {
            label: t('k_means'),
            value: 'kMeans',
        },
        {
            label: t('dp_means'),
            value: 'dpMeans',
            disabled: false,
        },
    ];
    const clusteringAlgorithm =
        useWatch({
            control,
            name: 'clusteringAlgorithm',
        }) ?? defaultValues.clusteringAlgorithm;

    // Hierarchy type
    const hierarchyOptions: Option[] = [
        {
            label: t('distance_based'),
            value: 'aggClust',
        },
        {
            label: t('transition_based'),
            value: 'mchainPartitioning',
            disabled: false,
        },
    ];

    return (
        <>
            <input type="hidden" value={datasetName} {...register('dataset')} />
            <Fieldset
                legend={t('select_attributes')}
                description={<TransHtml i18nKey="select_attributes_description" />}
                gutterTop
                gutterBottom
            >
                <FormControl margin="normal" fullWidth>
                    <DualMultiselect
                        id="selected-attributes"
                        options={attributeOptions}
                        multiselectProps={{
                            available: {
                                label: t('ignored_attributes'),
                                searchPlaceholder: t('search_ignored_attributes'),
                                selectionI18nKey: 'm_of_n_attributes_selected',
                                emptyI18nKey: 'n_attributes',
                            },
                            selected: {
                                label: t('selected_attributes'),
                                searchPlaceholder: t('search_selected_attributes'),
                                selectionI18nKey: 'm_of_n_attributes_selected',
                                emptyI18nKey: 'n_attributes',
                            },
                        }}
                        moveToSelectedButtonLabel={t('move_to_selected_attributes')}
                        moveToAvailableButtonLabel={t('move_to_ignored_attributes')}
                        // value={selectedAttributes}
                        defaultValue={defaultValues.selectedAttributes}
                        status="single"
                        selectionI18nKey="m_of_n_attributes_selected"
                        emptyI18nKey="n_attributes"
                        {...muiRegister('selectedAttributes', {
                            required: true,
                            onChange: () => {
                                setValue('timeAttribute', defaultValues.timeAttribute);
                            },
                        })}
                    />
                </FormControl>
            </Fieldset>
            {selectedAttributes.length > 0 && (
                <>
                    <Fieldset
                        legend={t('configure_time_attribute')}
                        description={<TransHtml i18nKey="configure_time_attribute_description" />}
                        gutterTop
                        gutterBottom
                    >
                        <TextField
                            id="time-attribute"
                            label={t('time_attribute')}
                            value={timeAttribute}
                            // defaultValue={defaultValues.timeAttribute}
                            helperText={t('attribute_must_be_timestamp')}
                            margin="normal"
                            select
                            fullWidth
                            {...muiRegister('timeAttribute', {
                                required: true,
                                onChange: () => {
                                    setValue(
                                        'categoricalAttributes',
                                        dataAttributeOptions.reduce<string[]>(
                                            (prevValues, option) =>
                                                !datasetAttributes[Number(option.value)].numeric
                                                    ? [...prevValues, option.value]
                                                    : prevValues,
                                            [],
                                        ),
                                    );
                                    setValue('derivatives', defaultValues.derivatives);
                                },
                            })}
                        >
                            {timeAttributeOptions.map((option) => (
                                <MenuItem key={option.value} value={option.value}>
                                    {option.label}
                                </MenuItem>
                            ))}
                        </TextField>
                        <TextField
                            id="time-unit"
                            label={t('time_unit')}
                            defaultValue={defaultValues.timeUnit}
                            margin="normal"
                            select
                            fullWidth
                            {...muiRegister('timeUnit')}
                        >
                            {timeUnitOptions.map((option) => (
                                <MenuItem key={option.value} value={option.value}>
                                    {option.label}
                                </MenuItem>
                            ))}
                        </TextField>
                        <FormControlLabel
                            control={
                                <Checkbox
                                    defaultChecked={defaultValues.includeTimeAttribute}
                                    color="primary"
                                    {...muiRegister('includeTimeAttribute')}
                                />
                            }
                            label={t('include_time_attributes_in_model')}
                        />
                    </Fieldset>
                    {timeAttribute !== '' && (
                        <>
                            <Fieldset
                                legend={t('configure_data_attributes')}
                                gutterTop
                                gutterBottom
                            >
                                <FormControl margin="normal" fullWidth>
                                    <Multiselect
                                        id="categorical-attributes"
                                        label={t('attribute_types')}
                                        options={dataAttributeOptions}
                                        value={categoricalAttributes}
                                        switchControl={{
                                            offLabel: t('numeric'),
                                            onLabel: t('categorical'),
                                        }}
                                        status={false}
                                        searchPlaceholder={t('search_attributes')}
                                        selectionI18nKey="m_of_n_attributes_selected"
                                        emptyI18nKey="n_attributes"
                                        {...muiRegister('categoricalAttributes', {
                                            onChange: () => {
                                                setValue('derivatives', defaultValues.derivatives);
                                            },
                                        })}
                                    />
                                    <FormHelperText>
                                        {t('select_categorical_attributes')}
                                    </FormHelperText>
                                </FormControl>
                                <FormControl margin="normal" fullWidth>
                                    <Multiselect
                                        id="derivatives"
                                        label={t('derivatives')}
                                        options={derivativeOptions}
                                        defaultValue={defaultValues.derivatives}
                                        searchPlaceholder={t('search_attributes')}
                                        selectionI18nKey="m_of_n_attributes_selected"
                                        emptyI18nKey="n_attributes"
                                        {...muiRegister('derivatives')}
                                    />
                                    <FormHelperText>
                                        {t('include_derivatives_of_selected_attributes')}
                                    </FormHelperText>
                                </FormControl>
                            </Fieldset>
                            <Fieldset
                                legend={t('configure_states')}
                                description={<TransHtml i18nKey="configure_states_description" />}
                                gutterTop
                                gutterBottom
                            >
                                <TextField
                                    id="clustering-algorithm"
                                    label={t('clustering_algorithm')}
                                    // defaultValue={defaultValues.clusteringAlgorithm}
                                    value={clusteringAlgorithm}
                                    margin="normal"
                                    select
                                    fullWidth
                                    {...muiRegister('clusteringAlgorithm')}
                                >
                                    {algorithmOptions.map((option) => (
                                        <MenuItem
                                            key={option.value}
                                            value={option.value}
                                            disabled={!!option?.disabled}
                                        >
                                            {option.label}
                                        </MenuItem>
                                    ))}
                                </TextField>
                                {clusteringAlgorithm === 'kMeans' ? (
                                    <TextField
                                        id="number-of-states"
                                        label={t('number_of_states')}
                                        type="number"
                                        defaultValue={defaultValues.numberOfStates}
                                        error={!!errors.numberOfStates}
                                        helperText={errors.numberOfStates?.message}
                                        InputLabelProps={{
                                            required: true,
                                        }}
                                        margin="normal"
                                        fullWidth
                                        {...muiRegister('numberOfStates', {
                                            required: t('error.required_named_field', {
                                                name: t('number_of_states'),
                                            }),
                                            min: {
                                                value: 5,
                                                message: t('error.value_must_be_between', {
                                                    min: 5,
                                                    max: 50,
                                                }),
                                            },
                                            max: {
                                                value: 20,
                                                message: t('error.value_must_be_between', {
                                                    min: 5,
                                                    max: 50,
                                                }),
                                            },
                                            valueAsNumber: true,
                                        })}
                                    />
                                ) : (
                                    <>
                                        <TextField
                                            id="min-number-of-states"
                                            label={t('min_number_of_states')}
                                            type="number"
                                            defaultValue={defaultValues.minNumberOfStates}
                                            error={!!errors.minNumberOfStates}
                                            helperText={errors.minNumberOfStates?.message}
                                            InputLabelProps={{
                                                required: true,
                                            }}
                                            margin="normal"
                                            fullWidth
                                            {...muiRegister('minNumberOfStates', {
                                                required: t('error.required_named_field', {
                                                    name: t('min_number_of_states'),
                                                }),
                                                min: {
                                                    value: 3,
                                                    message: t('error.value_must_be_between', {
                                                        min: 3,
                                                        max: 20,
                                                    }),
                                                },
                                                max: {
                                                    value: 20,
                                                    message: t('error.value_must_be_between', {
                                                        min: 3,
                                                        max: 20,
                                                    }),
                                                },
                                                valueAsNumber: true,
                                            })}
                                        />
                                        <TextField
                                            id="max-number-of-states"
                                            label={t('max_number_of_states')}
                                            type="number"
                                            defaultValue={defaultValues.maxNumberOfStates}
                                            error={!!errors.maxNumberOfStates}
                                            helperText={errors.maxNumberOfStates?.message}
                                            InputLabelProps={{
                                                required: true,
                                            }}
                                            margin="normal"
                                            fullWidth
                                            {...muiRegister('maxNumberOfStates', {
                                                required: t('error.required_named_field', {
                                                    name: t('max_number_of_states'),
                                                }),
                                                min: {
                                                    value: 10,
                                                    message: t('error.value_must_be_between', {
                                                        min: 10,
                                                        max: 100,
                                                    }),
                                                },
                                                max: {
                                                    value: 100,
                                                    message: t('error.value_must_be_between', {
                                                        min: 10,
                                                        max: 100,
                                                    }),
                                                },
                                                valueAsNumber: true,
                                            })}
                                        />
                                        <TextField
                                            id="state-radius"
                                            label={t('state_radius')}
                                            type="number"
                                            defaultValue={defaultValues.stateRadius}
                                            error={!!errors.stateRadius}
                                            helperText={errors.stateRadius?.message}
                                            InputLabelProps={{
                                                required: true,
                                            }}
                                            inputProps={{
                                                step: 0.01,
                                            }}
                                            margin="normal"
                                            fullWidth
                                            {...muiRegister('stateRadius', {
                                                required: t('error.required_named_field', {
                                                    name: t('state_radius'),
                                                }),
                                                min: {
                                                    value: 0.1,
                                                    message: t('error.value_must_be_between', {
                                                        min: 0.1,
                                                        max: 2,
                                                    }),
                                                },
                                                max: {
                                                    value: 2,
                                                    message: t('error.value_must_be_between', {
                                                        min: 0.1,
                                                        max: 2,
                                                    }),
                                                },
                                                valueAsNumber: true,
                                            })}
                                        />
                                    </>
                                )}
                            </Fieldset>
                            <Fieldset
                                legend={t('configure_hierarchy')}
                                description={
                                    <TransHtml i18nKey="configure_hierarchy_description" />
                                }
                                gutterTop
                                gutterBottom
                            >
                                <TextField
                                    id="hierarchy-type"
                                    label={t('hierarchy_type')}
                                    defaultValue={defaultValues.hierarchyType}
                                    margin="normal"
                                    select
                                    fullWidth
                                    {...muiRegister('hierarchyType')}
                                >
                                    {hierarchyOptions.map((option) => (
                                        <MenuItem
                                            key={option.value}
                                            value={option.value}
                                            disabled={!!option?.disabled}
                                        >
                                            {option.label}
                                        </MenuItem>
                                    ))}
                                </TextField>
                            </Fieldset>
                            <Fieldset legend={t('organize_attributes')} gutterTop gutterBottom>
                                <FormControl margin="normal" fullWidth>
                                    <DualMultiselect
                                        id="ignored-attributes"
                                        options={dataAttributeOptions}
                                        multiselectProps={{
                                            available: {
                                                label: t('state_attributes'),
                                                searchPlaceholder: t('search_state_attributes'),
                                            },
                                            selected: {
                                                label: t('ignored_attributes'),
                                                searchPlaceholder: t('search_ignored_attributes'),
                                            },
                                        }}
                                        moveToSelectedButtonLabel={t('move_to_ignored_attributes')}
                                        moveToAvailableButtonLabel={t('move_to_setate_attributes')}
                                        defaultValue={defaultValues.ignoredAttributes}
                                        status="single"
                                        selectionI18nKey="m_of_n_attributes_ignored"
                                        emptyI18nKey="n_attributes"
                                        {...muiRegister('ignoredAttributes')}
                                    />
                                </FormControl>
                            </Fieldset>
                            <TextField
                                id="model-name"
                                label={t('model_name')}
                                defaultValue={defaultValues.name}
                                error={!!errors.name}
                                helperText={errors.name?.message}
                                margin="normal"
                                InputLabelProps={{
                                    required: true,
                                }}
                                fullWidth
                                {...muiRegister('name', {
                                    required: t('error.required_named_field', {
                                        name: t('model_name'),
                                    }),
                                })}
                            />
                            <TextField
                                id="model-description"
                                label={t('description')}
                                defaultValue={defaultValues.description}
                                margin="normal"
                                multiline
                                fullWidth
                                {...muiRegister('description')}
                            />
                        </>
                    )}
                </>
            )}
        </>
    );
}

export default ModelConfig;
