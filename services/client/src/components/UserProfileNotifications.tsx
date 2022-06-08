import React, { useState } from 'react';

import { Link as RouterLink, useParams } from 'react-router-dom';
import clsx from 'clsx';
import useMediaQuery from '@material-ui/core/useMediaQuery';
import { useTheme, Theme } from '@material-ui/core/styles';
import { useTranslation } from 'react-i18next';
import Box from '@material-ui/core/Box';
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
import Toolbar from '@material-ui/core/Toolbar';
import Tooltip from '@material-ui/core/Tooltip';
import Typography from '@material-ui/core/Typography';
import Skeleton from '@material-ui/lab/Skeleton';
import ArrowBackIcon from '@material-ui/icons/ArrowBack';
import CloseIcon from '@material-ui/icons/Close';
import DeleteIcon from '@material-ui/icons/Delete';
import SearchIcon from '@material-ui/icons/Search';
import EmailIcon from '@material-ui/icons/Email';
import DraftsIcon from '@material-ui/icons/Drafts';

import {
    Notification,
    getNotifications,
    deleteNotification,
    updateNotification,
} from '../api/notifications';
// import { getUsers, User, UserGroup } from '../api/users';
import { getResponseErrors } from '../utils/errors';
import { getComparator, sortStable, Order } from '../lib/table';
import useSession from '../hooks/useSession';
import useSnackbar from '../hooks/useSnackbar';
import useMountEffect from '../hooks/useMountEffect';
import ConfirmationDialog from './ConfirmationDialog';
import TransHtml from './TransHtml';
import Mark from './Mark';
import { UserProfileUrlParams } from '../pages/UserProfile';

import useStyles from './UserProfileNotifications.styles';

export type SortableKey = keyof Pick<Notification, 'title' | 'type' | 'time'>;

export interface HeadCell {
    id: SortableKey;
    label: string;
    numeric: boolean;
    class: string;
}

function UserProfileNotifications(): JSX.Element {
    const classes = useStyles();
    const muiTheme = useTheme();
    const { t, i18n } = useTranslation();
    const [{ user }, setSession] = useSession();
    const [showSnackbar] = useSnackbar();
    const [search, setSearch] = useState<string | null>(null);
    const [notifications, setNotifications] = useState<Notification[] | null>(null);
    const [order, setOrder] = useState<Order>('desc');
    const [orderBy, setOrderBy] = useState<SortableKey>('time');
    const [page, setPage] = useState(0);
    const [itemsPerPage, setItemsPerPage] = useState(5);
    const [isRemoveDialogOpen, setIsRemoveDialogOpen] = useState(0);
    const params = useParams<UserProfileUrlParams>();
    const isLoading = notifications === null;
    const isSearchActive = search !== null;
    const isScreenWidthGteSm = useMediaQuery((theme: Theme) => theme.breakpoints.up('sm'));
    const isScreenWidthGteMd = useMediaQuery((theme: Theme) => theme.breakpoints.up('md'));
    const showTypeColumn = isScreenWidthGteMd;
    const showTimeColumn = isScreenWidthGteSm;
    const filteredNotifications =
        notifications &&
        notifications.filter((notification) => {
            const searchRegExp = new RegExp(search || '', 'i');
            return (
                notification.title.search(searchRegExp) > -1 ||
                notification.content.search(searchRegExp) > -1 ||
                notification.type.search(searchRegExp) > -1
            );
        });
    const rowsPerPage = isScreenWidthGteSm ? itemsPerPage : 5;
    const currentPageRows =
        Number(filteredNotifications && filteredNotifications.length) - page * rowsPerPage;
    const emptyRows = rowsPerPage - Math.min(rowsPerPage, currentPageRows);
    const pageNotifications =
        filteredNotifications &&
        sortStable<Notification>(filteredNotifications, getComparator(order, orderBy)).slice(
            page * rowsPerPage,
            (page + 1) * rowsPerPage,
        );
    const dateTimeFormatter = new Intl.DateTimeFormat(i18n.language, {
        dateStyle: 'short',
        timeStyle: 'medium',
    });
    const headCells: HeadCell[] = [
        {
            id: 'title',
            numeric: false,
            label: t('title'),
            class: classes.colHeadTitle,
        },
        {
            id: 'type',
            numeric: false,
            label: t('type'),
            class: classes.colHeadType,
        },
        {
            id: 'time',
            numeric: false,
            label: t('time'),
            class: classes.colHeadTime,
        },
    ].filter<HeadCell>((cell): cell is HeadCell => {
        switch (cell.id) {
            case 'type':
                return !!showTypeColumn;
            case 'time':
                return !!showTimeColumn;
            default:
                return true;
        }
    });

    useMountEffect(() => {
        async function loadNotifications() {
            try {
                const response = await getNotifications();

                if (response.data.notifications) {
                    setNotifications(response.data.notifications);
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

        loadNotifications();
    });

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

    async function toggleNotificationRead(id: number, read?: boolean) {
        if (!notifications) {
            return;
        }

        const index = notifications.findIndex((n) => n.id === id);
        if (index < 0 || read === notifications[index].read) {
            return;
        }

        const {
            data: { notification },
        } = await updateNotification(id, {
            read: read !== undefined ? read : !notifications[index].read,
        });

        if (notification) {
            notifications.splice(index, 1, notification);
            setNotifications([...notifications]);
        }

        // Session (unread) notifications.
        if (!user) {
            return;
        }

        const {
            data: { notifications: unreadNotifications },
        } = await getNotifications(user.id, true);
        setSession({
            notifications: unreadNotifications,
        });
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

    function handleChangePage(event: unknown, newPage: number) {
        setPage(newPage);
    }

    function handleChangeItemsPerPage(event: React.ChangeEvent<HTMLInputElement>) {
        setItemsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    }

    function handleDialogClick(event: React.MouseEvent<HTMLDivElement>) {
        event.stopPropagation();
        event.preventDefault();
    }

    function handleRemoveDialogClose() {
        setIsRemoveDialogOpen(0);
    }

    function getRemoveDialogButtonClickHandler(id: number) {
        return (event: React.MouseEvent<HTMLButtonElement>) => {
            event.stopPropagation();
            event.preventDefault();
            setIsRemoveDialogOpen(id);
        };
    }

    function getItemClickHandler(id: number) {
        return async () => {
            await toggleNotificationRead(id, true);
        };
    }

    function getMarkAsReadClickHandler(id: number) {
        return async (event: React.MouseEvent<HTMLButtonElement>) => {
            event.stopPropagation();
            event.preventDefault();

            await toggleNotificationRead(id);
        };
    }

    function getRemoveDialogAcceptHandler(id: number) {
        return async () => {
            setIsRemoveDialogOpen(0);

            if (!notifications) {
                return;
            }

            try {
                const response = await deleteNotification(id);

                if (response?.data.success) {
                    setNotifications(
                        (notifications || []).filter((notification) => notification.id !== id),
                    );
                    showSnackbar({
                        message: t('notification_deleted'),
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

    const notificationId = Number(params.item);
    // console.log('params', params, notificationId);
    const selectedNotification =
        notifications &&
        !Number.isNaN(notificationId) &&
        notifications.find((notification) => notification.id === notificationId);

    return (
        <Paper className={classes.root} elevation={0} square>
            <Toolbar className={classes.toolbar} variant="regular">
                {(!isSearchActive || selectedNotification) && (
                    <Typography
                        id="notifications-list"
                        className={classes.title}
                        component="h2"
                        variant="h6"
                    >
                        {selectedNotification ? selectedNotification.title : t('notifications')}
                    </Typography>
                )}
                {notifications &&
                    !!notifications.length &&
                    !selectedNotification &&
                    isSearchActive && (
                        <InputBase
                            classes={{
                                root: classes.searchControlRoot,
                                input: classes.searchControlInput,
                            }}
                            placeholder={t('search_notifications')}
                            value={search}
                            onChange={handleSearchChange}
                            onKeyDown={handleSearchInputKeyDown}
                            autoFocus
                        />
                    )}
                <Box className={classes.buttons}>
                    {!selectedNotification && notifications && !!notifications.length && (
                        <Tooltip
                            title={isSearchActive ? t('close_search') : t('search_notifications')}
                            enterDelay={muiTheme.timing.tooltipEnterDelay}
                        >
                            <IconButton
                                className={classes.searchButton}
                                size="small"
                                edge="end"
                                color={isSearchActive ? 'secondary' : 'default'}
                                onClick={handleSearchToggle}
                            >
                                {isSearchActive ? <CloseIcon /> : <SearchIcon />}
                            </IconButton>
                        </Tooltip>
                    )}
                    {selectedNotification && (
                        <Tooltip
                            title={t('back_to_notifications')}
                            enterDelay={muiTheme.timing.tooltipEnterDelay}
                        >
                            <IconButton
                                component={RouterLink}
                                className={classes.searchButton}
                                size="small"
                                edge="end"
                                to="/profile/notifications"
                            >
                                <ArrowBackIcon />
                            </IconButton>
                        </Tooltip>
                    )}
                </Box>
            </Toolbar>
            <TableContainer>
                {selectedNotification && (
                    <div
                        className={classes.notificationContent}
                        // eslint-disable-next-line react/no-danger
                        dangerouslySetInnerHTML={{ __html: selectedNotification.content }}
                    />
                )}
                {!selectedNotification && (
                    <Table
                        className={classes.table}
                        component="div"
                        size="small"
                        aria-labelledby="notifications-list"
                    >
                        <TableHead component="div">
                            <TableRow component="div">
                                {headCells.map((headCell) => (
                                    <TableCell
                                        key={headCell.id}
                                        className={headCell.class}
                                        component="div"
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
                                                    !!notifications &&
                                                    !!notifications.length &&
                                                    orderBy === headCell.id
                                                }
                                                direction={
                                                    (!isLoading &&
                                                        (orderBy === headCell.id
                                                            ? order
                                                            : 'asc')) ||
                                                    undefined
                                                }
                                                onClick={createSortHandler(headCell.id)}
                                                disabled={
                                                    isLoading ||
                                                    !notifications ||
                                                    !notifications.length
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
                                <TableCell className={classes.colHeadActions} component="div" />
                            </TableRow>
                        </TableHead>
                        <TableBody component="div">
                            {pageNotifications &&
                                pageNotifications.map((notification) => {
                                    const searchTerm = search || '';
                                    return (
                                        <TableRow
                                            key={notification.id}
                                            className={clsx(classes.row, {
                                                [classes.rowRead]: notification.read,
                                            })}
                                            component={RouterLink}
                                            to={`/profile/notifications/${notification.id}`}
                                            onClick={getItemClickHandler(notification.id)}
                                            hover
                                        >
                                            <TableCell component="div" align="left">
                                                <Typography
                                                    className={classes.rowMainContent}
                                                    component="span"
                                                    variant="body2"
                                                    noWrap
                                                >
                                                    <Mark term={searchTerm}>
                                                        {notification.title}
                                                    </Mark>
                                                </Typography>
                                            </TableCell>
                                            {showTypeColumn && (
                                                <TableCell component="div" align="left">
                                                    <Typography
                                                        className={classes.rowMainContent}
                                                        component="span"
                                                        variant="body2"
                                                        noWrap
                                                    >
                                                        <Mark term={searchTerm}>
                                                            {notification.type}
                                                        </Mark>
                                                    </Typography>
                                                </TableCell>
                                            )}
                                            {showTimeColumn && (
                                                <TableCell component="div" align="left">
                                                    <Typography
                                                        className={classes.rowMainContent}
                                                        component="span"
                                                        variant="body2"
                                                        noWrap
                                                    >
                                                        <Mark term={searchTerm}>
                                                            {dateTimeFormatter.format(
                                                                new Date(notification.time),
                                                            )}
                                                        </Mark>
                                                    </Typography>
                                                </TableCell>
                                            )}
                                            <TableCell component="div" align="right">
                                                <Tooltip
                                                    title={t(
                                                        notification.read
                                                            ? 'mark_as_unread'
                                                            : 'mark_as_read',
                                                    )}
                                                    enterDelay={muiTheme.timing.tooltipEnterDelay}
                                                >
                                                    <IconButton
                                                        size="small"
                                                        aria-label={t(
                                                            notification.read
                                                                ? 'mark_as_unread'
                                                                : 'mark_as_read',
                                                        )}
                                                        onClick={getMarkAsReadClickHandler(
                                                            notification.id,
                                                        )}
                                                    >
                                                        {notification.read ? (
                                                            <DraftsIcon />
                                                        ) : (
                                                            <EmailIcon />
                                                        )}
                                                    </IconButton>
                                                </Tooltip>
                                                <Tooltip
                                                    title={t('delete_notification')}
                                                    enterDelay={muiTheme.timing.tooltipEnterDelay}
                                                >
                                                    <IconButton
                                                        edge="end"
                                                        size="small"
                                                        aria-label={t('delete_notification')}
                                                        onClick={getRemoveDialogButtonClickHandler(
                                                            notification.id,
                                                        )}
                                                    >
                                                        <DeleteIcon />
                                                    </IconButton>
                                                </Tooltip>
                                                <ConfirmationDialog
                                                    id="remove-data-source-dialog"
                                                    title={t('delete_notification')}
                                                    content={
                                                        <TransHtml
                                                            i18nKey="delete_notification_confirmation"
                                                            values={{
                                                                title: notification.title,
                                                            }}
                                                            tOptions={{
                                                                interpolation: {
                                                                    escapeValue: false,
                                                                },
                                                            }}
                                                        />
                                                    }
                                                    open={isRemoveDialogOpen === notification.id}
                                                    onClick={handleDialogClick}
                                                    onClose={handleRemoveDialogClose}
                                                    onAccept={getRemoveDialogAcceptHandler(
                                                        notification.id,
                                                    )}
                                                    onDecline={handleRemoveDialogClose}
                                                />
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
                            {isLoading &&
                                (!notifications || !notifications.length) &&
                                Array.from(Array(rowsPerPage)).map((e, i) => (
                                    <TableRow component="div" key={`row-${i + 1}`}>
                                        <TableCell component="div">
                                            <Typography variant="body2">
                                                <Skeleton />
                                            </Typography>
                                        </TableCell>
                                        {showTypeColumn && (
                                            <TableCell component="div">
                                                <Typography variant="body2">
                                                    <Skeleton />
                                                </Typography>
                                            </TableCell>
                                        )}
                                        {showTimeColumn && (
                                            <TableCell component="div">
                                                <Typography variant="body2">
                                                    <Skeleton />
                                                </Typography>
                                            </TableCell>
                                        )}
                                        <TableCell component="div">
                                            <Skeleton variant="rect" height={30} />
                                        </TableCell>
                                    </TableRow>
                                ))}
                            {!isLoading && emptyRows > 0 && (
                                <TableRow component="div" style={{ height: 43 * emptyRows }}>
                                    {[
                                        ...new Array(
                                            2 + Number(!!showTypeColumn) + Number(!!showTimeColumn),
                                        ),
                                    ].map(() => (
                                        <TableCell
                                            component="div"
                                            colSpan={
                                                2 +
                                                Number(!!showTypeColumn) +
                                                Number(!!showTimeColumn)
                                            }
                                        />
                                    ))}
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                )}
            </TableContainer>
            {!selectedNotification && (
                <Grid
                    className={classes.footerGrid}
                    justify="space-between"
                    alignItems="center"
                    container
                >
                    <Grid item className={classes.paginationGridItem}>
                        <TablePagination
                            className={classes.pagination}
                            rowsPerPageOptions={isScreenWidthGteSm ? [5, 10, 25] : [5]}
                            component="div"
                            count={Number(filteredNotifications && filteredNotifications.length)}
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
                                          (count > 0 ||
                                          Number(notifications && notifications.length)
                                              ? 'from_to_of'
                                              : 'n_notifications') as Parameters<typeof t>[0],
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
            )}
        </Paper>
    );
}

export default UserProfileNotifications;
