import { useContext } from 'react';

import SnackbarContext, {
    defaultProps,
    SnackbarProps,
    ShowSnackbar,
    HideSnackbar
} from '../contexts/SnackbarContext';

function useSnackbar(): [ShowSnackbar, HideSnackbar] {
    const { show, hide } = useContext(SnackbarContext);

    function showSnackbar(props: SnackbarProps) {
        if (show !== null) {
            show({
                ...defaultProps,
                ...props
            });
        }
    }

    function hideSnackbar() {
        if (hide !== null) {
            hide();
        }
    }

    return [showSnackbar, hideSnackbar];
}

export default useSnackbar;
