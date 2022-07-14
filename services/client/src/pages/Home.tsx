/* eslint-disable jsx-a11y/media-has-caption */
import React, { useState } from 'react';

import clsx from 'clsx';
import { useTranslation } from 'react-i18next';
import { Link as RouterLink } from 'react-router-dom';
import Avatar from '@material-ui/core/Avatar';
import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';
import Card from '@material-ui/core/Card';
// import CardActionArea from '@material-ui/core/CardActionArea';
import CardContent from '@material-ui/core/CardContent';
// import CardMedia from '@material-ui/core/CardMedia';
import Container from '@material-ui/core/Container';
import Dialog from '@material-ui/core/Dialog';
import Grid from '@material-ui/core/Grid';
import Link from '@material-ui/core/Link';
import ListItem from '@material-ui/core/ListItem';
import ListItemAvatar from '@material-ui/core/ListItemAvatar';
import ListItemText from '@material-ui/core/ListItemText';
import Typography from '@material-ui/core/Typography';

import Logo from '../components/Logo';
import PageTitle from '../components/PageTitle';
import Section from '../components/Section';
import SectionDescription from '../components/SectionDescription';
import SectionName from '../components/SectionName';
import SectionTitle from '../components/SectionTitle';
import Footer from '../components/Footer';

import config from '../config';
import useStyles from './Home.styles';
import { ReactComponent as DetectiveIcon } from '../assets/images/icons/detective.svg';
import { ReactComponent as FreeButterflyIcon } from '../assets/images/icons/free-butterfly.svg';
import { ReactComponent as MonitorIcon } from '../assets/images/icons/monitor.svg';
import { ReactComponent as PyramidIcon } from '../assets/images/icons/pyramid.svg';
import TransHtml from '../components/TransHtml';

function Home(): JSX.Element {
    const classes = useStyles();
    const { t } = useTranslation();
    const [isVideoDialogOpen, setIsVideoDialogOpen] = useState(false);

    function handleWatchVideoButtonClick(event: React.MouseEvent) {
        event.preventDefault();
        setIsVideoDialogOpen(true);
    }

    function handleVideoDialogClose() {
        setIsVideoDialogOpen(false);
    }

    return (
        <>
            <Section className={classes.bannerSection}>
                <Container maxWidth="lg">
                    <Grid className={classes.bannerGrid} spacing={4} container>
                        <Grid xs={12} md={6} item>
                            <PageTitle variant="h1" className={classes.pageTitle}>
                                <Logo />
                            </PageTitle>
                            <SectionDescription className={classes.pageSubtitle}>
                                {t('site_subtitle')}
                            </SectionDescription>
                            <Grid
                                spacing={2}
                                justify="center"
                                className={clsx(classes.buttons, classes.bannerButtons)}
                                container
                            >
                                <Grid xs={12} sm="auto" item>
                                    <Button
                                        component={RouterLink}
                                        to="/dashboard/offline-models"
                                        variant="contained"
                                        size="large"
                                        color="primary"
                                    >
                                        {t('go_to_dashboard')}
                                    </Button>
                                </Grid>
                                <Grid xs={12} sm="auto" item>
                                    <Button
                                        variant="outlined"
                                        size="large"
                                        color="primary"
                                        onClick={handleWatchVideoButtonClick}
                                    >
                                        {t('watch_video_presentation')}
                                    </Button>
                                </Grid>
                            </Grid>
                            <Dialog
                                open={isVideoDialogOpen}
                                onClose={handleVideoDialogClose}
                                aria-labelledby="video-dialog-title"
                                PaperProps={{ square: true }}
                                maxWidth={false}
                            >
                                <video width="1920" className={classes.video} controls>
                                    <source src="/video/streamstory.mp4" type="video/mp4" />
                                    {t('browser_does_not_support_embeded_videos')}
                                </video>
                            </Dialog>
                        </Grid>
                        <Grid xs={12} md={6} item>
                            <Card
                                variant="elevation"
                                className={classes.screenFrame}
                                elevation={16}
                            >
                                <CardContent>
                                    <img
                                        src="https://via.placeholder.com/1024x768.png"
                                        alt="Streamstory screenshot"
                                    />
                                </CardContent>
                            </Card>
                        </Grid>
                    </Grid>
                </Container>
                <Box bottom="0" left="0" width="100%" clone>
                    <svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" viewBox="0 0 1920 272">
                        <polygon points="0,272 1920,272 1920,0 " />
                    </svg>
                </Box>
            </Section>
            <Section bgColor="secondary" className={classes.featuresSection}>
                <Container maxWidth="lg">
                    <SectionName gutterBottom>{t('content.home.features_name')}</SectionName>
                    <SectionTitle gutterBottom>{t('content.home.features_title')}</SectionTitle>
                    <SectionDescription>
                        {t('content.home.features_description')}
                    </SectionDescription>
                </Container>
                <Container maxWidth="lg">
                    <Grid className={classes.features} spacing={4} justify="space-around" container>
                        <ListItem
                            component={Grid}
                            xs={12}
                            sm={6}
                            alignItems="flex-start"
                            className={classes.feature}
                            item
                        >
                            <ListItemAvatar className={classes.featureAvatarItem}>
                                <Avatar
                                    alt="Exploratory data mining"
                                    className={classes.featureAvatar}
                                >
                                    <DetectiveIcon />
                                </Avatar>
                            </ListItemAvatar>
                            <ListItemText>
                                <Typography component="h3" variant="h6" gutterBottom>
                                    {t('content.home.exploratory_data_mining')}
                                </Typography>
                                <Typography variant="body1">
                                    {t('content.home.exploratory_data_mining_description')}
                                </Typography>
                            </ListItemText>
                        </ListItem>
                        <ListItem
                            component={Grid}
                            xs={12}
                            sm={6}
                            alignItems="flex-start"
                            className={classes.feature}
                            item
                        >
                            <ListItemAvatar className={classes.featureAvatarItem}>
                                <Avatar
                                    alt="Multi-scale representation"
                                    className={classes.featureAvatar}
                                >
                                    <PyramidIcon />
                                </Avatar>
                            </ListItemAvatar>
                            <ListItemText>
                                <Typography component="h3" variant="h6" gutterBottom>
                                    {t('content.home.multi_scale_representation')}
                                </Typography>
                                <Typography variant="body1">
                                    {t('content.home.multi_scale_representation_description')}
                                </Typography>
                            </ListItemText>
                        </ListItem>
                        <ListItem
                            component={Grid}
                            xs={12}
                            sm={6}
                            alignItems="flex-start"
                            className={classes.feature}
                            item
                        >
                            <ListItemAvatar className={classes.featureAvatarItem}>
                                <Avatar
                                    alt="Real-time monitoring"
                                    className={classes.featureAvatar}
                                >
                                    <MonitorIcon />
                                </Avatar>
                            </ListItemAvatar>
                            <ListItemText>
                                <Typography component="h3" variant="h6" gutterBottom>
                                    {t('content.home.real_time_monitoring')}
                                </Typography>
                                <Typography variant="body1">
                                    {t('content.home.real_time_monitoring_description')}
                                </Typography>
                            </ListItemText>
                        </ListItem>
                        <ListItem
                            component={Grid}
                            xs={12}
                            sm={6}
                            alignItems="flex-start"
                            className={classes.feature}
                            item
                        >
                            <ListItemAvatar className={classes.featureAvatarItem}>
                                <Avatar alt="Free" className={classes.featureAvatar}>
                                    <FreeButterflyIcon />
                                </Avatar>
                            </ListItemAvatar>
                            <ListItemText>
                                <Typography component="h3" variant="h6" gutterBottom>
                                    {t('content.home.free')}
                                </Typography>
                                <Typography variant="body1">
                                    <TransHtml
                                        i18nKey="content.home.free_description"
                                        components={{
                                            a1: <Link component={RouterLink} to="/login" />,
                                            a2: (
                                                <Link
                                                    href="/video/streamstory.mp4"
                                                    onClick={handleWatchVideoButtonClick}
                                                />
                                            ),
                                            a3: <Link href="/data/weather.csv" />,
                                        }}
                                    />
                                </Typography>
                            </ListItemText>
                        </ListItem>
                    </Grid>
                </Container>
            </Section>
            {/* <Section className={classes.examplesSection}>
                <Container maxWidth="lg">
                    <SectionName gutterBottom>Examples</SectionName>
                    <SectionTitle gutterBottom>
                        Embed interactive models on your web page
                    </SectionTitle>
                    <SectionDescription>
                        The embed API lets you place interactive public models on your web page with
                        a simple HTTP request.
                    </SectionDescription>
                    <Grid spacing={2} className={classes.examples} container>
                        <Grid xs={12} md={4} item>
                            <Card elevation={4} className={classes.example}>
                                <CardActionArea component={RouterLink} to="/examples/weather">
                                    <CardMedia
                                        component="img"
                                        src="https://via.placeholder.com/640x360.png"
                                        alt="Weather"
                                    />
                                    <CardContent>
                                        <Typography component="h3" variant="h6">
                                            Weather
                                        </Typography>
                                        <Typography variant="body1">
                                            Lorem, ipsum dolor sit amet consectetur adipisicing
                                            elit. Voluptatibus, sed?
                                        </Typography>
                                    </CardContent>
                                </CardActionArea>
                            </Card>
                        </Grid>
                        <Grid xs={12} md={4} item>
                            <Card elevation={4} className={classes.example}>
                                <CardActionArea component={RouterLink} to="/examples/gps">
                                    <CardMedia
                                        component="img"
                                        src="https://via.placeholder.com/640x360.png"
                                        alt="GPS"
                                    />
                                    <CardContent>
                                        <Typography component="h3" variant="h6">
                                            GPS
                                        </Typography>
                                        <Typography variant="body1">
                                            Lorem ipsum dolor sit amet, consectetur.
                                        </Typography>
                                    </CardContent>
                                </CardActionArea>
                            </Card>
                        </Grid>
                        <Grid xs={12} md={4} item>
                            <Card elevation={4} className={classes.example}>
                                <CardActionArea component={RouterLink} to="/examples/traffic">
                                    <CardMedia
                                        component="img"
                                        src="https://via.placeholder.com/640x360.png"
                                        alt="Traffic"
                                    />
                                    <CardContent>
                                        <Typography component="h3" variant="h6">
                                            Traffic
                                        </Typography>
                                        <Typography variant="body1">
                                            Lorem ipsum dolor sit amet consectetur adipisicing elit.
                                            Placeat iste cumque quasi veniam voluptatum pariatur.
                                        </Typography>
                                    </CardContent>
                                </CardActionArea>
                            </Card>
                        </Grid>
                    </Grid>
                    <Grid spacing={2} justify="center" className={classes.buttons} container>
                        <Grid xs={12} sm="auto" item>
                            <Button
                                component={RouterLink}
                                to="/examples"
                                variant="outlined"
                                size="large"
                                color="primary"
                            >
                                {t('find_more_examples')}
                            </Button>
                        </Grid>
                    </Grid>
                </Container>
            </Section> */}
            <Section className={classes.contactSection}>
                <Container maxWidth="lg">
                    <SectionName gutterBottom>{t('content.home.contact_name')}</SectionName>
                    <SectionTitle gutterBottom>{t('content.home.contact_title')}</SectionTitle>
                    <SectionDescription>{t('content.home.contact_description')}</SectionDescription>
                    <Grid spacing={2} justify="center" className={classes.buttons} container>
                        <Grid xs={12} sm="auto" item>
                            <Button
                                component="a"
                                href={`mailto:${config.email}`}
                                target="_blank"
                                variant="contained"
                                size="large"
                                color="primary"
                            >
                                {t('send_email')}
                            </Button>
                        </Grid>
                    </Grid>
                </Container>
            </Section>
            <Footer />
        </>
    );
}

export default Home;
