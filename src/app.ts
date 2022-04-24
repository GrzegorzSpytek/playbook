window.onload = () => {
    const SUM_TEMPLATE: String = "Sum: {amountPln} PLN ({amountEur} EUR)";

    const transactionInput: HTMLInputElement = document.getElementById('titleOfTransaction') as HTMLInputElement;
    const amountInput: HTMLInputElement = document.getElementById('amount') as HTMLInputElement;
    const exchangeRateInput: HTMLInputElement = document.getElementById('exchangeRate') as HTMLInputElement;
    const addButton: HTMLButtonElement = document.getElementById('addButton') as HTMLButtonElement;
    const updateButton: HTMLButtonElement = document.getElementById('updateButton') as HTMLButtonElement;
    const restartButton: HTMLButtonElement = document.getElementById('restartButton') as HTMLButtonElement;
    const tableHeaders: Array < HTMLElement > = Array.prototype.slice.call(document.getElementsByTagName('th'));

    let rowCounter: number = 1;
    let lastSortedElement: number = 0;

    addButton.addEventListener("click", function () {
        const isNotValid: boolean = !validateUserInput();
        if (isNotValid) return

        const title: string = transactionInput.value;
        const amount: string = amountInput.value;
        const row: HTMLTableRowElement = addRow(title, amount);
        const table: HTMLTableElement = document.getElementsByTagName('table')[0] as HTMLTableElement;
        table.appendChild(row);
        updateSumValue();

        transactionInput.value = '';
        amountInput.value = '';
        defaultSortTable();
    })

    amountInput.addEventListener("keyup", function () {
        validationForROundDecimalPoint(this)
    })

    exchangeRateInput.addEventListener("keyup", function () {
        validationForROundDecimalPoint(this, 3)
    })

    updateButton.addEventListener("click", function () {
        const isNotValid: boolean = !validateForClickUpdateButton();
        if (isNotValid) return

        recalculateAmountInEur();
    })

    restartButton.addEventListener("click", function () {
        defaultSortTable();
    })

    tableHeaders.forEach((element: HTMLElement, index: number) => {
        element.addEventListener("click", function () {
            if (index > 2) return

            const clickedHeaderId: number = Number(this.id.split('_')[1]);
            sortTable(clickedHeaderId);
        })
    })

    function validateUserInput(): boolean {
        let isValid: number = 1;
        const characterNumbers: number = transactionInput.value.length;
        const amount: number = Number(amountInput.value);
        const exchangeRate: number = Number(exchangeRateInput.value);

        if (characterNumbers < 5) {
            callAlert(transactionInput, alert('please type at least 5 characters'))

            isValid = 0;
        } else if (!amount) {
            callAlert(amountInput, alert('Insert right amount'))

            isValid = 0;
        } else if (amount < 0) {
            callAlert(amountInput, alert('The amount cannot be negative'))

            isValid = 0;
        } else if (!exchangeRate) {
            callAlert(exchangeRateInput, alert('Insert exchange rate'))

            isValid = 0;
        } else if (exchangeRate < 0) {
            callAlert(exchangeRateInput, alert('The exchange rate cannot be negative'))

            isValid = 0;
        }

        return Boolean(isValid);
    }

    function validateForClickUpdateButton(): boolean {
        let isValid: number = 1;
        const isTableExist: number = isAnyRowInTable();
        const amount: number = Number(amountInput.value);
        const exchangeRate: number = Number(exchangeRateInput.value);

        if (!exchangeRate) {
            callAlert(exchangeRateInput, alert('Insert exchange rate'))

            isValid = 0;

        } else if (exchangeRate < 0) {
            callAlert(exchangeRateInput, alert('The exchange rate cannot be negative'))

            isValid = 0;
        } else if (amount < 0) {
            callAlert(amountInput, alert('The amount cannot be negative'))

            isValid = 0;
        } else if (!isTableExist) {
            alert('Insert any value to update table');

            isValid = 0;

        }

        return Boolean(isValid);
    }

    function validationForROundDecimalPoint(inputField: HTMLInputElement, decimalPointLength: number = 2): void {
        const inputValue: string = inputField.value;
        const inputValueDecimalPoint: string = inputValue.split(".")[1] || '0';
        const inputValueDecimalPointCounter: number = inputValueDecimalPoint.length;

        if (!inputValueDecimalPoint) return
        if (inputValueDecimalPointCounter > decimalPointLength) {
            alert(`Cannot accept more then ${decimalPointLength.toString()} digits after the decimal point`);
            inputField.value = parseFloat(inputValue).toFixed(decimalPointLength);
        }
    }

    function addRow(title: string, amount: string): HTMLTableRowElement {
        const row: HTMLTableRowElement = document.createElement('tr');
        row.id = "row_" + rowCounter;
        let column: HTMLTableCellElement;
        let exchangeRate: number = Number(exchangeRateInput.value)

        for (let i = 0; i < 4; i++) {
            let text: string = ((i === 0) ? title : (i === 1) ? amount : (i === 2) ? String(calculatePlnToEur(Number(amount), exchangeRate)) : '')
            let id: string = ((i === 0) ? 'titleTd' : (i === 1) ? 'amountPlnTd' : (i === 2) ? 'amountEurTd' : '')
            column = createColumn(text, id);

            if (i == 3) {
                createDeleteButton(column);
            }

            row.appendChild(column);
        }
        rowCounter++;
        return row;

        function createColumn(value: string, id: string = ''): HTMLTableCellElement {
            const column: HTMLTableCellElement = document.createElement('td');
            column.id = id
            column.innerText = value;

            return column;
        }

        function createDeleteButton(column: HTMLTableCellElement): void {
            const button: HTMLButtonElement = document.createElement('button');
            button.id = 'deleteButton';
            button.innerText = 'Delete';
            button.id = 'deleteButton';
            column.appendChild(button);

            button.addEventListener("click", function () {
                const rowId: string = this.closest("tr").id
                deleteRow(rowId);
                updateSumValue();
            })
        }

        function deleteRow(rowId: string): void {
            const rowToDelete: HTMLTableRowElement = document.getElementById(rowId) as HTMLTableRowElement;
            if (!rowToDelete) return
            rowToDelete.remove();
        }
    }

    function calculatePlnToEur(amountInPln: number, ExchangeRate: number): number {
        return Number((amountInPln * ExchangeRate).toFixed(2));
    }

    function updateSumValue(): void {
        const totalPln: number = sumAllPlnAmounts();
        const totalEur: number = sumAllEurAmounts();
        const sum: HTMLElement = document.getElementById('sum');
        const filledSumTemplate: string = SUM_TEMPLATE.replace('{amountPln}', totalPln.toFixed(2)).replace('{amountEur}', totalEur.toFixed(2))
        sum.innerText = filledSumTemplate
    }

    function sumAllPlnAmounts(): number {
        const valuesArray: number[] = [];
        const allValuesArray: NodeListOf < HTMLElement > = document.querySelectorAll('#amountPlnTd');
        allValuesArray.forEach(element => {
            valuesArray.push(Number(element.innerHTML))
        })

        const getTotal = (total: number, num: number): number => Number((total + num).toFixed(2));
        const sum: number = valuesArray.reduce(getTotal, 0);

        return sum
    }

    function sumAllEurAmounts(): number {
        const valuesArray: number[] = [];
        const allValuesArray: NodeListOf < HTMLElement > = document.querySelectorAll('#amountEurTd');
        allValuesArray.forEach(element => {
            valuesArray.push(Number(element.innerHTML))
        })

        const getTotal = (total: number, num: number): number => Number((total + num).toFixed(2));
        const sum: number = valuesArray.reduce(getTotal, 0);

        return sum
    }

    function recalculateAmountInEur(): void {
        let exchangeRate: number = Number(exchangeRateInput.value);
        const allValuesArray: NodeListOf < HTMLElement > = document.querySelectorAll('#amountPlnTd');
        allValuesArray.forEach(element => {
            const plnValue: number = Number(element.innerHTML);
            const eurValue: number = calculatePlnToEur(plnValue, exchangeRate);
            const sibling: HTMLElement = element.nextSibling as HTMLElement;

            sibling.innerText = eurValue.toString();
        })

        updateSumValue();
    }

    function callAlert(inputField: HTMLInputElement, alertMessage: void): void {
        const changeInputBackground = (inputField: HTMLInputElement, color: string) => inputField.style.backgroundColor = color;

        changeInputBackground(inputField, 'red');
        alertMessage;
        inputField.addEventListener("click", function () {
            changeInputBackground(inputField, null)
            inputField.removeEventListener("click", () => inputField)
        })
    }

    function isAnyRowInTable(): number {
        const allValuesArray: NodeListOf < HTMLElement > = document.querySelectorAll('#amountPlnTd');
        return allValuesArray.length
    }

    function defaultSortTable() {
        let i: number;
        let shouldSwitch: boolean = false;
        let switching: boolean = true;
        while (switching) {
            switching = false;
            const rows: NodeListOf < HTMLTableRowElement > = document.querySelectorAll("tr");

            for (i = 1; i < (rows.length - 1); i++) {
                shouldSwitch = false;
                const x: number = Number(rows[i].id.split("_")[1]);
                const y: number = Number(rows[i + 1].id.split("_")[1]);;

                if (x > y) {
                    tableHeaders.forEach((thElement: HTMLElement) => {
                        clearArrows(thElement.children[0] as HTMLElement);
                    })
                    shouldSwitch = true;
                    break;
                }
            }

            if (shouldSwitch) {
                rows[i].parentNode.insertBefore(rows[i + 1], rows[i]);
                switching = true;
            }
        }
    }

    function sortTable(column: number): void {
        let columnId: number = column - 1;
        let i: number;
        let shouldSwitch: boolean = false;
        let switchCount: number = 0;
        let switching: boolean = true;
        let sortingDirection: string = "asc";
        const tableHeadersClicked: HTMLTableCellElement = document.getElementsByTagName("th")[columnId];
        const arrowElement: HTMLTableElement = tableHeadersClicked.children[0] as HTMLTableElement;

        while (switching) {
            switching = false;
            const rows: NodeListOf < HTMLTableRowElement > = document.querySelectorAll("tr");

            for (i = 1; i < (rows.length - 1); i++) {
                shouldSwitch = false;
                const x: HTMLTableCellElement = rows[i].getElementsByTagName("td")[columnId];
                const y: HTMLTableCellElement = rows[i + 1].getElementsByTagName("td")[columnId];

                if (sortingDirection === "asc") {
                    if (x.innerText.toLowerCase() > y.innerHTML.toLowerCase()) {
                        tableHeaders.forEach((thElement: HTMLElement) => {
                            clearArrows(thElement.children[0] as HTMLElement);
                        })
                        arrowElement.classList.value = "arrowUp";
                        shouldSwitch = true;
                        break;
                    }
                } else if (sortingDirection === "desc") {
                    if (x.innerText.toLowerCase() < y.innerHTML.toLowerCase()) {
                        tableHeaders.forEach((thElement: HTMLElement) => {
                            clearArrows(thElement.children[0] as HTMLElement);
                        })
                        arrowElement.classList.value = "arrowDown";
                        shouldSwitch = true;
                        break;
                    }
                }
            }

            if (switchCount === 0) lastSortedElement = column;

            if (shouldSwitch) {
                rows[i].parentNode.insertBefore(rows[i + 1], rows[i]);
                switching = true;
                switchCount++;
            } else {
                if (switchCount === 0 && sortingDirection === "asc" && lastSortedElement == column) {
                    sortingDirection = "desc";
                    switching = true;
                }
            }
        }
    }

    function clearArrows(arrow: HTMLElement) {
        if (arrow) {
            arrow.classList.add("arrowNone");
            arrow.classList.remove("arrowUp");
            arrow.classList.remove("arrowDown");
        }
    }
}