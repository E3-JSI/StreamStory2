export interface Patterns {
    [id: string]: RegExp;
}

export const minPasswordLength = 6;

export const patterns: Patterns = {
    userToken: /^[A-Za-z0-9]{64}$/,
    emailLoose: /^.+@.+$/,
    emailStrict: /^[a-zA-Z0-9.!#$%&’*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/
};
