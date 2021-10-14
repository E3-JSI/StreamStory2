import React, { useRef, useState } from 'react';

import clsx from 'clsx';
import { OverridableComponent } from '@material-ui/core/OverridableComponent';
import { SvgIconProps, SvgIconTypeMap } from '@material-ui/core/SvgIcon';
import Alert, { AlertProps as CoreAlertProps } from '@material-ui/lab/Alert';
import AlertTitle from '@material-ui/lab/AlertTitle';
import Box, { BoxProps } from '@material-ui/core/Box';
import Popover, { PopoverProps as CorePopoverProps } from '@material-ui/core/Popover';
import CheckCircleIcon from '@material-ui/icons/CheckCircleOutlined';
import ErrorIcon from '@material-ui/icons/ErrorOutlined';
import InfoIcon from '@material-ui/icons/InfoOutlined';
import WarningIcon from '@material-ui/icons/WarningOutlined';

import useStyles from './AlertPopup.styles';

export type IconPlacement = 'start' | 'end' | 'none';

export type PopupSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'auto';

export interface AlertPopupProps extends Omit<BoxProps, 'title'> {
    children: React.ReactNode;
    title?: React.ReactNode;
    severity?: CoreAlertProps['severity'];
    placement?: IconPlacement;
    size?: PopupSize;
    icon?: OverridableComponent<SvgIconTypeMap<Record<string, unknown>, 'svg'>>;
    AlertProps?: CoreAlertProps;
    IconProps?: SvgIconProps;
    PopoverProps?: CorePopoverProps;
}

function AlertPopup({
    children,
    title,
    severity = 'info',
    placement = 'none',
    size = 'xs',
    icon,
    AlertProps,
    IconProps,
    PopoverProps,
    ...other
}: AlertPopupProps): JSX.Element {
    const classes = useStyles();
    const [isOpen, setIsOpen] = useState(false);
    const infoIconRef = useRef(null);

    const Icon =
        icon ||
        {
            error: ErrorIcon,
            info: InfoIcon,
            success: CheckCircleIcon,
            warning: WarningIcon,
        }[severity];

    function handlePopoverOpen() {
        setIsOpen(true);
    }

    function handlePopoverClose() {
        setIsOpen(false);
    }

    return (
        <>
            <Box
                className={classes.root}
                onMouseEnter={handlePopoverOpen}
                onMouseLeave={handlePopoverClose}
                clone
                {...other}
            >
                <Icon
                    className={clsx(classes.icon, {
                        [classes.iconError]: severity === 'error',
                        [classes.iconInfo]: severity === 'info',
                        [classes.iconSuccess]: severity === 'success',
                        [classes.iconWarning]: severity === 'warning',
                        [classes.iconStart]: placement === 'start',
                        [classes.iconEnd]: placement === 'end',
                    })}
                    ref={infoIconRef}
                    aria-owns={isOpen ? 'info-popup' : undefined}
                    aria-haspopup="true"
                    {...IconProps}
                />
            </Box>
            <Popover
                id="info-popup"
                className={classes.popover}
                classes={{
                    paper: clsx(classes.popoverPaper, {
                        [classes.popoverPaperAuto]: size === 'auto',
                        [classes.popoverPaperXs]: size === 'xs',
                        [classes.popoverPaperSm]: size === 'sm',
                        [classes.popoverPaperMd]: size === 'md',
                        [classes.popoverPaperLg]: size === 'lg',
                        [classes.popoverPaperXl]: size === 'xl',
                    }),
                }}
                open={isOpen}
                anchorEl={infoIconRef?.current}
                anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'right',
                }}
                transformOrigin={{
                    vertical: 'top',
                    horizontal: 'left',
                }}
                onClose={handlePopoverClose}
                disableRestoreFocus
                {...PopoverProps}
            >
                <Alert severity={severity} icon={false} {...AlertProps}>
                    {title && <AlertTitle>{title}</AlertTitle>}
                    <Box className={classes.alertContent}>
                        {children}
                    </Box>
                </Alert>
            </Popover>
        </>
    );
}

export default AlertPopup;
