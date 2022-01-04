import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';

const useStyles = makeStyles((theme: Theme) => {

    console.log("start: useStyles")

    return createStyles({
        statePulse: {
            margin: '100px',
            display: 'block',
            width: '22px',
            height: '22px',
            borderRadius: '50%',
            background: '#cca92c',
            cursor: 'pointer',
            boxShadow: '0 0 0 rgba(204, 169, 44, 0.4)',
            animation: '$pulse 2s infinite',
        },
        '@-webkit-keyframes pulse': {
            '0%': {
                '-webkit-box-shadow': '0 0 0 0 rgba(204, 169, 44, 0.4)',
            },
            '70%': {
                '-webkit-box-shadow': '0 0 0 10px rgba(204,169,44, 0)',
            },
            '100%': {
                '-webkit-box-shadow': '0 0 0 0 rgba(204, 169, 44, 0)',
            }
        },
        '@keyframes pulse': {
            '0%': {
                '-moz-box-shadow': '0 0 0 0 rgba(204,169,44, 0.4)',
                'box-shadow': '0 0 0 0 rgba(204,169,44, 0.4)',
            },
            '70%': {
                '-moz-box-shadow': '0 0 0 10px rgba(204,169,44, 0)',
                'box-shadow': '0 0 0 10px rgba(204,169,44, 0)',
            },
            '100%': {
                '-moz-box-shadow': '0 0 0 0 rgba(204,169,44, 0)',
                'box-shadow': '0 0 0 0 rgba(204,169,44, 0)'
            }
        }
    });
});


export default useStyles;
