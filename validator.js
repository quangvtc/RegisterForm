function validator(option) {
    var selectorRules = {}
    function getParent(element,selector){
        while(element.parentElement){
            if(element.parentElement.matches(selector)){
                return element.parentElement
            }
            element = element.parentElement
        }
    }
    function validate(inputElement, rule) {
        var errElement = getParent(inputElement,option.formGroupSelector).querySelector(option.errorSelector)
        var errorMessage
        var rules = selectorRules[rule.selector]
        for (var i = 0; i < rules.length; i++) {
            switch (inputElement.type){
                case 'radio':
                case 'checkbox':
                    errorMessage = rules[i](
                        formElement.querySelector(rule.selector + ':checked')
                    )
                    break;
                default:
                    errorMessage = rules[i](inputElement.value)

            }
            if(errorMessage) break
        }
        if (errorMessage) {
            errElement.innerHTML = errorMessage
            getParent(inputElement,option.formGroupSelector).classList.add('invalid')
        } else {
            errElement.innerHTML = ''
            getParent(inputElement,option.formGroupSelector).classList.remove('invalid')
        }
        return !errorMessage
    }
    var formElement = document.querySelector(option.form)
    if (formElement) {
        formElement.onsubmit = function(e) {
            e.preventDefault()
            var isFormValid = true
            option.rules.forEach(function(rule) {
                var inputElement = formElement.querySelector(rule.selector)
                var isValid = validate(inputElement, rule)
                if(!isValid) {
                    isFormValid = false
                }
            })
            if(isFormValid){
                if(typeof option.onSubmit === 'function'){
                    var enableInputs = formElement.querySelectorAll('[name]')
                    var formValues = Array.from(enableInputs).reduce(function(values,input){
                        switch (input.type){
                            case 'radio':
                                values[input.name] = formElement.querySelector('input[name="'+input.name+'"]:checked').value
                                break;
                            case 'checkbox':
                                if(!input.matches(':checked')){
                                    values[input.name] = ''
                                    return values
                                }  
                                if(!Array.isArray(values[input.name])){
                                    values[input.name] = []
                                }
                                values[input.name].push(input.value)
                                break;
                            case 'file':
                                values[input.name] = input.files
                                break;
                            default:
                                values[input.name] = input.value
                        }
                        return values
                    },{})
                    option.onSubmit(formValues)
                }else{
                    formElement.submit()
                }
            }
        }
        // lặp qua mỗi rule và xử lý
        option.rules.forEach(function (rule) {
            if(Array.isArray(selectorRules[rule.selector])){
                selectorRules[rule.selector].push(rule.test)
            }else{
                selectorRules[rule.selector] = [rule.test]
            }
            var inputElements = formElement.querySelectorAll(rule.selector)

            Array.from(inputElements).forEach(function(inputElement) {
                inputElement.onblur = function () {
                    validate(inputElement, rule)
                }
                inputElement.oninput = function () {
                    var errElement = getParent(inputElement,option.formGroupSelector).querySelector(option.errorSelector)
                    errElement.innerHTML = ''
                    getParent(inputElement,option.formGroupSelector).classList.remove('invalid')
                }
            })
        })
    }
}

validator.isRequired = function (selector,mess) {
    return {
        selector: selector,
        test: function (value) {
            return value ? undefined : mess||'Vui Lòng nhập trường này!'
        }
    }
}
validator.isEmail = function (selector,mess) {
    return {
        selector: selector,
        test: function (value) {
            var regex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/
            return regex.test(value) ? undefined : mess||'Chưa đúng định dạng Email';
        }
    }
}
validator.minLength = function (selector,min,mess) {
    return {
        selector: selector,
        test: function (value) {
            return value.length >= min ? undefined : mess||`Vui lòng nhập tối thiểu ${min} kí tự`
        }
    }
}
validator.isConfirmed = function (selector,getPassword,mess) {
    return {
        selector: selector,
        test: function (value) {
            return value === getPassword() ? undefined : mess||'Giá trị nhập vào chưa chính xác'
        }
    }
}