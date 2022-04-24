window.onload = () => {
    const SUM_TEMPLATE: String = "Sum: {amountPln} PLN ({amountEur} EUR)";

    const transactionInput: HTMLInputElement = document.getElementById('titleOfTransaction') as HTMLInputElement;
    const amountInput: HTMLInputElement = document.getElementById('amount') as HTMLInputElement;
    const exchangeRateInput: HTMLInputElement = document.getElementById('exchangeRate') as HTMLInputElement;
    const addButton: HTMLButtonElement = document.getElementById('addButton') as HTMLButtonElement;
    const updateButton: HTMLInputElement = document.getElementById('updateButton') as HTMLInputElement;
    const tableHeader = Array.prototype.slice.call(document.getElementsByTagName('th'));

    let rowCounter = 1;

    addButton.addEventListener("click", function () {
        const isNotValid = !validateUserInput();
        if (isNotValid) return

        const title: string = transactionInput.value;
        const amount: string = amountInput.value;
        const row = addRow(title, amount);
        const table = document.getElementsByTagName('table')[0];
        table.appendChild(row);
        updateSumValue();

        transactionInput.value = '';
        amountInput.value = '';
    })

    amountInput.addEventListener("keyup", function () {
        CheckForRoundingDecimalPoint(this)
    })

    exchangeRateInput.addEventListener("keyup", function () {
        CheckForRoundingDecimalPoint(this, 3)
    })

    updateButton.addEventListener("click", function () {
        const isNotValid = !validateForClickUpdateButton();
        if (isNotValid) return

        recalculateAmountInEur();
    })

    tableHeader.forEach((element, index) => {
        element.addEventListener("click", function () {
            if (index > 2) return 

            const clickedHeaderId = this.id.split('_')[1];
            sortTable(clickedHeaderId);
        })
    })



    function validateUserInput() {
        let isValid = 1;
        const characterNumbers: number = transactionInput.value.length;
        const amount: number = Number(amountInput.value);
        const exchangeRate: number = Number(exchangeRateInput.value);
        const changeInputBackground = (transactionInput, color) => transactionInput.style.backgroundColor = color;

        if (characterNumbers < 5) {
            callAlter(transactionInput, alert('please type at least 5 characters'))

            isValid = 0;
        } else if (!amount) {
            callAlter(amountInput, alert('Insert right amount'))

            isValid = 0;
        } else if (!exchangeRate) {
            callAlter(exchangeRateInput, alert('Insert exchange rate'))

            isValid = 0;
        }

        return isValid;
    }

    function validateForClickUpdateButton() {
        let isValid = 1;
        const allValuesArray = document.querySelectorAll('#amountPlnTd');
        const exchangeRate: number = Number(exchangeRateInput.value);

        if (!exchangeRate) {
            callAlter(exchangeRateInput, alert('Insert exchange rate'))

            isValid = 0;

        } else if (!allValuesArray.length) {
            alert('Insert any value to update table');

            isValid = 0;

        }

        return isValid;
    }

    function CheckForRoundingDecimalPoint(inputField, decimalPointLength = 2) {
        const inputValue = inputField.value;
        const inputValueDecimalPoint = inputValue.split(".")[1] || 0;
        const inputValueDecimalPointCounter = inputValueDecimalPoint.length;

        if (!inputValueDecimalPoint) return
        if (inputValueDecimalPointCounter > decimalPointLength) {
            alert(`Cannot accept more then ${decimalPointLength.toString()} digits after the decimal point`)
            inputField.value = parseFloat(inputValue).toFixed(decimalPointLength);
        }
    }

    function addRow(title: string, amount: string) {
        const row = document.createElement('tr');
        row.id = "row_" + rowCounter;
        let column;
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

        function createColumn(value: string, id: string = '') {
            const column = document.createElement('td');
            column.id = id
            column.innerText = value;

            return column;
        }

        function createDeleteButton(column) {
            const button = document.createElement('button');
            button.id = 'deleteButton';
            button.innerText = 'Delete';
            button.id = 'deleteButton';
            column.appendChild(button);

            button.addEventListener("click", function () {
                const rowId = this.closest("tr").id
                deleteRow(rowId);
                updateSumValue();
            })
        }

        function deleteRow(rowId: string) {
            const rowToDelete = document.getElementById(rowId);
            if (!rowToDelete) return
            rowToDelete.remove();
        }
    }

    function calculatePlnToEur(amountInPln: number, ExchangeRate: number): number {
        return Number((amountInPln * ExchangeRate).toFixed(2));
    }

    function updateSumValue() {
        const totalPln = sumAllPlnAmounts();
        const totalEur: number = sumAllEurAmounts();
        const sum: HTMLElement = document.getElementById('sum');
        const filledSumTemplate = SUM_TEMPLATE.replace('{amountPln}', totalPln.toFixed(2)).replace('{amountEur}', totalEur.toFixed(2))
        sum.innerText = filledSumTemplate
    }

    function sumAllPlnAmounts(): number {
        const valuesArray = [];
        const allValuesArray = document.querySelectorAll('#amountPlnTd');
        allValuesArray.forEach(element => {
            valuesArray.push(Number(element.innerHTML))
        })

        const getTotal = (total: number, num: number): number => Number((total + num).toFixed(2));
        const sum = valuesArray.reduce(getTotal, 0);

        return sum
    }

    function sumAllEurAmounts(): number {
        const valuesArray = [];
        const allValuesArray = document.querySelectorAll('#amountEurTd');
        allValuesArray.forEach(element => {
            valuesArray.push(Number(element.innerHTML))
        })

        const getTotal = (total: number, num: number): number => Number((total + num).toFixed(2));
        const sum = valuesArray.reduce(getTotal, 0);

        return sum
    }

    function recalculateAmountInEur() {
        let exchangeRate: number = Number(exchangeRateInput.value);
        const allValuesArray = document.querySelectorAll('#amountPlnTd');
        allValuesArray.forEach(element => {
            const plnValue: number = Number(element.innerHTML);
            const eurValue: number = calculatePlnToEur(plnValue, exchangeRate);
            const sibling: HTMLElement = element.nextSibling as HTMLElement;

            sibling.innerText = eurValue.toString();
        })

        updateSumValue();
    }

    function callAlter(inputField, alertMessage) {
        const changeInputBackground = (inputField, color) => inputField.style.backgroundColor = color;

        changeInputBackground(inputField, 'red');
        alertMessage;
        inputField.addEventListener("click", function () {
            changeInputBackground(inputField, null)
            inputField.removeEventListener("click", () => inputField)
        })
    }

    function sortTable(n) {
        let columnId = n - 1
        let i,shouldSwitch, dir, switchCount = 0;
        let switching = true;
        dir = "asc";

        while (switching) {
            switching = false;
            const rows = document.querySelectorAll("tr");

            for (i = 1; i < (rows.length - 1); i++) {
                shouldSwitch = false;


                const x = rows[i].getElementsByTagName("td")[columnId];
                const y = rows[i + 1].getElementsByTagName("td")[columnId];

                if (dir == "asc") {
                    if (x.innerText.toLowerCase() > y.innerHTML.toLowerCase()) {
                        shouldSwitch = true;
                        break;
                    }
                } else if (dir == "desc") {
                    if (x.innerText.toLowerCase() < y.innerHTML.toLowerCase()) {
                        shouldSwitch = true;
                        break;
                    }
                }
            }

            if (shouldSwitch) {
                rows[i].parentNode.insertBefore(rows[i + 1], rows[i]);
                switching = true;
                switchCount++;
            } else {
                if (switchCount == 0 && dir == "asc") {
                    dir = "desc";
                    switching = true;
                }
            }
        }

    }
}