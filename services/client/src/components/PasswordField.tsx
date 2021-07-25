import React, { useState } from 'react';

import clsx from 'clsx';
import { useTranslation } from 'react-i18next';
import { TextFieldProps } from '@material-ui/core/TextField';
import FormControl from '@material-ui/core/FormControl';
import InputLabel from '@material-ui/core/InputLabel';
import FormHelperText from '@material-ui/core/FormHelperText';
import Input from '@material-ui/core/Input';
import FilledInput from '@material-ui/core/FilledInput';
import OutlinedInput, { OutlinedInputProps } from '@material-ui/core/OutlinedInput';
import InputAdornment from '@material-ui/core/InputAdornment';
import IconButton from '@material-ui/core/IconButton';
import VisibilityIcon from '@material-ui/icons/Visibility';
import VisibilityOffIcon from '@material-ui/icons/VisibilityOff';

import { filterDefinedProps } from '../utils/misc';

export type PasswordFieldProps = Omit<
    TextFieldProps,
    'children' | 'multiline' | 'rows' | 'rowsMax' | 'select' | 'SelectProps' | 'type'
>;

const variantComponent = {
    standard: Input,
    filled: FilledInput,
    outlined: OutlinedInput
};

function PasswordField(
    props: PasswordFieldProps,
    ref: React.ForwardedRef<HTMLDivElement>
): JSX.Element {
    const {
        autoComplete,
        autoFocus = false,
        classes,
        className,
        color = 'primary',
        defaultValue,
        disabled = false,
        error = false,
        FormHelperTextProps,
        fullWidth = false,
        helperText,
        hiddenLabel,
        id,
        InputLabelProps,
        inputProps,
        InputProps,
        inputRef,
        label,
        name,
        onBlur,
        onChange,
        onFocus,
        placeholder,
        required = false,
        value,
        variant = 'standard',
        ...other
    } = props;
    const { t } = useTranslation(['common']);
    const [passwordVisible, setPasswordVisible] = useState(false);

    function handleClickShowPassword() {
        setPasswordVisible((visible) => !visible);
    }

    function handleMouseDownPassword(event: React.MouseEvent<HTMLButtonElement>) {
        event.preventDefault();
    }

    let inputNotched;
    let inputLabel;

    if (variant === 'outlined') {
        if (InputLabelProps && typeof InputLabelProps.shrink !== 'undefined') {
            inputNotched = InputLabelProps.shrink;
        }

        if (label) {
            const displayRequired = InputLabelProps?.required ?? required;
            inputLabel = (
                <>
                    {label}
                    {displayRequired && '\u00a0*'}
                </>
            );
        }
    }

    const helperTextId = helperText && id ? `${id}-helper-text` : undefined;
    const inputLabelId = label && id ? `${id}-label` : undefined;
    const InputComponent = variantComponent[variant];
    const InputElement = (
        <InputComponent
            {...filterDefinedProps<OutlinedInputProps>({
                'aria-describedby': helperTextId,
                autoComplete,
                autoFocus,
                defaultValue,
                fullWidth,
                name,
                type: passwordVisible ? 'text' : 'password',
                value,
                id,
                inputRef,
                onBlur,
                onChange,
                onFocus,
                placeholder,
                inputProps,
                notched: inputNotched,
                label: inputLabel
            })}
            {...InputProps}
            endAdornment={(
                <InputAdornment position="end">
                    <IconButton
                        aria-label={t('common:toggle_password_visibility')}
                        onClick={handleClickShowPassword}
                        onMouseDown={handleMouseDownPassword}
                    >
                        {passwordVisible ? <VisibilityIcon /> : <VisibilityOffIcon />}
                    </IconButton>
                </InputAdornment>
            )}
        />
    );

    return (
        <FormControl
            {...filterDefinedProps({
                component: 'div',
                className: clsx(className, classes && classes.root),
                disabled,
                error,
                fullWidth,
                hiddenLabel,
                ref,
                required,
                color,
                variant
            })}
            {...other}
        >
            {label && (
                <InputLabel
                    {...filterDefinedProps({
                        htmlFor: id,
                        id: inputLabelId
                    })}
                    {...InputLabelProps}
                >
                    {label}
                </InputLabel>
            )}

            {InputElement}

            {helperText && (
                <FormHelperText
                    {...filterDefinedProps({ id: helperTextId })}
                    {...FormHelperTextProps}
                >
                    {helperText}
                </FormHelperText>
            )}
        </FormControl>
    );
}

export default React.forwardRef(PasswordField);
