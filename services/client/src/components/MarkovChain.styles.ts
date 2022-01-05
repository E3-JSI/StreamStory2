import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';

const useStyles = makeStyles((theme: Theme) => {

    console.log("start: useStyles")

    return createStyles({
        statePulse: {
            borderRadius: '50%',
            filter: 'drop-shadow(0px 1px 1px #0000001a)',
            animationName: '$pulse',
            animationDuration: '1.25s',
            animationIterationCount: 'infinite',
            animationTimingFunction: 'bezier(0.215, 0.61, 0.355, 1)',
        },
        '@keyframes pulse': {
            '0%': {
                filter: 'drop-shadow(0 0 0 rgba(1,164,233, 1))',
            },
            '100%': {
                filter: 'drop-shadow(0 0 3em rgba(0,0,0, 0))',
            }
        },
    });
});


export default useStyles;
