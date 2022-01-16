import React, { useRef, useState } from 'react';

import clsx from 'clsx';
import { Link as RouterLink } from 'react-router-dom';
import { SubmitHandler, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@material-ui/core/styles';
import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';
import Collapse from '@material-ui/core/Collapse';
import Grid from '@material-ui/core/Grid';
import IconButton from '@material-ui/core/IconButton';
import TableCell from '@material-ui/core/TableCell';
import TableRow from '@material-ui/core/TableRow';
import TextField from '@material-ui/core/TextField';
import Tooltip from '@material-ui/core/Tooltip';
import Typography from '@material-ui/core/Typography';
import AccessTimeIcon from '@material-ui/icons/AccessTime';
import UpdateIcon from '@material-ui/icons/Update';
import CancelIcon from '@material-ui/icons/Cancel';
import ChevronRightIcon from '@material-ui/icons/ChevronRight';
import DescriptionIcon from '@material-ui/icons/Description';
import EditIcon from '@material-ui/icons/Edit';
import MoreVertIcon from '@material-ui/icons/MoreVert';
import PersonIcon from '@material-ui/icons/Person';
import PauseIcon from '@material-ui/icons/Pause';
import PlayArrowIcon from '@material-ui/icons/PlayArrow';
import PublicIcon from '@material-ui/icons/Public';
import SaveIcon from '@material-ui/icons/Save';
import TimelineIcon from '@material-ui/icons/Timeline';
import VisibilityIcon from '@material-ui/icons/Visibility';

import { updateModel, Model } from '../api/models';
import { initMuiRegister } from '../utils/forms';
import { Errors, getResponseErrors } from '../utils/errors';
import useSession from '../hooks/useSession';
import useSnackbar from '../hooks/useSnackbar';
import ActionMenu from './ActionMenu';
import LoadingButton from './LoadingButton';
import Mark from './Mark';
import PublicOffIcon from './icons/PublicOff';
import UpdateDisabledIcon from './icons/UpdateDisabled';

import useStyles from './ModelListItem.styles';

export type DescriptionFormData = Pick<Model, 'description'>;

export interface DescriptionFormErrors extends Errors {
    description?: string;
}

export interface ModelListItemProps {
    model: Model;
    selected: boolean;
    online?: boolean;
    searchTerm?: string;
    showUserColumn?: boolean;
    showDateColumn?: boolean;
    onModelUpdate: (model: Model, remove?: boolean) => void;
    onItemClick: (event: React.MouseEvent, modelId: number) => void;
}

function ModelListItem({
    model,
    selected: isSelected,
    online: isOnline = false,
    searchTerm = '',
    showUserColumn,
    showDateColumn,
    onModelUpdate,
    onItemClick,
}: ModelListItemProps): JSX.Element {
    const classes = useStyles();
    const muiTheme = useTheme();
    const { t, i18n } = useTranslation();
    const [editMode, setEditMode] = useState(false);
    const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false);
    const [session] = useSession();
    const [showSnackbar] = useSnackbar();

    const moreButtonRef = useRef(null);
    const defaultValues = {
        description: model.description,
    };
    const {
        formState: { errors, isSubmitting, isDirty },
        handleSubmit: onSubmit,
        register,
        reset,
        setError,
    } = useForm<DescriptionFormData>({
        defaultValues,
    });
    const muiRegister = initMuiRegister(register);
    const dateFormatter = new Intl.DateTimeFormat(i18n.language, {
        dateStyle: 'short',
    });
    const dateTimeFormatter = new Intl.DateTimeFormat(i18n.language, {
        dateStyle: 'short',
        timeStyle: 'medium',
    });
    const isOwnModel = model.username === session.user?.email;
    const detailsButtonTooltip = isSelected ? t('hide_details') : t('show_details');
    const markedModelValues = {
        name: <Mark term={searchTerm}>{model.name}</Mark>,
        dataset: <Mark term={searchTerm}>{model.dataset}</Mark>,
        description: <Mark term={searchTerm}>{model.description}</Mark>,
        username: <Mark term={searchTerm}>{model.username}</Mark>,
    };

    function toggleMoreMenu() {
        setIsMoreMenuOpen((value) => !value);
    }

    const handleSubmit: SubmitHandler<DescriptionFormData> = async (data) => {
        try {
            const response = await updateModel(model.id, data);

            if (response.data.model) {
                onModelUpdate(response.data.model);
                showSnackbar({
                    message: t('description_successfully_saved'),
                    severity: 'success',
                    // autoHideDuration: null
                });
                reset({
                    description: response.data.model.description,
                });
                setEditMode(false);
            }
        } catch (error) {
            // Handle form errors.
            const responseErrors = getResponseErrors<DescriptionFormErrors>(error, t);

            if (Array.isArray(responseErrors)) {
                const message = responseErrors;

                if (message.length) {
                    showSnackbar({
                        message: responseErrors,
                        severity: 'error',
                    });
                }
            } else if (responseErrors !== undefined) {
                Object.keys(responseErrors).forEach((name, i) => {
                    setError(
                        name as keyof DescriptionFormData,
                        {
                            type: 'manual',
                            message: responseErrors[name],
                        },
                        { shouldFocus: i < 1 },
                    );
                });
            }
        }
    };

    function handleEditButtonClick() {
        setEditMode(true);
    }

    function handleCancelButtonClick() {
        reset(defaultValues);
        setEditMode(false);
    }

    function hendleMoreActionsClick(event: React.MouseEvent) {
        event.stopPropagation();
    }

    function handleCollapse() {
        if (editMode) {
            handleCancelButtonClick();
        }
    }

    return (
        <React.Fragment key={model.id}>
            <TableRow
                className={clsx(classes.row, classes.rowMain)}
                selected={isSelected}
                tabIndex={-1}
                onClick={(event) => onItemClick(event, model.id)}
                hover
            >
                <TableCell component="th" scope="row">
                    <Typography variant="body2">
                        <Tooltip
                            title={detailsButtonTooltip}
                            enterDelay={muiTheme.timing.tooltipEnterDelay}
                        >
                            <IconButton
                                className={clsx(classes.toggleRowButton, {
                                    open: isSelected,
                                })}
                                size="small"
                                aria-label={detailsButtonTooltip}
                                onClick={(event) => onItemClick(event, model.id)}
                            >
                                <ChevronRightIcon fontSize="small" />
                            </IconButton>
                        </Tooltip>
                        <Typography
                            className={classes.rowMainContent}
                            component="span"
                            variant="body2"
                            noWrap
                        >
                            {markedModelValues.name}
                        </Typography>
                    </Typography>
                </TableCell>
                {showUserColumn && (
                    <TableCell align="left">
                        <Typography
                            className={classes.rowMainContent}
                            component="span"
                            variant="body2"
                            noWrap
                        >
                            {markedModelValues.username}
                        </Typography>
                    </TableCell>
                )}
                {showDateColumn && (
                    <TableCell align="right">
                        <Typography
                            className={classes.rowMainContent}
                            component="span"
                            variant="body2"
                            noWrap
                        >
                            {dateFormatter.format(model.createdAt)}
                        </Typography>
                    </TableCell>
                )}
                <TableCell align="right">
                    <Tooltip title={t('view_model')} enterDelay={muiTheme.timing.tooltipEnterDelay}>
                        <IconButton
                            component={RouterLink}
                            to={`/model/${model.id}`}
                            size="small"
                            aria-label={t('view_model')}
                        >
                            <VisibilityIcon fontSize="small" />
                        </IconButton>
                    </Tooltip>
                    {isOwnModel ? (
                        <Box display="inline-block" onClick={hendleMoreActionsClick}>
                            <Tooltip
                                title={t('more')}
                                enterDelay={muiTheme.timing.tooltipEnterDelay}
                            >
                                <IconButton
                                    ref={moreButtonRef}
                                    size="small"
                                    edge="end"
                                    aria-label={t('more')}
                                    onClick={toggleMoreMenu}
                                    aria-controls="action-menu"
                                    aria-haspopup="true"
                                >
                                    <MoreVertIcon fontSize="small" />
                                </IconButton>
                            </Tooltip>
                            <ActionMenu
                                id="action-menu"
                                anchorEl={moreButtonRef.current}
                                open={isMoreMenuOpen}
                                model={model}
                                online={isOnline}
                                active={model.active}
                                public={model.public}
                                onModelUpdate={onModelUpdate}
                                onToggle={toggleMoreMenu}
                                onClose={toggleMoreMenu}
                                // keepMounted
                            />
                        </Box>
                    ) : (
                        <IconButton size="small" edge="end" disabled>
                            <MoreVertIcon fontSize="small" />
                        </IconButton>
                    )}
                </TableCell>
            </TableRow>
            <TableRow className={clsx(classes.row, classes.rowDetails)} selected={isSelected}>
                <TableCell colSpan={2 + Number(!!showUserColumn) + Number(!!showDateColumn)}>
                    <Collapse
                        in={isSelected}
                        timeout="auto"
                        onExited={handleCollapse}
                        unmountOnExit
                    >
                        <Box className={classes.detailsContainer}>
                            <dl className={classes.details}>
                                <div>
                                    <dt>
                                        <TimelineIcon />
                                        {t('dataset')}
                                    </dt>
                                    <dd>{markedModelValues.dataset}</dd>
                                </div>
                                <div>
                                    <dt>
                                        <PersonIcon />
                                        {t('user')}
                                    </dt>
                                    <dd>{markedModelValues.username}</dd>
                                </div>
                                <div>
                                    <dt>
                                        <AccessTimeIcon />
                                        {t('creation_time')}
                                    </dt>
                                    <dd>{dateTimeFormatter.format(new Date(model.createdAt))}</dd>
                                </div>
                                <div>
                                    <dt>
                                        {model.online ? <UpdateIcon /> : <UpdateDisabledIcon />}
                                        {t('type')}
                                    </dt>
                                    <dd>{model.online ? t('online') : t('offline')}</dd>
                                </div>
                                {!isOnline && (
                                    <div>
                                        <dt>
                                            {model.public ? <PublicIcon /> : <PublicOffIcon />}
                                            {t('public')}
                                        </dt>
                                        <dd>{model.public ? t('yes') : t('no')}</dd>
                                    </div>
                                )}
                                {isOnline && (
                                    <div>
                                        <dt>
                                            {model.active ? <PlayArrowIcon /> : <PauseIcon />}
                                            {t('active')}
                                        </dt>
                                        <dd>{model.active ? t('yes') : t('no')}</dd>
                                    </div>
                                )}
                                {(!!model.description || isOwnModel) && (
                                    <div>
                                        <dt>
                                            <DescriptionIcon />
                                            {t('description')}
                                        </dt>
                                        <dd>
                                            {!editMode && !!model.description && (
                                                <Typography
                                                    className={classes.description}
                                                    component="span"
                                                    variant="body2"
                                                >
                                                    {markedModelValues.description}
                                                </Typography>
                                            )}
                                            {isOwnModel && !editMode && (
                                                <Tooltip
                                                    title={t('edit_description')}
                                                    enterDelay={muiTheme.timing.tooltipEnterDelay}
                                                >
                                                    <IconButton
                                                        className={classes.editButton}
                                                        size="small"
                                                        aria-label={t('edit_description')}
                                                        onClick={handleEditButtonClick}
                                                    >
                                                        <EditIcon fontSize="small" />
                                                    </IconButton>
                                                </Tooltip>
                                            )}
                                            {editMode && (
                                                <form
                                                    className={classes.form}
                                                    onSubmit={onSubmit(handleSubmit)}
                                                    noValidate
                                                >
                                                    <TextField
                                                        classes={{ root: classes.textInput }}
                                                        id="description"
                                                        placeholder={t('enter_description')}
                                                        InputProps={{
                                                            classes: {
                                                                root: classes.textInput,
                                                            },
                                                        }}
                                                        error={!!errors.description}
                                                        helperText={errors.description?.message}
                                                        variant="standard"
                                                        size="small"
                                                        disabled={!isOwnModel}
                                                        autoFocus
                                                        fullWidth
                                                        multiline
                                                        {...muiRegister('description')}
                                                    />
                                                    <Grid
                                                        className={classes.formButtons}
                                                        spacing={1}
                                                        container
                                                    >
                                                        <Grid item>
                                                            <Button
                                                                variant="contained"
                                                                size="small"
                                                                color="secondary"
                                                                startIcon={<CancelIcon />}
                                                                onClick={handleCancelButtonClick}
                                                            >
                                                                {t('cancel')}
                                                            </Button>
                                                        </Grid>
                                                        <Grid item>
                                                            <LoadingButton
                                                                type="submit"
                                                                variant="contained"
                                                                size="small"
                                                                color="primary"
                                                                loading={isSubmitting}
                                                                disabled={!isDirty}
                                                                startIcon={<SaveIcon />}
                                                            >
                                                                {t('save')}
                                                            </LoadingButton>
                                                        </Grid>
                                                    </Grid>
                                                </form>
                                            )}
                                        </dd>
                                    </div>
                                )}
                            </dl>
                        </Box>
                    </Collapse>
                </TableCell>
            </TableRow>
        </React.Fragment>
    );
}

export default ModelListItem;
