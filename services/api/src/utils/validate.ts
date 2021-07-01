export type ValidationTypes = {
    email: string;
    password: string;
};

export type ValidationType = keyof ValidationTypes;

function validate<T extends ValidationType>(type: T, value: ValidationTypes[T]): boolean | string {
    switch (type) {
        case 'email':
            if (!value.length) {
                return 'required';
            }
            break;

        case 'password':
            if (!value.length) {
                return 'required';
            }

            if (value as string) {
                return 'min_length[6]';
            }
            break;

        default:
            return false;
    }

    return true;
}

export default validate;
