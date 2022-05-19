import React, { useState } from 'react';

import clsx from 'clsx';
import { useTranslation } from 'react-i18next';
import { useForm, FormProvider, SubmitHandler } from 'react-hook-form';
import { useTheme, Theme } from '@material-ui/core/styles';
import useMediaQuery from '@material-ui/core/useMediaQuery';
import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';
import IconButton from '@material-ui/core/IconButton';
import InputBase from '@material-ui/core/InputBase';
import LinearProgress from '@material-ui/core/LinearProgress';
import Paper from '@material-ui/core/Paper';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TablePagination from '@material-ui/core/TablePagination';
import TableRow from '@material-ui/core/TableRow';
import TableSortLabel from '@material-ui/core/TableSortLabel';
import Toolbar from '@material-ui/core/Toolbar';
import Tooltip from '@material-ui/core/Tooltip';
import Typography from '@material-ui/core/Typography';
import Skeleton from '@material-ui/lab/Skeleton';
import AddIcon from '@material-ui/icons/Add';
import CloseIcon from '@material-ui/icons/Close';
import SearchIcon from '@material-ui/icons/Search';
import ChevronRightIcon from '@material-ui/icons/ChevronRight';

import { createModel, Model, ModelConfiguration } from '../api/models';
import { DialogOnCloseEvent, DialogOnCloseReasonExt } from '../types/dialog';
import { Errors, getResponseErrors } from '../utils/errors';
import { getComparator, sortStable, Order } from '../lib/table';
import useSession from '../hooks/useSession';
import useSnackbar from '../hooks/useSnackbar';
import AddModelDialog from './AddModelDialog';
import ModelListItem from './ModelListItem';
import AlertPopup from './AlertPopup';

import useStyles from './ModelList.styles';

export type SortableKey = keyof Omit<Model, 'online' | 'active' | 'public' | 'model'>;

export interface HeadCell {
    id: SortableKey;
    label: string;
    numeric: boolean;
    class: string;
}

export interface ModelListProps {
    id: string;
    title: string;
    description?: React.ReactNode;
    addModelDialogTitle?: string;
    searchPlaceholder: string;
    models: Model[];
    online?: boolean;
    loading?: boolean;
    gutterBottom?: boolean;
    showUserColumn?: boolean;
    showDateColumn?: boolean;
    onModelUpdate: (model: Model, remove?: boolean) => void;
}

function ModelList({
    id,
    title,
    description,
    addModelDialogTitle,
    searchPlaceholder,
    models,
    online: isOnline = false,
    loading: isLoading = false,
    gutterBottom,
    showUserColumn,
    showDateColumn,
    onModelUpdate,
}: ModelListProps): JSX.Element {
    const classes = useStyles();
    const muiTheme = useTheme();
    const { t } = useTranslation();
    const [{ modelsPerPage }, setSession] = useSession();
    const [showSnackbar] = useSnackbar();
    const [order, setOrder] = useState<Order>('desc');
    const [orderBy, setOrderBy] = useState<SortableKey>('createdAt');
    const [page, setPage] = useState(0);
    const [isRowOpen, setIsRowOpen] = useState(0);
    const [search, setSearch] = useState<string | null>(null);
    const [addModelDialogState, setAddModelDialogState] = useState(0);
    const [modelFormData, setModelFormData] = useState<ModelConfiguration | null>(null);
    const modelForm = useForm({
        mode: 'onChange',
        shouldUnregister: true,
    });

    const isSearchActive = search !== null;
    const isScreenWidthGteSm = useMediaQuery((theme: Theme) => theme.breakpoints.up('sm'));
    const isBuilding =
        !!addModelDialogTitle && modelFormData !== null && modelFormData.online === isOnline;
    const filteredModels = models.filter((m) => {
        const searchRegExp = new RegExp(search || '', 'i');
        return (
            m.name.search(searchRegExp) > -1 ||
            m.description.search(searchRegExp) > -1 ||
            m.username.search(searchRegExp) > -1 ||
            m.dataset.search(searchRegExp) > -1
        );
    });
    const rowsPerPage = isScreenWidthGteSm ? modelsPerPage[id] || 5 : 5;
    const currentPageRows = filteredModels.length - page * rowsPerPage;
    const emptyRows = rowsPerPage - Math.min(rowsPerPage, currentPageRows);
    const headCells: HeadCell[] = [
        {
            id: 'name',
            numeric: false,
            label: t('model_name'),
            class: classes.colHeadName,
        },
        {
            id: 'username',
            numeric: false,
            label: t('user'),
            class: classes.colHeadUser,
        },
        {
            id: 'createdAt',
            numeric: true,
            label: t('creation_date'),
            class: classes.colHeadDate,
        },
    ].filter<HeadCell>((cell): cell is HeadCell => {
        switch (cell.id) {
            case 'username':
                return !!showUserColumn;
            case 'createdAt':
                return !!showDateColumn;
            default:
                return true;
        }
    });
    const pageModels = sortStable<Model>(
        filteredModels,
        getComparator<SortableKey>(order, orderBy),
    ).slice(page * rowsPerPage, (page + 1) * rowsPerPage);

    function createSortHandler(property: SortableKey) {
        return () => {
            const isAsc = orderBy === property && order === 'asc';
            setOrder(isAsc ? 'desc' : 'asc');
            setOrderBy(property);
        };
    }

    function toggleSearch(active?: boolean) {
        const shouldActivateSearch = active !== undefined ? active : !(search !== null);
        setSearch(shouldActivateSearch ? '' : null);
    }

    function handleRowClick(event: React.MouseEvent, modelId: number) {
        setIsRowOpen(isRowOpen === modelId ? 0 : modelId);
    }

    function handleChangePage(event: unknown, newPage: number) {
        setPage(newPage);
    }

    function handleChangeModelsPerPage(event: React.ChangeEvent<HTMLInputElement>) {
        setSession({
            modelsPerPage: {
                ...modelsPerPage,
                [id]: parseInt(event.target.value, 10),
            },
        });
        setPage(0);
    }

    function handleSearchInputKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
        if (event.code === 'Escape') {
            toggleSearch(false);
        }
    }

    function handleSearchToggle() {
        toggleSearch();
    }

    function handleSearchChange(event: React.ChangeEvent<HTMLInputElement>) {
        setSearch(event.target.value);
    }

    function handleAddButtonClick() {
        setAddModelDialogState((state) => state + 1);
    }

    function handleAddModelDialogClose(event: DialogOnCloseEvent, reason: DialogOnCloseReasonExt) {
        if (reason === 'closeClick') {
            setAddModelDialogState((state) => state + 1);
        }
    }

    const handleModelFormSubmit: SubmitHandler<ModelConfiguration> = async (data) => {
        setAddModelDialogState((state) => state + 1);

        // if (modelForm.formState.isSubmitting) {
        //     return;
        // }

        setModelFormData(data);

        try {
            const response = await createModel(data);
            setModelFormData(null);

            if (response.data.model) {
                onModelUpdate(response.data.model);
                showSnackbar({
                    message: t('model_successfully_added'),
                    severity: 'success',
                    // autoHideDuration: null
                });
            }
        } catch (error) {
            setModelFormData(null);

            // Handle form errors.
            const responseErrors = getResponseErrors<Errors>(error, t);

            if (Array.isArray(responseErrors)) {
                const message = responseErrors;

                if (message.length) {
                    showSnackbar({
                        message: responseErrors,
                        severity: 'error',
                    });
                }
            }
        }
    };

    return (
        <Paper
            className={clsx(classes.root, {
                gutterBottom,
            })}
        >
            <Toolbar className={classes.toolbar} variant="regular">
                {!isSearchActive && (
                    <Typography id={id} className={classes.title} component="h2" variant="h6">
                        {title}
                        {!!description && (
                            <AlertPopup severity="info" placement="end">
                                {description}
                            </AlertPopup>
                        )}
                    </Typography>
                )}
                {!!models.length && isSearchActive && (
                    <InputBase
                        classes={{
                            root: classes.searchControlRoot,
                            input: classes.searchControlInput,
                        }}
                        placeholder={searchPlaceholder}
                        value={search}
                        onChange={handleSearchChange}
                        onKeyDown={handleSearchInputKeyDown}
                        autoFocus
                    />
                )}
                <Box className={classes.buttons}>
                    {!!models.length && (
                        <Tooltip
                            title={isSearchActive ? t('close_search') : searchPlaceholder}
                            enterDelay={muiTheme.timing.tooltipEnterDelay}
                        >
                            <IconButton
                                className={classes.searchButton}
                                size="small"
                                edge={
                                    !addModelDialogTitle || (isSearchActive && !isScreenWidthGteSm)
                                        ? 'end'
                                        : undefined
                                }
                                color={isSearchActive ? 'secondary' : 'default'}
                                onClick={handleSearchToggle}
                            >
                                {isSearchActive ? (
                                    <CloseIcon />
                                ) : (
                                    <SearchIcon />
                                )}
                            </IconButton>
                        </Tooltip>
                    )}
                    {!!addModelDialogTitle && (!isSearchActive || isScreenWidthGteSm) && (
                        <>
                            <Button
                                variant="contained"
                                size="small"
                                startIcon={<AddIcon />}
                                disabled={isLoading || modelForm.formState.isSubmitting}
                                onClick={handleAddButtonClick}
                                disableElevation
                            >
                                {t('add')}
                            </Button>
                            {!!addModelDialogTitle && (
                                <FormProvider {...modelForm}>
                                    <form
                                        id="model-form"
                                        onSubmit={modelForm.handleSubmit(handleModelFormSubmit)}
                                    >
                                        <input
                                            type="hidden"
                                            value={Number(isOnline)}
                                            {...modelForm.register('online', {
                                                setValueAs: (v) => !!parseInt(v, 10),
                                            })}
                                        />
                                    </form>
                                    <AddModelDialog
                                        key={addModelDialogState}
                                        open={addModelDialogState % 2 === 1}
                                        title={addModelDialogTitle}
                                        online={isOnline}
                                        onClose={handleAddModelDialogClose}
                                        // keepMounted={false}
                                    />
                                </FormProvider>
                            )}
                        </>
                    )}
                </Box>
            </Toolbar>
            <TableContainer>
                <Table className={classes.table} size="small" aria-labelledby={id}>
                    <TableHead>
                        <TableRow>
                            {headCells.map((headCell) => (
                                <TableCell
                                    key={headCell.id}
                                    className={headCell.class}
                                    align={headCell.numeric ? 'right' : 'left'}
                                    sortDirection={orderBy === headCell.id ? order : false}
                                >
                                    <Tooltip
                                        title={
                                            orderBy !== headCell.id || order === 'desc'
                                                ? t('sort_ascending')
                                                : t('sort_descending')
                                        }
                                        enterDelay={muiTheme.timing.tooltipEnterDelay}
                                    >
                                        <TableSortLabel
                                            active={
                                                !isLoading &&
                                                !!models.length &&
                                                orderBy === headCell.id
                                            }
                                            direction={
                                                (!isLoading &&
                                                    (orderBy === headCell.id ? order : 'asc')) ||
                                                undefined
                                            }
                                            onClick={createSortHandler(headCell.id)}
                                            disabled={isLoading || !models.length}
                                        >
                                            {headCell.label}
                                            {orderBy === headCell.id && (
                                                <Typography variant="srOnly">
                                                    {order === 'desc'
                                                        ? t('sorted_descending')
                                                        : t('sorted_ascending')}
                                                </Typography>
                                            )}
                                        </TableSortLabel>
                                    </Tooltip>
                                </TableCell>
                            ))}
                            <TableCell className={classes.colHeadActions} />
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {isBuilding && (
                            <TableRow>
                                <TableCell
                                    className={classes.modelProgressCell}
                                    colSpan={
                                        2 + Number(!!showUserColumn) + Number(!!showDateColumn)
                                    }
                                >
                                    <Typography variant="body2" noWrap>
                                        <ChevronRightIcon
                                            className={classes.modelProgressIcon}
                                            fontSize="small"
                                            color="action"
                                        />
                                        {modelFormData?.name}{' '}
                                        <Typography
                                            component="span"
                                            variant="caption"
                                            color="textSecondary"
                                        >
                                            {t('building')}&hellip;
                                        </Typography>
                                    </Typography>
                                    <LinearProgress
                                        className={classes.modelProgress}
                                        color="primary"
                                    />
                                </TableCell>
                            </TableRow>
                        )}
                        {pageModels.map((model) => {
                            const isRowSelected = model.id === isRowOpen;

                            return (
                                <ModelListItem
                                    key={model.id}
                                    model={model}
                                    selected={isRowSelected}
                                    online={isOnline}
                                    searchTerm={search || ''}
                                    showUserColumn={showUserColumn}
                                    showDateColumn={showDateColumn}
                                    onModelUpdate={onModelUpdate}
                                    onItemClick={handleRowClick}
                                />
                            );
                        })}
                        {isLoading &&
                            !models.length &&
                            Array.from(Array(rowsPerPage)).map((e, i) => (
                                <TableRow key={`row-${i + 1}`}>
                                    <TableCell>
                                        <Typography variant="body2">
                                            <Skeleton />
                                        </Typography>
                                    </TableCell>
                                    {showUserColumn && (
                                        <TableCell>
                                            <Typography variant="body2">
                                                <Skeleton />
                                            </Typography>
                                        </TableCell>
                                    )}
                                    {showDateColumn && (
                                        <TableCell>
                                            <Typography variant="body2">
                                                <Skeleton />
                                            </Typography>
                                        </TableCell>
                                    )}
                                    <TableCell>
                                        <Skeleton variant="rect" height={30} />
                                    </TableCell>
                                </TableRow>
                            ))}
                        {!isLoading && emptyRows > 0 && (
                            <TableRow style={{ height: 43 * emptyRows }}>
                                <TableCell
                                    colSpan={
                                        2 + Number(!!showUserColumn) + Number(!!showDateColumn)
                                    }
                                />
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </TableContainer>
            <TablePagination
                rowsPerPageOptions={isScreenWidthGteSm ? [5, 10, 25] : [5]}
                component="div"
                count={filteredModels.length}
                rowsPerPage={isScreenWidthGteSm ? rowsPerPage : 5}
                page={page}
                backIconButtonText={t('previous_page')}
                backIconButtonProps={{
                    size: 'small',
                }}
                nextIconButtonText={t('next_page')}
                nextIconButtonProps={{
                    size: 'small',
                }}
                labelRowsPerPage={`${t('rows_per_page')}:`}
                labelDisplayedRows={({ from, to, count }) => {
                    if (isLoading) {
                        return (
                            <Typography component="span" variant="body2">
                                <Skeleton width={60} />
                            </Typography>
                        );
                    }
                    return count !== -1
                        ? t(
                              (count > 0 || models.length
                                  ? 'from_to_of'
                                  : 'n_models') as Parameters<typeof t>[0],
                              {
                                  from,
                                  to,
                                  count,
                              },
                          )
                        : t('from_to_of_more_than', {
                              from,
                              to,
                          });
                }}
                onChangePage={handleChangePage}
                onChangeRowsPerPage={handleChangeModelsPerPage}
            />
        </Paper>
    );
}

export default ModelList;
