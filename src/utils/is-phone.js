const isPhone = (phone = '') => {
    return /^[+]?[\s./0-9]*[(]?[0-9]{1,4}[)]?[-\s./0-9]*$/g.test(phone);
};

export default isPhone;
