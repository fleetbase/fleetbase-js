/**
 * Determines if environment SDK is initialized in is Node, additionally checks pass if environment is ReactNative.
 *
 * @returns boolean
 */
const isNodeEnvironment = () => {
    return (
        typeof process !== 'undefined' &&
        (typeof process?.env === 'object' || process.release?.name?.search(/node|io.js/) !== -1) &&
        (typeof window === 'undefined' || window?.navigator?.product === 'ReactNative')
    );
};

export default isNodeEnvironment;
