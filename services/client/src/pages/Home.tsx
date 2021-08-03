/* eslint-disable jsx-a11y/media-has-caption */
import React, { useState } from 'react';

import clsx from 'clsx';
import { useTranslation } from 'react-i18next';
import { Link as RouterLink } from 'react-router-dom';
import Avatar from '@material-ui/core/Avatar';
import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';
import Card from '@material-ui/core/Card';
import CardActionArea from '@material-ui/core/CardActionArea';
import CardContent from '@material-ui/core/CardContent';
import CardMedia from '@material-ui/core/CardMedia';
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

import useStyles from './Home.styles';
import { ReactComponent as DetectiveIcon } from '../assets/images/icons/detective.svg';
import { ReactComponent as FreeButterflyIcon } from '../assets/images/icons/free-butterfly.svg';
import { ReactComponent as MonitorIcon } from '../assets/images/icons/monitor.svg';
import { ReactComponent as PyramidIcon } from '../assets/images/icons/pyramid.svg';

function Home(): JSX.Element {
    const classes = useStyles();
    const { t } = useTranslation(['common']);
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
                                Making a story of streaming data
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
                                        {t('common:go_to_dashboard')}
                                    </Button>
                                </Grid>
                                <Grid xs={12} sm="auto" item>
                                    <Button
                                        variant="outlined"
                                        size="large"
                                        color="primary"
                                        onClick={handleWatchVideoButtonClick}
                                    >
                                        {t('common:watch_video_presentation')}
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
                                    <source
                                        src="http://streamstory.ijs.si/material/streamstory.mp4"
                                        type="video/mp4"
                                    />
                                    Your browser does not support embedded videos.
                                </video>
                            </Dialog>
                        </Grid>
                        <Grid xs={12} md={6} item>
                            <Card variant="outlined" className={classes.screenFrame} elevation={15}>
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
                    <SectionName gutterBottom>Features</SectionName>
                    <SectionTitle gutterBottom>
                        A qulitative multi-scale data analysis tool
                    </SectionTitle>
                    <SectionDescription>
                        StreamStory is a multi-scale data analysis tool for multivariate
                        continuously time-varying data streams. It represents the data streams in a
                        qualitative manner using states and transitions. Users can upload their own
                        dataset or use one of the pre-loaded datasets. StreamStory can also be used
                        as a monitoring tool, showing in real-time the state of the monitored
                        process, activity and anomaly detection.
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
                                    Exploratory data mining
                                </Typography>
                                <Typography variant="body1">
                                    A system for the analysis of multivariate time series. It
                                    computes and visualizes a hierarchical Markov chain model which
                                    captures the qualitative behavior of the systems’ dynamics.
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
                                    Multi-scale representation
                                </Typography>
                                <Typography variant="body1">
                                    The hierarchical model allows users to interactively find
                                    suitable scales for interpreting the data.
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
                                    Real-time monitoring
                                </Typography>
                                <Typography variant="body1">
                                    Visualizes streaming data by mapping it to the hierarchical
                                    model. It can provide predictions and alarms for different
                                    behavior.
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
                                    Free
                                </Typography>
                                <Typography variant="body1">
                                    <Link component={RouterLink} to="/login">
                                        Log in
                                    </Link>
                                    {' '}
                                    and get started. Check out our
                                    {' '}
                                    <Link
                                        href="http://streamstory.ijs.si/material/streamstory.mp4"
                                        onClick={handleWatchVideoButtonClick}
                                    >
                                        video presentation
                                    </Link>
                                    {' '}
                                    to see how its done and experiment with our
                                    {' '}
                                    <Link href="http://streamstory.ijs.si/material/weather.csv">
                                        example dataset
                                    </Link>
                                    .
                                </Typography>
                            </ListItemText>
                        </ListItem>
                    </Grid>
                </Container>
            </Section>
            <Section className={classes.examplesSection}>
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
                            <Card className={classes.example}>
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
                            <Card className={classes.example}>
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
                            <Card className={classes.example}>
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
                                {t('common:find_more_examples')}
                            </Button>
                        </Grid>
                    </Grid>
                </Container>
            </Section>
            <Section bgColor="secondary" className={classes.contactSection}>
                <Container maxWidth="lg">
                    <SectionName gutterBottom>Contact</SectionName>
                    <SectionTitle gutterBottom>Get in touch</SectionTitle>
                    <SectionDescription>
                        We love feedback. Contact us and we&apos;ll get back to you as soon as
                        possible.
                    </SectionDescription>
                    <Grid spacing={2} justify="center" className={classes.buttons} container>
                        <Grid xs={12} sm="auto" item>
                            <Button
                                component="a"
                                href="mailto:streamstory@ijs.si"
                                target="_blank"
                                variant="contained"
                                size="large"
                                color="primary"
                            >
                                {t('common:send_email')}
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
