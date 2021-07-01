export type OmitRequiredProps<T> = Pick<
    T,
    {
        [K in keyof T]: T extends Record<K, T[K]> ? never : K;
    }[keyof T]
>;

export type OmitOptionalProps<T> = Pick<
    T,
    {
        [K in keyof T]: T extends Record<K, T[K]> ? K : never;
    }[keyof T]
>;

export type AllowUndefinedProps<T> = {
    [K in keyof T]: T[K] | undefined;
};
