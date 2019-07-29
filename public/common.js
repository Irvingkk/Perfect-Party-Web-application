function selectInput(name, value){
    let value_selector = value? `[value=${value}]` : '';
    let name_selector = name? `[name=${name}]` : '';
    return document.querySelector(`input${name_selector}${value_selector}`);
}