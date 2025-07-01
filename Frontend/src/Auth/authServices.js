export const clear_localestorage = ()=>{
    localStorage.clear();
}

export const get_from_localestorage = (key)=>{
    return localStorage.getItem(key);
}

export const is_active = () => {
    return get_from_localestorage('User');
}