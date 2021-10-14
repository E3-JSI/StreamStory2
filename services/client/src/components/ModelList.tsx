import React, { useState } from 'react';

import axios from 'axios';
import clsx from 'clsx';
import { useTranslation } from 'react-i18next';
import { useForm, FormProvider, SubmitHandler } from 'react-hook-form';
import { useTheme, Theme } from '@material-ui/core/styles';
import useMediaQuery from '@material-ui/core/useMediaQuery';
import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';
import IconButton from '@material-ui/core/IconButton';
import InputBase from '@material-ui/core/InputBase';
import Paper from '@material-ui/core/Paper';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell, { SortDirection } from '@material-ui/core/TableCell';
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

import { Model } from '../types/api';
import { DialogOnCloseEvent, DialogOnCloseReasonExt } from '../types/dialog';
import { Errors, getResponseErrors } from '../utils/errors';
import useSession from '../hooks/useSession';
import useSnackbar from '../hooks/useSnackbar';
import AddModelDialog from './AddModelDialog';
import ModelListItem from './ModelListItem';
import { ModelFormRequestData } from './ModelConfig';
import AlertPopup from './AlertPopup';

import useStyles from './ModelList.styles';

export type Order = Exclude<SortDirection, false>;

export type SortableKey = keyof Omit<Model, 'online' | 'active' | 'public' | 'model'>;

export interface ModelFormResponseData {
    model?: Model;
    error?: Errors | string[] | string;
}

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
    gutterBottom?: boolean;
    loading?: boolean;
    showUserColumn?: boolean;
    showDateColumn?: boolean;
    updateModel: (model: Model, remove?: boolean) => void;
}

function compareDescending<T>(a: T, b: T, orderBy: keyof T) {
    if (b[orderBy] < a[orderBy]) {
        return -1;
    }

    if (b[orderBy] > a[orderBy]) {
        return 1;
    }

    return 0;
}

function getComparator<Key extends SortableKey>(
    order: Order,
    orderBy: Key,
): (a: { [key in Key]: number | string }, b: { [key in Key]: number | string }) => number {
    return order === 'desc'
        ? (a, b) => compareDescending(a, b, orderBy)
        : (a, b) => -compareDescending(a, b, orderBy);
}

function sortStable<T>(array: T[], comparator: (a: T, b: T) => number) {
    const stabilizedThis = array.map((el, index) => [el, index] as [T, number]);
    stabilizedThis.sort((a, b) => {
        const order = comparator(a[0], b[0]);
        if (order !== 0) {
            return order;
        }

        return a[1] - b[1];
    });
    return stabilizedThis.map((el) => el[0]);
}

function ModelList({
    id,
    title,
    description,
    addModelDialogTitle,
    searchPlaceholder,
    models,
    online = false,
    gutterBottom,
    loading = false,
    showUserColumn,
    showDateColumn,
    updateModel,
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
    const [modelFormData, setModelFormData] = useState<ModelFormRequestData | null>(null);
    const modelForm = useForm({
        mode: 'onChange',
        shouldUnregister: true,
    });

    const isSearchActive = search !== null;
    const isScreenWidthGteSm = useMediaQuery((theme: Theme) => theme.breakpoints.up('sm'));
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
    const pageModels = sortStable<Model>(filteredModels, getComparator(order, orderBy)).slice(
        page * rowsPerPage,
        (page + 1) * rowsPerPage,
    );

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

    const handleModelFormSubmit: SubmitHandler<ModelFormRequestData> = async (data) => {
        setAddModelDialogState((state) => state + 1);

        // if (modelForm.formState.isSubmitting) {
        //     return;
        // }

        setModelFormData(data);

        try {
            const response = await axios.post<ModelFormResponseData>(`/api/models/`, data);
            setModelFormData(null);

            if (response.data.model) {
                updateModel(response.data.model);
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
                                    <CloseIcon fontSize="small" />
                                ) : (
                                    <SearchIcon fontSize="small" />
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
                                disabled={loading || modelForm.formState.isSubmitting}
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
                                            value={Number(online)}
                                            {...modelForm.register('online', {
                                                setValueAs: (v) => !!parseInt(v, 10),
                                            })}
                                        />
                                    </form>
                                    <AddModelDialog
                                        key={addModelDialogState}
                                        open={addModelDialogState % 2 === 1}
                                        title={addModelDialogTitle}
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
                                                !loading &&
                                                !!models.length &&
                                                orderBy === headCell.id
                                            }
                                            direction={
                                                (!loading &&
                                                    (orderBy === headCell.id ? order : 'asc')) ||
                                                undefined
                                            }
                                            onClick={createSortHandler(headCell.id)}
                                            disabled={loading || !models.length}
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
                        {!!addModelDialogTitle && modelFormData !== null && (
                            <TableRow>
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
                        )}
                        {pageModels.map((model) => {
                            const isRowSelected = model.id === isRowOpen;

                            return (
                                <ModelListItem
                                    key={model.id}
                                    model={model}
                                    selected={isRowSelected}
                                    searchTerm={search || ''}
                                    showUserColumn={showUserColumn}
                                    showDateColumn={showDateColumn}
                                    updateModel={updateModel}
                                    onItemClick={handleRowClick}
                                />
                            );
                        })}
                        {loading &&
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
                        {!loading && emptyRows > 0 && (
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
                nextIconButtonText={t('next_page')}
                labelRowsPerPage={`${t('rows_per_page')}:`}
                labelDisplayedRows={({ from, to, count }) => {
                    if (loading) {
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
