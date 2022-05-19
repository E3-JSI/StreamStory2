import React, { useEffect, useState } from 'react';

import useMediaQuery from '@material-ui/core/useMediaQuery';
import { useTheme, Theme } from '@material-ui/core/styles';
import { useTranslation } from 'react-i18next';
import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';
import IconButton from '@material-ui/core/IconButton';
import InputBase from '@material-ui/core/InputBase';
import Paper from '@material-ui/core/Paper';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TablePagination from '@material-ui/core/TablePagination';
import TableRow from '@material-ui/core/TableRow';
import TableSortLabel from '@material-ui/core/TableSortLabel';
import TextField from '@material-ui/core/TextField';
import Toolbar from '@material-ui/core/Toolbar';
import Tooltip from '@material-ui/core/Tooltip';
import Typography from '@material-ui/core/Typography';
import Skeleton from '@material-ui/lab/Skeleton';
import Autocomplete from '@material-ui/lab/Autocomplete';
import AddIcon from '@material-ui/icons/Add';
import CloseIcon from '@material-ui/icons/Close';
import DeleteIcon from '@material-ui/icons/Delete';
import EditIcon from '@material-ui/icons/Edit';
import SearchIcon from '@material-ui/icons/Search';

import { DataSource, getDataSources, deleteDataSource } from '../api/dataSources';
import { getUsers, User, UserGroup } from '../api/users';
import { getResponseErrors } from '../utils/errors';
import { getComparator, sortStable, Order } from '../lib/table';
import useSession from '../hooks/useSession';
import useSnackbar from '../hooks/useSnackbar';
import useMountEffect from '../hooks/useMountEffect';
import ConfirmationDialog from './ConfirmationDialog';
import TransHtml from './TransHtml';
import DataSourceDialog, { DataSourceDialogState } from './DataSourceDialog';
import Mark from './Mark';

import useStyles from './UserProfileDataSources.styles';

export type SortableKey = keyof Pick<DataSource, 'name' | 'description' | 'url'>;

export interface HeadCell {
    id: SortableKey;
    label: string;
    numeric: boolean;
    class: string;
}

function UserProfileDetaSources(): JSX.Element {
    const classes = useStyles();
    const muiTheme = useTheme();
    const { t } = useTranslation();
    const [{ user }] = useSession();
    const [showSnackbar] = useSnackbar();
    const [search, setSearch] = useState<string | null>(null);
    const [dataSourceDialogState, setDataSourceDialogState] = useState(
        DataSourceDialogState.Closed,
    );
    const [dataSources, setDataSources] = useState<DataSource[] | null>(null);
    const [dataSource, setDataSource] = useState<DataSource | null>(null);
    const [order, setOrder] = useState<Order>('desc');
    const [orderBy, setOrderBy] = useState<SortableKey>('name');
    const [page, setPage] = useState(0);
    const [itemsPerPage, setItemsPerPage] = useState(5);
    const [isRemoveDataSourceDialogOpen, setIsRemoveDataSourceDialogOpen] = useState(0);
    const [users, setUsers] = useState<User[] | null>(null);
    const [selectedUser, setSelectedUser] = useState<User>(user as User);

    const isLoading = dataSources === null;
    const isSearchActive = search !== null;
    const isScreenWidthGteSm = useMediaQuery((theme: Theme) => theme.breakpoints.up('sm'));
    const isScreenWidthGteMd = useMediaQuery((theme: Theme) => theme.breakpoints.up('md'));
    const showDescriptionColumn = isScreenWidthGteMd;
    const showUrlColumn = isScreenWidthGteSm;
    const filteredDataSources =
        dataSources &&
        dataSources.filter((source) => {
            const searchRegExp = new RegExp(search || '', 'i');
            return (
                source.name.search(searchRegExp) > -1 ||
                source.description.search(searchRegExp) > -1 ||
                source.url.search(searchRegExp) > -1
            );
        });
    const rowsPerPage = isScreenWidthGteSm ? itemsPerPage : 5;
    const currentPageRows =
        Number(filteredDataSources && filteredDataSources.length) - page * rowsPerPage;
    const emptyRows = rowsPerPage - Math.min(rowsPerPage, currentPageRows);
    const pageDataSources =
        filteredDataSources &&
        sortStable<DataSource>(filteredDataSources, getComparator(order, orderBy)).slice(
            page * rowsPerPage,
            (page + 1) * rowsPerPage,
        );
    const headCells: HeadCell[] = [
        {
            id: 'name',
            numeric: false,
            label: t('data_source_name'),
            class: classes.colHeadName,
        },
        {
            id: 'description',
            numeric: false,
            label: t('description'),
            class: classes.colHeadDescription,
        },
        {
            id: 'url',
            numeric: false,
            label: t('url'),
            class: classes.colHeadUrl,
        },
    ].filter<HeadCell>((cell): cell is HeadCell => {
        switch (cell.id) {
            case 'description':
                return !!showDescriptionColumn;
            case 'url':
                return !!showUrlColumn;
            default:
                return true;
        }
    });

    useMountEffect(() => {
        async function loadUsers() {
            if (!selectedUser || selectedUser.groupId !== UserGroup.Admin) {
                return;
            }

            try {
                const response = await getUsers();

                if (response.data.users) {
                    setUsers(response.data.users);
                }
            } catch (error) {
                const responseErrors = getResponseErrors(error, t);

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
        }

        loadUsers();
    });

    useEffect(() => {
        async function loadDataSources() {
            if (!selectedUser) {
                return;
            }

            try {
                const response = await getDataSources(selectedUser.id);

                if (response.data.dataSources) {
                    setDataSources(response.data.dataSources);
                }
            } catch (error) {
                const responseErrors = getResponseErrors(error, t);

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
        }

        loadDataSources();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedUser]);

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
        setDataSourceDialogState(DataSourceDialogState.Add);
    }

    function handleDataSourceDialogClose() {
        setDataSourceDialogState(DataSourceDialogState.Closed);
    }

    function handleDataSourceDialogAccept(source: DataSource) {
        const sources = dataSources ? [...dataSources] : [];
        setDataSource(source);

        if (dataSourceDialogState === DataSourceDialogState.Add) {
            sources.push(source);
            setDataSources(sources);
        } else {
            const index = sources.findIndex((ds) => ds.id === source.id);

            if (index > -1) {
                sources[index] = source;
            }

            setDataSources(sources);
        }

        setDataSourceDialogState(DataSourceDialogState.Closed);
    }

    function handleChangePage(event: unknown, newPage: number) {
        setPage(newPage);
    }

    function handleChangeItemsPerPage(event: React.ChangeEvent<HTMLInputElement>) {
        setItemsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    }

    function getRemoveDataSourceDialogButtonClickHandler(id: number) {
        return () => {
            setIsRemoveDataSourceDialogOpen(id);
        };
    }

    function handleRemoveDataSourceDialogClose() {
        setIsRemoveDataSourceDialogOpen(0);
    }

    function getRemoveDataSourceDialogAcceptHandler(id: number) {
        return async () => {
            setIsRemoveDataSourceDialogOpen(0);

            if (!dataSources) {
                return;
            }

            try {
                const response = await deleteDataSource(id);

                if (response?.data.success) {
                    setDataSources((dataSources || []).filter((source) => source.id !== id));
                    setDataSource(null);
                    showSnackbar({
                        message: t('data_source_deleted'),
                        severity: 'success',
                    });
                }
            } catch (error) {
                const responseErrors = getResponseErrors(error, t);

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
    }

    function getEditButtonClickHandler(id: number) {
        return () => {
            if (!dataSources) {
                return;
            }

            const source = dataSources.find((ds) => ds.id === id);

            if (!source) {
                return;
            }

            setDataSource(source);
            setDataSourceDialogState(DataSourceDialogState.Edit);
        };
    }

    function handleUserChange(event: React.ChangeEvent<Record<string, unknown>>, newUser: User) {
        setDataSources(null);
        setSelectedUser(newUser);
    }

    return (
        <Paper className={classes.root} elevation={0} square>
            <Toolbar className={classes.toolbar} variant="regular">
                {!isSearchActive && (
                    <Typography
                        id="data-sources-list"
                        className={classes.title}
                        component="h2"
                        variant="h6"
                    >
                        {t('data_sources')}
                    </Typography>
                )}
                {dataSources && !!dataSources.length && isSearchActive && (
                    <InputBase
                        classes={{
                            root: classes.searchControlRoot,
                            input: classes.searchControlInput,
                        }}
                        placeholder={t('search_data_sources')}
                        value={search}
                        onChange={handleSearchChange}
                        onKeyDown={handleSearchInputKeyDown}
                        autoFocus
                    />
                )}
                <Box className={classes.buttons}>
                    {dataSources && !!dataSources.length && (
                        <Tooltip
                            title={isSearchActive ? t('close_search') : t('search_data_sources')}
                            enterDelay={muiTheme.timing.tooltipEnterDelay}
                        >
                            <IconButton
                                className={classes.searchButton}
                                size="small"
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
                    {(!isSearchActive || isScreenWidthGteSm) && (
                        <>
                            <Button
                                variant="contained"
                                size="small"
                                startIcon={<AddIcon />}
                                disabled={isLoading}
                                onClick={handleAddButtonClick}
                                disableElevation
                            >
                                {t('add')}
                            </Button>
                        </>
                    )}
                </Box>
            </Toolbar>
            <TableContainer>
                <Table className={classes.table} size="small" aria-labelledby="data-sources-list">
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
                                                !!dataSources &&
                                                !!dataSources.length &&
                                                orderBy === headCell.id
                                            }
                                            direction={
                                                (!isLoading &&
                                                    (orderBy === headCell.id ? order : 'asc')) ||
                                                undefined
                                            }
                                            onClick={createSortHandler(headCell.id)}
                                            disabled={
                                                isLoading || !dataSources || !dataSources.length
                                            }
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
                        {pageDataSources &&
                            pageDataSources.map((source) => {
                                const searchTerm = search || '';
                                return (
                                    <TableRow key={source.id}>
                                        <TableCell align="left">
                                            <Typography
                                                className={classes.rowMainContent}
                                                component="span"
                                                variant="body2"
                                                noWrap
                                            >
                                                <Mark term={searchTerm}>{source.name}</Mark>
                                            </Typography>
                                        </TableCell>
                                        {showDescriptionColumn && (
                                            <TableCell align="left">
                                                <Typography
                                                    className={classes.rowMainContent}
                                                    component="span"
                                                    variant="body2"
                                                    noWrap
                                                >
                                                    <Mark term={searchTerm}>
                                                        {source.description}
                                                    </Mark>
                                                </Typography>
                                            </TableCell>
                                        )}
                                        {showUrlColumn && (
                                            <TableCell align="left">
                                                <Typography
                                                    className={classes.rowMainContent}
                                                    component="span"
                                                    variant="body2"
                                                    noWrap
                                                >
                                                    <Mark term={searchTerm}>{source.url}</Mark>
                                                </Typography>
                                            </TableCell>
                                        )}
                                        <TableCell align="right">
                                            <Tooltip
                                                title={t('edit_data_source')}
                                                enterDelay={muiTheme.timing.tooltipEnterDelay}
                                            >
                                                <IconButton
                                                    size="small"
                                                    aria-label={t('edit_data_source')}
                                                    onClick={getEditButtonClickHandler(source.id)}
                                                >
                                                    <EditIcon />
                                                </IconButton>
                                            </Tooltip>
                                            <Tooltip
                                                title={t('delete_data_source')}
                                                enterDelay={muiTheme.timing.tooltipEnterDelay}
                                            >
                                                <IconButton
                                                    size="small"
                                                    edge="end"
                                                    aria-label={t('delete_data_source')}
                                                    onClick={getRemoveDataSourceDialogButtonClickHandler(
                                                        source.id,
                                                    )}
                                                >
                                                    <DeleteIcon />
                                                </IconButton>
                                            </Tooltip>
                                            <ConfirmationDialog
                                                id="remove-data-source-dialog"
                                                title={t('delete_data_source')}
                                                content={
                                                    <TransHtml
                                                        i18nKey="delete_data_source_confirmation"
                                                        values={{
                                                            name: source.name,
                                                        }}
                                                    />
                                                }
                                                open={isRemoveDataSourceDialogOpen === source.id}
                                                onClose={handleRemoveDataSourceDialogClose}
                                                onAccept={getRemoveDataSourceDialogAcceptHandler(
                                                    source.id,
                                                )}
                                                onDecline={handleRemoveDataSourceDialogClose}
                                            />
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                        {isLoading &&
                            (!dataSources || !dataSources.length) &&
                            Array.from(Array(rowsPerPage)).map((e, i) => (
                                <TableRow key={`row-${i + 1}`}>
                                    <TableCell>
                                        <Typography variant="body2">
                                            <Skeleton />
                                        </Typography>
                                    </TableCell>
                                    {showDescriptionColumn && (
                                        <TableCell>
                                            <Typography variant="body2">
                                                <Skeleton />
                                            </Typography>
                                        </TableCell>
                                    )}
                                    {showUrlColumn && (
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
                                        2 +
                                        Number(!!showDescriptionColumn) +
                                        Number(!!showUrlColumn)
                                    }
                                />
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </TableContainer>
            <Grid
                className={classes.footerGrid}
                justify="space-between"
                alignItems="center"
                container
            >
                {user?.groupId === UserGroup.Admin && (
                    <Grid item className={classes.userAutocompleteGridItem}>
                        {users ? (
                            <Autocomplete
                                id="user-autocomplete"
                                options={users}
                                getOptionLabel={(option) => option.email}
                                value={selectedUser}
                                onChange={handleUserChange}
                                getOptionSelected={(option, value) => option.id === value.id}
                                renderInput={(params) => (
                                    <TextField {...params} label={t('user')} />
                                )}
                                disableClearable
                            />
                        ) : (
                            <Skeleton variant="rect" height={40} />
                        )}
                    </Grid>
                )}
                <Grid item className={classes.paginationGridItem}>
                    <TablePagination
                        className={classes.pagination}
                        rowsPerPageOptions={isScreenWidthGteSm ? [5, 10, 25] : [5]}
                        component="div"
                        count={Number(filteredDataSources && filteredDataSources.length)}
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
                                      (count > 0 || Number(dataSources && dataSources.length)
                                          ? 'from_to_of'
                                          : 'n_data_sources') as Parameters<typeof t>[0],
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
                        onChangeRowsPerPage={handleChangeItemsPerPage}
                    />
                </Grid>
            </Grid>
            <DataSourceDialog
                key={dataSourceDialogState}
                dataSource={
                    (dataSourceDialogState === DataSourceDialogState.Edit && dataSource) ||
                    undefined
                }
                userId={selectedUser?.id}
                open={dataSourceDialogState > DataSourceDialogState.Closed}
                maxWidth="sm"
                onClose={handleDataSourceDialogClose}
                onAccept={handleDataSourceDialogAccept}
                onDecline={handleDataSourceDialogClose}
                fullWidth
            />
        </Paper>
    );
}

export default UserProfileDetaSources;
