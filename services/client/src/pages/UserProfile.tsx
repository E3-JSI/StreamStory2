import React, { ChangeEvent, useState } from 'react';

import { Link as RouterLink, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Paper from '@material-ui/core/Paper';
import Tabs from '@material-ui/core/Tabs';
import DeleteForeverIcon from '@material-ui/icons/DeleteForever';
import InfoIcon from '@material-ui/icons/Info';
import LockIcon from '@material-ui/icons/Lock';
import NotificationsIcon from '@material-ui/icons/Notifications';
import SettingsIcon from '@material-ui/icons/Settings';
import StorageIcon from '@material-ui/icons/Storage';
import VpnKeyIcon from '@material-ui/icons/VpnKey';

import useSession from '../hooks/useSession';
import PageTitle from '../components/PageTitle';
import Tab from '../components/Tab';
import TabPanel, { getTabA11yProps } from '../components/TabPanel';
import UserProfileApiKeys from '../components/UserProfileApiKeys';
import UserProfileChangePasswordForm from '../components/UserProfileChangePasswordForm';
import UserProfileDataSources from '../components/UserProfileDataSources';
import UserProfileDeleteAccountForm from '../components/UserProfileDeleteAccountForm';
import UserProfileDetailsForm from '../components/UserProfileDetailsForm';
import UserProfileNotifications from '../components/UserProfileNotifications';
import UserProfileSettingsForm from '../components/UserProfileSettingsForm';

import useStyles from './UserProfile.styles';

export enum UserProfilePath {
    Details = 'details',
    Settings = 'settings',
    Notifications = 'notifications',
    DataSources = 'data-sources',
    ApiKeys = 'api-keys',
    ChangePassword = 'change-password',
    DeleteAccount = 'delete-account',
}

export interface UserProfileUrlParams {
    tab?: string;
    item?: string;
}

const basePath = '/profile';

function UserProfile(): JSX.Element {
    const classes = useStyles();
    const { t } = useTranslation();
    const params = useParams<UserProfileUrlParams>();
    const [session] = useSession();
    const [tabValue, setTabValue] = useState(params.tab || UserProfilePath.Details);

    const profileTabPrefix = 'profile';

    function handleTabChange(event: ChangeEvent<Record<string, never>>, newValue: string) {
        setTabValue(newValue);
    }

    return (
        <>
            <PageTitle gutterBottom>{t('my_profile')}</PageTitle>

            <Paper className={classes.tabsPaper} square>
                <Tabs
                    value={tabValue}
                    variant="scrollable"
                    scrollButtons="auto"
                    indicatorColor="primary"
                    textColor="primary"
                    onChange={handleTabChange}
                    aria-label={t('my_profile')}
                    // centered
                >
                    <Tab
                        component={RouterLink}
                        to={`${basePath}/${UserProfilePath.Details}`}
                        value={UserProfilePath.Details}
                        label={t('details')}
                        icon={<InfoIcon fontSize="small" />}
                        {...getTabA11yProps(UserProfilePath.Details, profileTabPrefix)}
                    />
                    <Tab
                        component={RouterLink}
                        to={`${basePath}/${UserProfilePath.Settings}`}
                        value={UserProfilePath.Settings}
                        label={t('settings')}
                        icon={<SettingsIcon fontSize="small" />}
                        {...getTabA11yProps(UserProfilePath.Settings, profileTabPrefix)}
                    />
                    <Tab
                        component={RouterLink}
                        to={`${basePath}/${UserProfilePath.Notifications}`}
                        value={UserProfilePath.Notifications}
                        label={t('notifications')}
                        icon={<NotificationsIcon fontSize="small" />}
                        {...getTabA11yProps(UserProfilePath.Notifications, profileTabPrefix)}
                    />
                    <Tab
                        component={RouterLink}
                        to={`${basePath}/${UserProfilePath.DataSources}`}
                        value={UserProfilePath.DataSources}
                        label={t('data_sources')}
                        icon={<StorageIcon fontSize="small" />}
                        {...getTabA11yProps(UserProfilePath.DataSources, profileTabPrefix)}
                    />
                    <Tab
                        component={RouterLink}
                        to={`${basePath}/${UserProfilePath.ApiKeys}`}
                        value={UserProfilePath.ApiKeys}
                        label={t('api_keys')}
                        icon={<VpnKeyIcon fontSize="small" />}
                        {...getTabA11yProps(UserProfilePath.ApiKeys, profileTabPrefix)}
                    />
                    {session.user?.active && (
                        <Tab
                            component={RouterLink}
                            to={`${basePath}/${UserProfilePath.ChangePassword}`}
                            value={UserProfilePath.ChangePassword}
                            label={t('change_password')}
                            icon={<LockIcon fontSize="small" />}
                            {...getTabA11yProps(UserProfilePath.ChangePassword, profileTabPrefix)}
                        />
                    )}
                    <Tab
                        component={RouterLink}
                        to={`${basePath}/${UserProfilePath.DeleteAccount}`}
                        value={UserProfilePath.DeleteAccount}
                        label={t('delete_account')}
                        icon={<DeleteForeverIcon fontSize="small" />}
                        {...getTabA11yProps(UserProfilePath.DeleteAccount, profileTabPrefix)}
                    />
                </Tabs>
            </Paper>
            <TabPanel value={tabValue} index={UserProfilePath.Details} prefix={profileTabPrefix}>
                <UserProfileDetailsForm />
            </TabPanel>
            <TabPanel value={tabValue} index={UserProfilePath.Settings} prefix={profileTabPrefix}>
                <UserProfileSettingsForm />
            </TabPanel>
            <TabPanel
                value={tabValue}
                index={UserProfilePath.Notifications}
                prefix={profileTabPrefix}
            >
                <UserProfileNotifications />
            </TabPanel>
            <TabPanel
                value={tabValue}
                index={UserProfilePath.DataSources}
                prefix={profileTabPrefix}
            >
                <UserProfileDataSources />
            </TabPanel>
            <TabPanel value={tabValue} index={UserProfilePath.ApiKeys} prefix={profileTabPrefix}>
                <UserProfileApiKeys />
            </TabPanel>
            {session.user?.active && (
                <TabPanel
                    value={tabValue}
                    index={UserProfilePath.ChangePassword}
                    prefix={profileTabPrefix}
                >
                    <UserProfileChangePasswordForm />
                </TabPanel>
            )}
            <TabPanel
                value={tabValue}
                index={UserProfilePath.DeleteAccount}
                prefix={profileTabPrefix}
            >
                <UserProfileDeleteAccountForm />
            </TabPanel>
        </>
    );
}

export default UserProfile;
