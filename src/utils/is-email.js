export function isEmail(email = '') {
    return /\S+@\S+\.\S+/.test(email);
}

export default isEmail;
