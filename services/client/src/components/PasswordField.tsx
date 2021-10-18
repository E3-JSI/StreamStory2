import React, { useState } from 'react';

import clsx from 'clsx';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@material-ui/core/styles';
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
    outlined: OutlinedInput,
};

function PasswordField(
    props: PasswordFieldProps,
    ref: React.ForwardedRef<HTMLDivElement>,
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
        size,
        value,
        variant,
        ...other
    } = props;
    const { t } = useTranslation();
    const muiTheme = useTheme();
    const [passwordVisible, setPasswordVisible] = useState(false);
    const textFieldSize = size || muiTheme.props?.MuiTextField?.size || 'medium';
    const textFieldVariant = variant || muiTheme.props?.MuiTextField?.variant || 'standard';

    function handleClickShowPassword() {
        setPasswordVisible((visible) => !visible);
    }

    function handleMouseDownPassword(event: React.MouseEvent<HTMLButtonElement>) {
        event.preventDefault();
    }

    let inputNotched;
    let inputLabel;

    if (textFieldVariant === 'outlined') {
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
    const InputComponent = variantComponent[textFieldVariant];
    const InputElement = (
        <InputComponent
            {...filterDefinedProps<OutlinedInputProps>({
                'aria-describedby': helperTextId,
                autoComplete,
                autoFocus,
                defaultValue,
                fullWidth,
                id,
                inputProps,
                inputRef,
                label: inputLabel,
                name,
                notched: inputNotched,
                onBlur,
                onChange,
                onFocus,
                placeholder,
                type: passwordVisible ? 'text' : 'password',
                value,
            })}
            {...InputProps}
            endAdornment={
                <InputAdornment position="end">
                    <IconButton
                        size="small"
                        aria-label={t('toggle_password_visibility')}
                        onClick={handleClickShowPassword}
                        onMouseDown={handleMouseDownPassword}
                    >
                        {passwordVisible ? (
                            <VisibilityIcon fontSize="small" />
                        ) : (
                            <VisibilityOffIcon fontSize="small" />
                        )}
                    </IconButton>
                </InputAdornment>
            }
        />
    );

    return (
        <FormControl
            {...filterDefinedProps({
                className: clsx(className, classes && classes.root),
                color,
                component: 'div',
                disabled,
                error,
                fullWidth,
                hiddenLabel,
                ref,
                required,
                size: textFieldSize,
                variant: textFieldVariant,
            })}
            {...other}
        >
            {label && (
                <InputLabel
                    {...filterDefinedProps({
                        htmlFor: id,
                        id: inputLabelId,
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
