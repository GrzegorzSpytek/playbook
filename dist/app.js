window.onload = function () {
    var SUM_TEMPLATE = "Sum: {amountPln} PLN ({amountEur} EUR)";
    var transactionInput = document.getElementById('titleOfTransaction');
    var amountInput = document.getElementById('amount');
    var exchangeRateInput = document.getElementById('exchangeRate');
    var addButton = document.getElementById('addButton');
    var updateButton = document.getElementById('updateButton');
    var restartButton = document.getElementById('restartButton');
    var tableHeaders = Array.prototype.slice.call(document.getElementsByTagName('th'));
    var rowCounter = 1;
    var lastSortedElement = 0;
    addButton.addEventListener("click", function () {
        var isNotValid = !validateUserInput();
        if (isNotValid)
            return;
        var title = transactionInput.value;
        var amount = amountInput.value;
        var row = addRow(title, amount);
        var table = document.getElementsByTagName('table')[0];
        table.appendChild(row);
        updateSumValue();
        transactionInput.value = '';
        amountInput.value = '';
        defaultSortTable();
    });
    amountInput.addEventListener("keyup", function () {
        validationForROundDecimalPoint(this);
    });
    exchangeRateInput.addEventListener("keyup", function () {
        validationForROundDecimalPoint(this, 3);
    });
    updateButton.addEventListener("click", function () {
        var isNotValid = !validateForClickUpdateButton();
        if (isNotValid)
            return;
        recalculateAmountInEur();
    });
    restartButton.addEventListener("click", function () {
        defaultSortTable();
    });
    tableHeaders.forEach(function (element, index) {
        element.addEventListener("click", function () {
            if (index > 2)
                return;
            var clickedHeaderId = Number(this.id.split('_')[1]);
            sortTable(clickedHeaderId);
        });
    });
    function validateUserInput() {
        var isValid = 1;
        var characterNumbers = transactionInput.value.length;
        var amount = Number(amountInput.value);
        var exchangeRate = Number(exchangeRateInput.value);
        if (characterNumbers < 5) {
            callAlert(transactionInput, alert('please type at least 5 characters'));
            isValid = 0;
        }
        else if (!amount) {
            callAlert(amountInput, alert('Insert right amount'));
            isValid = 0;
        }
        else if (amount < 0) {
            callAlert(amountInput, alert('The amount cannot be negative'));
            isValid = 0;
        }
        else if (!exchangeRate) {
            callAlert(exchangeRateInput, alert('Insert exchange rate'));
            isValid = 0;
        }
        else if (exchangeRate < 0) {
            callAlert(exchangeRateInput, alert('The exchange rate cannot be negative'));
            isValid = 0;
        }
        return Boolean(isValid);
    }
    function validateForClickUpdateButton() {
        var isValid = 1;
        var isTableExist = isAnyRowInTable();
        var amount = Number(amountInput.value);
        var exchangeRate = Number(exchangeRateInput.value);
        if (!exchangeRate) {
            callAlert(exchangeRateInput, alert('Insert exchange rate'));
            isValid = 0;
        }
        else if (exchangeRate < 0) {
            callAlert(exchangeRateInput, alert('The exchange rate cannot be negative'));
            isValid = 0;
        }
        else if (amount < 0) {
            callAlert(amountInput, alert('The amount cannot be negative'));
            isValid = 0;
        }
        else if (!isTableExist) {
            alert('Insert any value to update table');
            isValid = 0;
        }
        return Boolean(isValid);
    }
    function validationForROundDecimalPoint(inputField, decimalPointLength) {
        if (decimalPointLength === void 0) { decimalPointLength = 2; }
        var inputValue = inputField.value;
        var inputValueDecimalPoint = inputValue.split(".")[1] || '0';
        var inputValueDecimalPointCounter = inputValueDecimalPoint.length;
        if (!inputValueDecimalPoint)
            return;
        if (inputValueDecimalPointCounter > decimalPointLength) {
            alert("Cannot accept more then ".concat(decimalPointLength.toString(), " digits after the decimal point"));
            inputField.value = parseFloat(inputValue).toFixed(decimalPointLength);
        }
    }
    function addRow(title, amount) {
        var row = document.createElement('tr');
        row.id = "row_" + rowCounter;
        var column;
        var exchangeRate = Number(exchangeRateInput.value);
        for (var i = 0; i < 4; i++) {
            var text = ((i === 0) ? title : (i === 1) ? amount : (i === 2) ? String(calculatePlnToEur(Number(amount), exchangeRate)) : '');
            var id = ((i === 0) ? 'titleTd' : (i === 1) ? 'amountPlnTd' : (i === 2) ? 'amountEurTd' : '');
            column = createColumn(text, id);
            if (i == 3) {
                createDeleteButton(column);
            }
            row.appendChild(column);
        }
        rowCounter++;
        return row;
        function createColumn(value, id) {
            if (id === void 0) { id = ''; }
            var column = document.createElement('td');
            column.id = id;
            column.innerText = value;
            return column;
        }
        function createDeleteButton(column) {
            var button = document.createElement('button');
            button.id = 'deleteButton';
            button.innerText = 'Delete';
            button.id = 'deleteButton';
            column.appendChild(button);
            button.addEventListener("click", function () {
                var rowId = this.closest("tr").id;
                deleteRow(rowId);
                updateSumValue();
            });
        }
        function deleteRow(rowId) {
            var rowToDelete = document.getElementById(rowId);
            if (!rowToDelete)
                return;
            rowToDelete.remove();
        }
    }
    function calculatePlnToEur(amountInPln, ExchangeRate) {
        return Number((amountInPln * ExchangeRate).toFixed(2));
    }
    function updateSumValue() {
        var totalPln = sumAllPlnAmounts();
        var totalEur = sumAllEurAmounts();
        var sum = document.getElementById('sum');
        var filledSumTemplate = SUM_TEMPLATE.replace('{amountPln}', totalPln.toFixed(2)).replace('{amountEur}', totalEur.toFixed(2));
        sum.innerText = filledSumTemplate;
    }
    function sumAllPlnAmounts() {
        var valuesArray = [];
        var allValuesArray = document.querySelectorAll('#amountPlnTd');
        allValuesArray.forEach(function (element) {
            valuesArray.push(Number(element.innerHTML));
        });
        var getTotal = function (total, num) { return Number((total + num).toFixed(2)); };
        var sum = valuesArray.reduce(getTotal, 0);
        return sum;
    }
    function sumAllEurAmounts() {
        var valuesArray = [];
        var allValuesArray = document.querySelectorAll('#amountEurTd');
        allValuesArray.forEach(function (element) {
            valuesArray.push(Number(element.innerHTML));
        });
        var getTotal = function (total, num) { return Number((total + num).toFixed(2)); };
        var sum = valuesArray.reduce(getTotal, 0);
        return sum;
    }
    function recalculateAmountInEur() {
        var exchangeRate = Number(exchangeRateInput.value);
        var allValuesArray = document.querySelectorAll('#amountPlnTd');
        allValuesArray.forEach(function (element) {
            var plnValue = Number(element.innerHTML);
            var eurValue = calculatePlnToEur(plnValue, exchangeRate);
            var sibling = element.nextSibling;
            sibling.innerText = eurValue.toString();
        });
        updateSumValue();
    }
    function callAlert(inputField, alertMessage) {
        var changeInputBackground = function (inputField, color) { return inputField.style.backgroundColor = color; };
        changeInputBackground(inputField, 'red');
        alertMessage;
        inputField.addEventListener("click", function () {
            changeInputBackground(inputField, null);
            inputField.removeEventListener("click", function () { return inputField; });
        });
    }
    function isAnyRowInTable() {
        var allValuesArray = document.querySelectorAll('#amountPlnTd');
        return allValuesArray.length;
    }
    function defaultSortTable() {
        var i;
        var shouldSwitch = false;
        var switching = true;
        while (switching) {
            switching = false;
            var rows = document.querySelectorAll("tr");
            for (i = 1; i < (rows.length - 1); i++) {
                shouldSwitch = false;
                var x = Number(rows[i].id.split("_")[1]);
                var y = Number(rows[i + 1].id.split("_")[1]);
                ;
                if (x > y) {
                    tableHeaders.forEach(function (thElement) {
                        clearArrows(thElement.children[0]);
                    });
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
    function sortTable(column) {
        var columnId = column - 1;
        var i;
        var shouldSwitch = false;
        var switchCount = 0;
        var switching = true;
        var sortingDirection = "asc";
        var tableHeadersClicked = document.getElementsByTagName("th")[columnId];
        var arrowElement = tableHeadersClicked.children[0];
        while (switching) {
            switching = false;
            var rows = document.querySelectorAll("tr");
            for (i = 1; i < (rows.length - 1); i++) {
                shouldSwitch = false;
                var x = rows[i].getElementsByTagName("td")[columnId];
                var y = rows[i + 1].getElementsByTagName("td")[columnId];
                if (sortingDirection === "asc") {
                    if (x.innerText.toLowerCase() > y.innerHTML.toLowerCase()) {
                        tableHeaders.forEach(function (thElement) {
                            clearArrows(thElement.children[0]);
                        });
                        arrowElement.classList.value = "arrowUp";
                        shouldSwitch = true;
                        break;
                    }
                }
                else if (sortingDirection === "desc") {
                    if (x.innerText.toLowerCase() < y.innerHTML.toLowerCase()) {
                        tableHeaders.forEach(function (thElement) {
                            clearArrows(thElement.children[0]);
                        });
                        arrowElement.classList.value = "arrowDown";
                        shouldSwitch = true;
                        break;
                    }
                }
            }
            if (switchCount === 0)
                lastSortedElement = column;
            if (shouldSwitch) {
                rows[i].parentNode.insertBefore(rows[i + 1], rows[i]);
                switching = true;
                switchCount++;
            }
            else {
                if (switchCount === 0 && sortingDirection === "asc" && lastSortedElement == column) {
                    sortingDirection = "desc";
                    switching = true;
                }
            }
        }
    }
    function clearArrows(arrow) {
        if (arrow) {
            arrow.classList.add("arrowNone");
            arrow.classList.remove("arrowUp");
            arrow.classList.remove("arrowDown");
        }
    }
};
