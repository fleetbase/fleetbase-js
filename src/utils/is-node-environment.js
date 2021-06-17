const isNodeEnvironment = () => {
    return (typeof process !== 'undefined') && (process.release.name.search(/node|io.js/) !== -1) && (typeof window === 'undefined');
};

export default isNodeEnvironment;