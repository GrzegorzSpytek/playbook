window.onload = function () {
    var SUM_TEMPLATE = "Sum: {amountPln} PLN ({amountEur} EUR)";
    var transactionInput = document.getElementById('titleOfTransaction');
    var amountInput = document.getElementById('amount');
    var exchangeRateInput = document.getElementById('exchangeRate');
    var addButton = document.getElementById('addButton');
    var updateButton = document.getElementById('updateButton');
    var tableHeader = Array.prototype.slice.call(document.getElementsByTagName('th'));
    var rowCounter = 1;
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
    });
    amountInput.addEventListener("keyup", function () {
        CheckForRoundingDecimalPoint(this);
    });
    exchangeRateInput.addEventListener("keyup", function () {
        CheckForRoundingDecimalPoint(this, 3);
    });
    updateButton.addEventListener("click", function () {
        var isNotValid = !validateForClickUpdateButton();
        if (isNotValid)
            return;
        recalculateAmountInEur();
    });
    tableHeader.forEach(function (element, index) {
        element.addEventListener("click", function () {
            if (index > 2)
                return;
            var clickedHeaderId = this.id.split('_')[1];
            sortTable(clickedHeaderId);
        });
    });
    function validateUserInput() {
        var isValid = 1;
        var characterNumbers = transactionInput.value.length;
        var amount = Number(amountInput.value);
        var exchangeRate = Number(exchangeRateInput.value);
        var changeInputBackground = function (transactionInput, color) { return transactionInput.style.backgroundColor = color; };
        if (characterNumbers < 5) {
            callAlter(transactionInput, alert('please type at least 5 characters'));
            isValid = 0;
        }
        else if (!amount) {
            callAlter(amountInput, alert('Insert right amount'));
            isValid = 0;
        }
        else if (!exchangeRate) {
            callAlter(exchangeRateInput, alert('Insert exchange rate'));
            isValid = 0;
        }
        return isValid;
    }
    function validateForClickUpdateButton() {
        var isValid = 1;
        var allValuesArray = document.querySelectorAll('#amountPlnTd');
        var exchangeRate = Number(exchangeRateInput.value);
        if (!exchangeRate) {
            callAlter(exchangeRateInput, alert('Insert exchange rate'));
            isValid = 0;
        }
        else if (!allValuesArray.length) {
            alert('Insert any value to update table');
            isValid = 0;
        }
        return isValid;
    }
    function CheckForRoundingDecimalPoint(inputField, decimalPointLength) {
        if (decimalPointLength === void 0) { decimalPointLength = 2; }
        var inputValue = inputField.value;
        var inputValueDecimalPoint = inputValue.split(".")[1] || 0;
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
    function callAlter(inputField, alertMessage) {
        var changeInputBackground = function (inputField, color) { return inputField.style.backgroundColor = color; };
        changeInputBackground(inputField, 'red');
        alertMessage;
        inputField.addEventListener("click", function () {
            changeInputBackground(inputField, null);
            inputField.removeEventListener("click", function () { return inputField; });
        });
    }
    function sortTable(n) {
        var columnId = n - 1;
        var i, shouldSwitch, dir, switchCount = 0;
        var switching = true;
        dir = "asc";
        while (switching) {
            switching = false;
            var rows = document.querySelectorAll("tr");
            for (i = 1; i < (rows.length - 1); i++) {
                shouldSwitch = false;
                var x = rows[i].getElementsByTagName("td")[columnId];
                var y = rows[i + 1].getElementsByTagName("td")[columnId];
                if (dir == "asc") {
                    if (x.innerText.toLowerCase() > y.innerHTML.toLowerCase()) {
                        shouldSwitch = true;
                        break;
                    }
                }
                else if (dir == "desc") {
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
            }
            else {
                if (switchCount == 0 && dir == "asc") {
                    dir = "desc";
                    switching = true;
                }
            }
        }
    }
};
