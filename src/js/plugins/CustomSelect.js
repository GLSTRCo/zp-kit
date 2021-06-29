import { fadeOut, fadeToggle } from '@/js/modules/ui';

export default class CustomSelect {
    /**
     * @param {HTMLElement} select
     * @param {Object} options
     * @param {Boolean} [options.multiple] - multiple choises
     * @param {String} [options.multipleCounterLabel]
     * @param {String} options.valueType - if defined set to value clicked el's data-valueType
     * @param {Function} [options.onSelect] - callback for selected element
     * TODO look for method to describe @param and @return of this function
     */

    constructor(select, options = {}) {
        if (!select) {
            throw new Error('No element has been passed');
        }
        this.select = select;
        this.options = options;

        this.setup();
    }

    setup() {
        /** @type {HTMLInputElement} */
        this.valueInput = this.select.querySelector('.custom-select__value');
        /** @type {HTMLButtonElement } */
        this.selected = this.select.querySelector('.custom-select__selected');
        /** @type {HTMLDivElement } */
        this.dropdown = this.select.querySelector('.custom-select__dropdown');
        /** @type { HTMLUListElement & { children: HTMLLIElement[] } } */
        this.optionsList = this.select.querySelector('.custom-select__options');

        this.inititalPlaceholder = this.selected.textContent.trim();

        // new SimpleBar(this.dropdown, {
        //     autoHide: false,
        // });

        /** keycodes */
        this.keyCodes = {
            enter: 13,
            down_arrow: 40,
            up_arrow: 38,
            escape: 27,
        };

        if (this.options.multiple) {
            this.multipleCounter = 0;
            this.optionsList.classList.add('multiple');
        }

        this.setEventHandlers();
    }

    setEventHandlers() {
        this.selected.addEventListener('keydown', e =>
            this.toggleOptionsList(e)
        );
        this.selected.addEventListener('click', e => this.toggleOptionsList(e));

        this.optionsList.addEventListener(
            'click',
            /**
             *
             * @param { MouseEvent & { target: HTMLLIElement } } e
             */
            e => {
                const target = e.target;
                if (target.classList.contains('custom-select__option')) {
                    this.selectItem(e);
                }
            }
        );

        this.optionsList.addEventListener(
            'keydown',
            /**
             *
             * @param { KeyboardEvent & { target: HTMLLIElement } } e
             */
            e => {
                const target = e.target;

                if (target.classList.contains('custom-select__option')) {
                    switch (e.keyCode) {
                        case this.keyCodes.enter:
                            this.selectItem(e);

                            return;

                        case this.keyCodes.down_arrow:
                            e.preventDefault();

                            this.focusNextListItem(this.keyCodes.down_arrow);
                            return;

                        case this.keyCodes.up_arrow:
                            e.preventDefault();

                            this.focusNextListItem(this.keyCodes.up_arrow);
                            return;

                        case this.keyCodes.escape:
                            this.closeOptionsList();
                            return;

                        default:
                            return;
                    }
                }
            }
        );

        document.addEventListener('click', e => {
            if (!(e.target instanceof HTMLElement)) return;

            if (
                !this.select.contains(e.target) &&
                this.dropdown.classList.contains('opened')
            ) {
                this.closeOptionsList();
            }
        });
    }

    toggleOptionsList(e) {
        if (e.keyCode === this.keyCodes.escape) {
            this.closeOptionsList();
        }

        if (e.type === 'click') {
            this.select.classList.toggle('opened');
            this.dropdown.classList.toggle('opened');
            this.selected.classList.toggle('opened');

            this.dropdown.setAttribute(
                'aria-expanded',
                this.dropdown.classList.contains('opened').toString()
            );

            fadeToggle(this.dropdown);
        }

        if (e.keyCode === this.keyCodes.down_arrow) {
            e.preventDefault();

            this.focusNextListItem(this.keyCodes.down_arrow);
        }

        if (e.keyCode === this.keyCodes.up_arrow) {
            e.preventDefault();

            this.focusNextListItem(this.keyCodes.up_arrow);
        }
    }

    closeOptionsList() {
        this.select.classList.remove('opened');
        this.dropdown.classList.remove('opened');
        this.selected.classList.remove('opened');
        this.dropdown.setAttribute('aria-expanded', 'false');
        fadeOut(this.dropdown);
    }

    /**
     *
     *
     * @param {number} direction
     * @memberof CustomSelect
     */
    focusNextListItem(direction) {
        const activeElement = document.activeElement;
        const options = [...this.optionsList.children];
        if (activeElement.classList.contains('custom-select__selected')) {
            const firstChild = this.optionsList.children[0];
            firstChild.focus();
        } else if (activeElement instanceof HTMLLIElement) {
            const currentActiveElementIndex = options.indexOf(activeElement);
            if (direction === this.keyCodes.down_arrow) {
                const currentActiveElementIsNotLastItem =
                    currentActiveElementIndex < options.length - 1;
                if (currentActiveElementIsNotLastItem) {
                    const nextListItem = options[currentActiveElementIndex + 1];

                    nextListItem.focus();
                }
            } else if (direction === this.keyCodes.up_arrow) {
                const currentActiveElementIsNotFirstItem =
                    currentActiveElementIndex > 0;
                if (currentActiveElementIsNotFirstItem) {
                    const nextListItem = options[currentActiveElementIndex - 1];
                    nextListItem.focus();
                }
            }
        }
    }

    selectItem(e) {
        const selectedValue = e.target.textContent.trim();
        if (this.options.multiple) {
            this.multipleSelectLogic(e, selectedValue);
        } else {
            this.singleSelectLogic(e, selectedValue);
        }
    }

    setSelected(value) {
        this.selected.textContent = value;

        if (this.valueInput) {
            if (this.options.valueType) {
                this.valueInput.value =
                    this.selected.dataset[this.options.valueType];
            } else {
                this.valueInput.value = value;
            }
        }
    }

    clearSelected() {
        this.selected.textContent = this.inititalPlaceholder;
        if (this.valueInput) {
            this.valueInput.value = null;
        }

        if (this.multipleCounter) {
            this.multipleCounter = 0;
        }
    }

    singleSelectLogic(e, selectedValue) {
        /** clicked item was already selected */
        if (this.selected.textContent === selectedValue) {
            this.closeOptionsList();
            return;
        }

        this.selected.textContent = selectedValue;

        if (this.valueInput) {
            if (this.options.valueType) {
                this.valueInput.value = e.target.dataset[this.options.valueType]
                    ? e.target.dataset[this.options.valueType]
                    : 0;
            } else {
                this.valueInput.value = selectedValue;
            }
        }

        this.closeOptionsList();

        if (typeof this.options.onSelect === 'function') {
            const res = {
                el: e.target,
                value: selectedValue,
            };
            if (this.options.valueType)
                res[this.options.valueType] = this.options.valueType;
            this.options.onSelect(res);
        }
    }

    multipleSelectLogic(e, selectedValue) {
        const valueDivider = ';';
        const action = e.target.classList.contains('selected')
            ? 'remove'
            : 'add';
        if (action === 'remove') {
            e.target.classList.remove('selected');
            this.multipleCounter--;

            if (this.valueInput) {
                this.valueInput.value = this.valueInput.value
                    .split(valueDivider)
                    .filter(val => val !== selectedValue)
                    .join(valueDivider);
            }
        } else {
            e.target.classList.add('selected');
            this.multipleCounter++;

            if (this.valueInput) {
                this.valueInput.value += selectedValue + valueDivider;
            }
        }

        if (this.multipleCounter === 0) {
            this.selected.textContent = this.inititalPlaceholder;
        } else {
            this.selected.textContent = `${this.options.multipleCounterLabel}: ${this.multipleCounter}`;
        }

        if (typeof this.options.onSelect === 'function') {
            const selectedItem = {
                value: selectedValue,
                id: e.target.dataset.id,
                action,
            };
            this.options.onSelect(selectedItem);
        }
    }
}
