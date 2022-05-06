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
import UserProfileChangePasswordForm from '../components/UserProfileChangePasswordForm';
import UserProfileDataSources from '../components/UserProfileDataSources';
import UserProfileDeleteAccountForm from '../components/UserProfileDeleteAccountForm';
import UserProfileDetailsForm from '../components/UserProfileDetailsForm';
import UserProfileSettingsForm from '../components/UserProfileSettingsForm';

import useStyles from './UserProfile.styles';
import UserProfileApiKeys from '../components/UserProfileApiKeys';

export interface UserProfileUrlParams {
    tab?: string;
}

const basePath = '/profile';
const tabPaths = {
    details: 'details',
    settings: 'settings',
    notifications: 'notifications',
    dataSources: 'data-sources',
    apiKeys: 'api-keys',
    changePassword: 'change-password',
    deleteAccount: 'delete-account',
};

function UserProfile(): JSX.Element {
    const classes = useStyles();
    const { t } = useTranslation();
    const params = useParams<UserProfileUrlParams>();
    const [session] = useSession();
    const [tabValue, setTabValue] = useState(params.tab || tabPaths.details);

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
                        to={`${basePath}/${tabPaths.details}`}
                        value={tabPaths.details}
                        label={t('details')}
                        icon={<InfoIcon fontSize="small" />}
                        {...getTabA11yProps(tabPaths.details, profileTabPrefix)}
                    />
                    <Tab
                        component={RouterLink}
                        to={`${basePath}/${tabPaths.settings}`}
                        value={tabPaths.settings}
                        label={t('settings')}
                        icon={<SettingsIcon fontSize="small" />}
                        {...getTabA11yProps(tabPaths.settings, profileTabPrefix)}
                    />
                    <Tab
                        component={RouterLink}
                        to={`${basePath}/${tabPaths.notifications}`}
                        value={tabPaths.notifications}
                        label={t('notifications')}
                        icon={<NotificationsIcon fontSize="small" />}
                        {...getTabA11yProps(tabPaths.notifications, profileTabPrefix)}
                    />
                    <Tab
                        component={RouterLink}
                        to={`${basePath}/${tabPaths.dataSources}`}
                        value={tabPaths.dataSources}
                        label={t('data_sources')}
                        icon={<StorageIcon fontSize="small" />}
                        {...getTabA11yProps(tabPaths.dataSources, profileTabPrefix)}
                    />
                    <Tab
                        component={RouterLink}
                        to={`${basePath}/${tabPaths.apiKeys}`}
                        value={tabPaths.apiKeys}
                        label={t('api_keys')}
                        icon={<VpnKeyIcon fontSize="small" />}
                        {...getTabA11yProps(tabPaths.apiKeys, profileTabPrefix)}
                    />
                    {session.user?.active && (
                        <Tab
                            component={RouterLink}
                            to={`${basePath}/${tabPaths.changePassword}`}
                            value={tabPaths.changePassword}
                            label={t('change_password')}
                            icon={<LockIcon fontSize="small" />}
                            {...getTabA11yProps(tabPaths.changePassword, profileTabPrefix)}
                        />
                    )}
                    <Tab
                        component={RouterLink}
                        to={`${basePath}/${tabPaths.deleteAccount}`}
                        value={tabPaths.deleteAccount}
                        label={t('delete_account')}
                        icon={<DeleteForeverIcon fontSize="small" />}
                        {...getTabA11yProps(tabPaths.deleteAccount, profileTabPrefix)}
                    />
                </Tabs>
            </Paper>
            <TabPanel value={tabValue} index={tabPaths.details} prefix={profileTabPrefix}>
                <UserProfileDetailsForm />
            </TabPanel>
            <TabPanel value={tabValue} index={tabPaths.settings} prefix={profileTabPrefix}>
                <UserProfileSettingsForm />
            </TabPanel>
            <TabPanel value={tabValue} index={tabPaths.notifications} prefix={profileTabPrefix}>
                {/* <UserProfileSettingsForm /> */}
                <div>Notifications</div>
            </TabPanel>
            <TabPanel value={tabValue} index={tabPaths.dataSources} prefix={profileTabPrefix}>
                <UserProfileDataSources />
            </TabPanel>
            <TabPanel value={tabValue} index={tabPaths.apiKeys} prefix={profileTabPrefix}>
                <UserProfileApiKeys />
            </TabPanel>
            {session.user?.active && (
                <TabPanel value={tabValue} index={tabPaths.changePassword} prefix={profileTabPrefix}>
                    <UserProfileChangePasswordForm />
                </TabPanel>
            )}
            <TabPanel value={tabValue} index={tabPaths.deleteAccount} prefix={profileTabPrefix}>
                <UserProfileDeleteAccountForm />
            </TabPanel>
        </>
    );
}

export default UserProfile;
