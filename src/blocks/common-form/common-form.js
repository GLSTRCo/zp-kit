export default async function commonFormInit() {
    const form = document.querySelector('.common-form')
    const module = await import(
        /* webpackChunkName: "inputMethods" */
        '../custom-input/custom-input'
    );
    const InputMethods = await module.default();

    const allLabelledInputs = form.querySelectorAll('.custom-input__input');
    InputMethods.floatLabelsInit(allLabelledInputs);

    const requiredInputs = form.querySelectorAll(
        '.custom-input__input[required]'
    );
    requiredInputs.forEach(input => {
        InputMethods.handleTextInput(input);
    });

    const phoneInput = form.querySelector('#phone');
    InputMethods.setPhoneMask(phoneInput);

    InputMethods.handlePhoneInput(phoneInput);
}
