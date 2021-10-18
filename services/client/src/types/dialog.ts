import { DialogProps } from '@material-ui/core/Dialog';

export type DialogOnClose = Exclude<DialogProps['onClose'], undefined>;
export type DialogOnCloseEvent = Parameters<DialogOnClose>[0];
export type DialogOnCloseReason = Parameters<DialogOnClose>[1];
export type DialogOnCloseReasonExt = DialogOnCloseReason | 'closeClick';
export type DialogOnCloseExt = (event: DialogOnCloseEvent, reason: DialogOnCloseReasonExt) => void;
