import { useForm as useReactHookForm, FieldValues, UseFormProps } from 'react-hook-form';
import { initFormFieldRegister, Context, UseFormReturnMui } from '../utils/forms';

function useForm<TFieldValues extends FieldValues>(
    props?: UseFormProps<TFieldValues>,
): UseFormReturnMui<TFieldValues, Context> {
    const context = useReactHookForm(props);

    return {
        ...context,
        register: initFormFieldRegister(context),
    } as UseFormReturnMui<TFieldValues, Context>;
}

export default useForm;
