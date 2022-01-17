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

import { getUsers, User, UserGroup } from '../api/users';
import { getResponseErrors } from '../utils/errors';
import { getComparator, sortStable, Order } from '../lib/table';
import useSession from '../hooks/useSession';
import useSnackbar from '../hooks/useSnackbar';
import useMountEffect from '../hooks/useMountEffect';
import ConfirmationDialog from './ConfirmationDialog';
import TransHtml from './TransHtml';
import ApiKeyDialog, { ApiKeyDialogState } from './ApiKeyDialog';
import Mark from './Mark';

import useStyles from './UserProfileApiKeys.styles';
import { ApiKey, getApiKeys, deleteApiKey } from '../api/apiKeys';

export type SortableKey = keyof Pick<ApiKey, 'value' | 'domain'>;

export interface HeadCell {
    id: SortableKey;
    label: string;
    numeric: boolean;
    class: string;
}

function UserProfileApiKeys(): JSX.Element {
    const classes = useStyles();
    const muiTheme = useTheme();
    const { t } = useTranslation();
    const [{ user }] = useSession();
    const [showSnackbar] = useSnackbar();
    const [search, setSearch] = useState<string | null>(null);
    const [apiKeyDialogState, setApiKeyDialogState] = useState(ApiKeyDialogState.Closed);
    const [apiKeys, setApiKeys] = useState<ApiKey[] | null>(null);
    const [apiKey, setApiKey] = useState<ApiKey | null>(null);
    const [order, setOrder] = useState<Order>('desc');
    const [orderBy, setOrderBy] = useState<SortableKey>('domain');
    const [page, setPage] = useState(0);
    const [apiKeysPerPage, setApiKeysPerPage] = useState(5);
    const [isRemoveApiKeyDialogOpen, setIsRemoveApiKeyDialogOpen] = useState(0);
    const [users, setUsers] = useState<User[] | null>(null);
    const [selectedUser, setSelectedUser] = useState<User | null>(user);

    const isLoading = apiKeys === null;
    const isSearchActive = search !== null;
    const isScreenWidthGteSm = useMediaQuery((theme: Theme) => theme.breakpoints.up('sm'));
    const isScreenWidthGteMd = useMediaQuery((theme: Theme) => theme.breakpoints.up('md'));
    const showDomainColumn = isScreenWidthGteMd;
    const showUrlColumn = isScreenWidthGteSm;
    const filteredApiKeys =
        apiKeys &&
        apiKeys.filter((key) => {
            const searchRegExp = new RegExp(search || '', 'i');
            return key.value.search(searchRegExp) > -1 || key.domain.search(searchRegExp) > -1;
        });
    const rowsPerPage = isScreenWidthGteSm ? apiKeysPerPage : 5;
    const currentPageRows = Number(filteredApiKeys && filteredApiKeys.length) - page * rowsPerPage;
    const emptyRows = rowsPerPage - Math.min(rowsPerPage, currentPageRows);
    const pageApiKeys =
        filteredApiKeys &&
        sortStable<ApiKey>(filteredApiKeys, getComparator(order, orderBy)).slice(
            page * rowsPerPage,
            (page + 1) * rowsPerPage,
        );
    const headCells: HeadCell[] = [
        {
            id: 'value',
            numeric: false,
            label: t('api_key'),
            class: classes.colHeadName,
        },
        {
            id: 'domain',
            numeric: false,
            label: t('domain'),
            class: classes.colHeadDescription,
        },
    ].filter<HeadCell>((cell): cell is HeadCell => {
        switch (cell.id) {
            case 'domain':
                return !!showDomainColumn;
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
        async function loadApiKeys() {
            if (!selectedUser) {
                return;
            }

            try {
                const response = await getApiKeys(selectedUser.id);

                if (response.data.apiKeys) {
                    setApiKeys(response.data.apiKeys);
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

        loadApiKeys();
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
        setApiKeyDialogState(ApiKeyDialogState.Add);
    }

    function handleApiKeyDialogClose() {
        setApiKeyDialogState(ApiKeyDialogState.Closed);
    }

    function handleApiKeyDialogAccept(key: ApiKey) {
        const keys = apiKeys ? [...apiKeys] : [];
        setApiKey(key);

        if (apiKeyDialogState === ApiKeyDialogState.Add) {
            keys.push(key);
            setApiKeys(keys);
        } else {
            const index = keys.findIndex((ds) => ds.id === key.id);

            if (index > -1) {
                keys[index] = key;
            }
            setApiKeys(keys);
        }

        setApiKeyDialogState(ApiKeyDialogState.Closed);
    }

    function handleChangePage(event: unknown, newPage: number) {
        setPage(newPage);
    }

    function handleChangeModelsPerPage(event: React.ChangeEvent<HTMLInputElement>) {
        setApiKeysPerPage(parseInt(event.target.value, 10));
        setPage(0);
    }

    function getRemoveApiKeyDialogButtonClickHandler(id: number) {
        return () => {
            setIsRemoveApiKeyDialogOpen(id);
        };
    }

    function handleRemoveApiKeyDialogClose() {
        setIsRemoveApiKeyDialogOpen(0);
    }

    function getRemoveDataSourceDialogAcceptHandler(id: number) {
        return async () => {
            setIsRemoveApiKeyDialogOpen(0);

            if (!apiKeys) {
                return;
            }

            try {
                const response = await deleteApiKey(id);

                if (response?.data.success) {
                    setApiKeys((apiKeys || []).filter((key) => key.id !== id));
                    setApiKey(null);
                    showSnackbar({
                        message: t('api_key_deleted'),
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
            if (!apiKeys) {
                return;
            }

            const key = apiKeys.find((k) => k.id === id);

            if (!key) {
                return;
            }

            setApiKey(key);
            setApiKeyDialogState(ApiKeyDialogState.Edit);
        };
    }

    function handleUserChange(
        event: React.ChangeEvent<Record<string, unknown>>,
        newUser: User | null,
    ) {
        setApiKeys(null);
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
                        {t('api_keys')}
                    </Typography>
                )}
                {apiKeys && !!apiKeys.length && isSearchActive && (
                    <InputBase
                        classes={{
                            root: classes.searchControlRoot,
                            input: classes.searchControlInput,
                        }}
                        placeholder={t('search_api_keys')}
                        value={search}
                        onChange={handleSearchChange}
                        onKeyDown={handleSearchInputKeyDown}
                        autoFocus
                    />
                )}
                <Box className={classes.buttons}>
                    {apiKeys && !!apiKeys.length && (
                        <Tooltip
                            title={isSearchActive ? t('close_search') : t('search_api_keys')}
                            enterDelay={muiTheme.timing.tooltipEnterDelay}
                        >
                            <IconButton
                                className={classes.searchButton}
                                size="small"
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
                                                !!apiKeys &&
                                                !!apiKeys.length &&
                                                orderBy === headCell.id
                                            }
                                            direction={
                                                (!isLoading &&
                                                    (orderBy === headCell.id ? order : 'asc')) ||
                                                undefined
                                            }
                                            onClick={createSortHandler(headCell.id)}
                                            disabled={isLoading || !apiKeys || !apiKeys.length}
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
                        {pageApiKeys &&
                            pageApiKeys.map((key) => {
                                const searchTerm = search || '';
                                return (
                                    <TableRow key={key.id}>
                                        <TableCell align="left">
                                            <Typography
                                                className={classes.rowMainContent}
                                                component="span"
                                                variant="body2"
                                                noWrap
                                            >
                                                <Mark term={searchTerm}>{key.value}</Mark>
                                            </Typography>
                                        </TableCell>
                                        {showDomainColumn && (
                                            <TableCell align="left">
                                                <Typography
                                                    className={classes.rowMainContent}
                                                    component="span"
                                                    variant="body2"
                                                    noWrap
                                                >
                                                    <Mark term={searchTerm}>{key.domain}</Mark>
                                                </Typography>
                                            </TableCell>
                                        )}
                                        <TableCell align="right">
                                            <Tooltip
                                                title={t('edit_api_key')}
                                                enterDelay={muiTheme.timing.tooltipEnterDelay}
                                            >
                                                <IconButton
                                                    size="small"
                                                    aria-label={t('edit_api_key')}
                                                    onClick={getEditButtonClickHandler(key.id)}
                                                >
                                                    <EditIcon fontSize="small" />
                                                </IconButton>
                                            </Tooltip>
                                            <Tooltip
                                                title={t('delete_api_key')}
                                                enterDelay={muiTheme.timing.tooltipEnterDelay}
                                            >
                                                <IconButton
                                                    size="small"
                                                    aria-label={t('delete_api_key')}
                                                    onClick={getRemoveApiKeyDialogButtonClickHandler(
                                                        key.id,
                                                    )}
                                                >
                                                    <DeleteIcon fontSize="small" />
                                                </IconButton>
                                            </Tooltip>
                                            <ConfirmationDialog
                                                id="remove-data-source-dialog"
                                                title={t('delete_api_key')}
                                                content={
                                                    <TransHtml
                                                        i18nKey="delete_api_key_confirmation"
                                                        values={{
                                                            domain: key.domain,
                                                        }}
                                                    />
                                                }
                                                open={isRemoveApiKeyDialogOpen === key.id}
                                                onClose={handleRemoveApiKeyDialogClose}
                                                onAccept={getRemoveDataSourceDialogAcceptHandler(
                                                    key.id,
                                                )}
                                                onDecline={handleRemoveApiKeyDialogClose}
                                            />
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                        {isLoading &&
                            (!apiKeys || !apiKeys.length) &&
                            Array.from(Array(rowsPerPage)).map((e, i) => (
                                <TableRow key={`row-${i + 1}`}>
                                    <TableCell>
                                        <Typography variant="body2">
                                            <Skeleton />
                                        </Typography>
                                    </TableCell>
                                    {showDomainColumn && (
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
                                        2 + Number(!!showDomainColumn) + Number(!!showUrlColumn)
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
                            />
                        ) : (
                            <Skeleton variant="rect" height={40} />
                        )}
                    </Grid>
                )}
                <Grid item className={classes.paginationGridItem}>
                    <TablePagination
                        rowsPerPageOptions={isScreenWidthGteSm ? [5, 10, 25] : [5]}
                        component="div"
                        count={Number(filteredApiKeys && filteredApiKeys.length)}
                        rowsPerPage={isScreenWidthGteSm ? rowsPerPage : 5}
                        page={page}
                        backIconButtonText={t('previous_page')}
                        nextIconButtonText={t('next_page')}
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
                                      (count > 0 || Number(apiKeys && apiKeys.length)
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
                </Grid>
            </Grid>
            <ApiKeyDialog
                key={apiKeyDialogState}
                apiKey={(apiKeyDialogState === ApiKeyDialogState.Edit && apiKey) || undefined}
                userId={selectedUser?.id}
                open={apiKeyDialogState > ApiKeyDialogState.Closed}
                maxWidth="sm"
                onClose={handleApiKeyDialogClose}
                onAccept={handleApiKeyDialogAccept}
                onDecline={handleApiKeyDialogClose}
                fullWidth
            />
        </Paper>
    );
}

export default UserProfileApiKeys;
