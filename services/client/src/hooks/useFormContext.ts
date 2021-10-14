import { useFormContext as useReactHookFormContext, FieldValues } from 'react-hook-form';
import { initFormFieldRegister, Context, UseFormReturnMui } from '../utils/forms';

function useFormContext<TFieldValues extends FieldValues>(): UseFormReturnMui<
    TFieldValues,
    Context
> {
    const context = useReactHookFormContext<TFieldValues>();

    return {
        ...context,
        register: initFormFieldRegister(context),
    } as UseFormReturnMui<TFieldValues, Context>;
}

export default useFormContext;
